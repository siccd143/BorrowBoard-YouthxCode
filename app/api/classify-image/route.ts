import { ItemCategory } from '@/lib/types';
import { classifyWithOnnx } from '@/lib/classify-onnx';

export const runtime = 'nodejs';
export const maxDuration = 30;

const ROBOFLOW_MODEL = process.env.ROBOFLOW_MODEL || 'school-supplies-gz456/1';

const categoryKeywords: Array<{ category: ItemCategory; keywords: string[] }> = [
  { category: 'calculator', keywords: ['calculator', 'ti84', 'ti-84', 'graphing'] },
  { category: 'charger', keywords: ['charger', 'usb', 'cable', 'adapter'] },
  { category: 'science', keywords: ['goggles', 'beaker', 'microscope', 'science', 'lab'] },
  { category: 'school-supply', keywords: ['ruler', 'pencil', 'pen', 'notebook', 'book', 'binder', 'folder', 'marker', 'eraser', 'sharpener', 'scissors'] },
  { category: 'robotics', keywords: ['tool', 'toolkit', 'wrench', 'screwdriver', 'robot'] },
  { category: 'media', keywords: ['camera', 'tripod', 'microphone', 'lens'] },
  { category: 'sports', keywords: ['ball', 'cleats', 'racket', 'bat', 'glove', 'skateboard', 'frisbee', 'sports'] },
  { category: 'tech', keywords: ['laptop', 'mouse', 'keyboard', 'headphone', 'tablet', 'phone', 'monitor'] },
  { category: 'art', keywords: ['paint', 'brush', 'canvas', 'sketch'] },
];

function mapLabelToCategory(label = ''): ItemCategory {
  const lower = label.toLowerCase();
  return categoryKeywords.find((entry) => entry.keywords.some((keyword) => lower.includes(keyword)))?.category ?? 'other';
}

function labelToName(label = '') {
  return label
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

async function classifyWithRoboflow(fileBuffer: Buffer) {
  const apiKey = process.env.ROBOFLOW_API_KEY;

  if (!apiKey) return null;

  const response = await fetch(`https://detect.roboflow.com/${ROBOFLOW_MODEL}?api_key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: fileBuffer.toString('base64'),
  });

  if (!response.ok) {
    throw new Error(`Roboflow inference failed with ${response.status}`);
  }

  const data = await response.json() as {
    predictions?: Array<{ class?: string; confidence?: number }>;
  };

  const detections = (data.predictions || [])
    .map((prediction) => ({
      label: prediction.class || 'unknown',
      confidence: prediction.confidence || 0,
    }))
    .sort((a, b) => b.confidence - a.confidence);

  return detections;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('image');

  if (!(file instanceof File)) {
    return Response.json({ ok: false, error: 'Upload an image file.' }, { status: 400 });
  }

  if (!file.type.startsWith('image/')) {
    return Response.json({ ok: false, error: 'Only image uploads can be classified.' }, { status: 400 });
  }

  if (file.size > 8_000_000) {
    return Response.json({ ok: false, error: 'Image must be under 8 MB.' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Primary: our own YOLO model via ONNX Runtime.
  try {
    const detections = await classifyWithOnnx(buffer);
    const top = detections[0];

    if (!top) {
      return Response.json({
        ok: false,
        modelReady: true,
        provider: 'local-onnx',
        error: 'The model did not detect an item.',
      });
    }

    return Response.json({
      ok: true,
      modelReady: true,
      provider: 'local-onnx',
      label: top.label,
      displayName: labelToName(top.label),
      category: mapLabelToCategory(top.label),
      confidence: top.confidence,
      detections: detections.slice(0, 5),
    });
  } catch (onnxError) {
    // Optional hosted fallback, if an API key is configured.
    try {
      const roboflowDetections = await classifyWithRoboflow(buffer);

      if (roboflowDetections) {
        const top = roboflowDetections[0];

        if (!top) {
          return Response.json({
            ok: false,
            modelReady: true,
            provider: 'roboflow',
            error: 'The hosted model did not detect an item.',
          });
        }

        return Response.json({
          ok: true,
          modelReady: true,
          provider: 'roboflow',
          label: top.label,
          displayName: labelToName(top.label),
          category: mapLabelToCategory(top.label),
          confidence: top.confidence,
          detections: roboflowDetections.slice(0, 5),
        });
      }
    } catch {
      // Fall through to the ONNX error below.
    }

    return Response.json({
      ok: false,
      modelReady: false,
      provider: 'local-onnx',
      error: 'Could not run the model.',
      details: onnxError instanceof Error ? onnxError.message : String(onnxError),
    });
  }
}
