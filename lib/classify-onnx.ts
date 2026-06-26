import path from 'node:path';
import { access } from 'node:fs/promises';
import type { InferenceSession, Tensor } from 'onnxruntime-node';

// Class order MUST match the trained model (see models/metadata.yaml `names`).
export const CLASS_NAMES = [
  'scissors',
  'backpack',
  'pen',
  'pencil',
  'calculator',
  'notebook',
  'eraser',
  'ruler',
  'sharpener',
  'water_bottle',
];

export type OnnxDetection = {
  label: string;
  confidence: number;
};

const INPUT_SIZE = 640;
const CONF_THRESHOLD = 0.2;
const IOU_THRESHOLD = 0.45;
const PAD_VALUE = 114; // standard YOLO letterbox grey

// Cache the session across warm serverless invocations.
let sessionPromise: Promise<InferenceSession> | null = null;

function getModelPath() {
  return path.join(process.cwd(), 'models', 'yolo26n.onnx');
}

async function loadSession(): Promise<InferenceSession> {
  if (!sessionPromise) {
    sessionPromise = (async () => {
      const ort = await import('onnxruntime-node');
      const modelPath = getModelPath();
      await access(modelPath); // throws a clear ENOENT if the model is missing
      return ort.InferenceSession.create(modelPath, {
        // Single-threaded keeps cold starts predictable in the Lambda sandbox.
        intraOpNumThreads: 1,
        executionProviders: ['cpu'],
      });
    })().catch((error) => {
      // Reset so a transient failure can be retried on the next request.
      sessionPromise = null;
      throw error;
    });
  }

  return sessionPromise;
}

// Letterbox-resize to INPUT_SIZE and produce a normalized NCHW float tensor.
async function preprocess(buffer: Buffer): Promise<Float32Array> {
  const sharp = (await import('sharp')).default;

  const { data, info } = await sharp(buffer)
    .rotate() // honor EXIF orientation
    .removeAlpha()
    .resize(INPUT_SIZE, INPUT_SIZE, {
      fit: 'contain',
      background: { r: PAD_VALUE, g: PAD_VALUE, b: PAD_VALUE },
    })
    .raw()
    .toBuffer({ resolveWithObject: true });

  if (info.channels !== 3) {
    throw new Error(`Expected 3 channels after preprocessing, got ${info.channels}`);
  }

  const pixels = INPUT_SIZE * INPUT_SIZE;
  const chw = new Float32Array(3 * pixels);

  // HWC uint8 -> CHW float32 in [0, 1]
  for (let i = 0; i < pixels; i++) {
    chw[i] = data[i * 3] / 255; // R plane
    chw[i + pixels] = data[i * 3 + 1] / 255; // G plane
    chw[i + 2 * pixels] = data[i * 3 + 2] / 255; // B plane
  }

  return chw;
}

function labelFor(classId: number): string | null {
  return CLASS_NAMES[classId] ?? null;
}

// Greedy non-maximum suppression for raw (non-end2end) outputs.
function nms(boxes: Array<{ x1: number; y1: number; x2: number; y2: number; det: OnnxDetection }>) {
  boxes.sort((a, b) => b.det.confidence - a.det.confidence);
  const kept: typeof boxes = [];

  for (const box of boxes) {
    let overlaps = false;

    for (const keep of kept) {
      const ix1 = Math.max(box.x1, keep.x1);
      const iy1 = Math.max(box.y1, keep.y1);
      const ix2 = Math.min(box.x2, keep.x2);
      const iy2 = Math.min(box.y2, keep.y2);
      const iw = Math.max(0, ix2 - ix1);
      const ih = Math.max(0, iy2 - iy1);
      const inter = iw * ih;
      const areaA = (box.x2 - box.x1) * (box.y2 - box.y1);
      const areaB = (keep.x2 - keep.x1) * (keep.y2 - keep.y1);
      const iou = inter / (areaA + areaB - inter || 1);

      if (iou > IOU_THRESHOLD) {
        overlaps = true;
        break;
      }
    }

    if (!overlaps) kept.push(box);
  }

  return kept.map((box) => box.det);
}

function decode(output: Tensor): OnnxDetection[] {
  const data = output.data as Float32Array;
  const dims = output.dims as number[];

  // End-to-end export (metadata end2end: true): [1, N, 6] = [x1, y1, x2, y2, conf, classId].
  if (dims.length === 3 && dims[2] === 6) {
    const rows = dims[1];
    const detections: OnnxDetection[] = [];

    for (let i = 0; i < rows; i++) {
      const offset = i * 6;
      const confidence = data[offset + 4];

      if (confidence < CONF_THRESHOLD) continue;

      const label = labelFor(Math.round(data[offset + 5]));

      if (!label) continue;

      detections.push({
        label,
        confidence,
      });
    }

    detections.sort((a, b) => b.confidence - a.confidence);
    return detections;
  }

  // Raw export: [1, 4 + nc, A] (channels-first) or [1, A, 4 + nc] (channels-last).
  const nc = CLASS_NAMES.length;
  const attrs = 4 + nc;
  const channelsFirst = dims[1] === attrs;
  const channelsLast = dims[2] === attrs;

  if (!channelsFirst && !channelsLast) {
    throw new Error(`Unrecognized model output shape [${dims.join(', ')}]`);
  }

  const anchors = channelsFirst ? dims[2] : dims[1];
  const at = (anchor: number, attr: number) =>
    channelsFirst ? data[attr * anchors + anchor] : data[anchor * attrs + attr];

  const candidates: Array<{ x1: number; y1: number; x2: number; y2: number; det: OnnxDetection }> = [];

  for (let a = 0; a < anchors; a++) {
    let bestId = 0;
    let bestScore = 0;

    for (let c = 0; c < nc; c++) {
      const score = at(a, 4 + c);
      if (score > bestScore) {
        bestScore = score;
        bestId = c;
      }
    }

    if (bestScore < CONF_THRESHOLD) continue;

    const cx = at(a, 0);
    const cy = at(a, 1);
    const w = at(a, 2);
    const h = at(a, 3);

    candidates.push({
      x1: cx - w / 2,
      y1: cy - h / 2,
      x2: cx + w / 2,
      y2: cy + h / 2,
      det: { label: labelFor(bestId) || 'unknown', confidence: bestScore },
    });
  }

  return nms(candidates).sort((a, b) => b.confidence - a.confidence);
}

/**
 * Run the local YOLO ONNX model on an image buffer.
 * Returns detections sorted by confidence (highest first).
 * Works identically in local dev and on Vercel — no Python required.
 */
export async function classifyWithOnnx(buffer: Buffer): Promise<OnnxDetection[]> {
  const ort = await import('onnxruntime-node');
  const session = await loadSession();
  const input = await preprocess(buffer);

  const tensor = new ort.Tensor('float32', input, [1, 3, INPUT_SIZE, INPUT_SIZE]);
  const feeds: Record<string, Tensor> = { [session.inputNames[0]]: tensor };
  const results = await session.run(feeds);
  const output = results[session.outputNames[0]];

  return decode(output);
}
