import { execFile } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { ItemCategory } from '@/lib/types';

export const runtime = 'nodejs';

const execFileAsync = promisify(execFile);
const ROBOFLOW_MODEL = process.env.ROBOFLOW_MODEL || 'school-supplies-gz456/1';
const isVercel = Boolean(process.env.VERCEL);

type ModelDetection = {
  label: string;
  confidence: number;
};

const categoryKeywords: Array<{ category: ItemCategory; keywords: string[] }> = [
  { category: 'calculator', keywords: ['calculator', 'ti84', 'ti-84', 'graphing'] },
  { category: 'charger', keywords: ['charger', 'usb', 'cable', 'adapter'] },
  { category: 'science', keywords: ['goggles', 'beaker', 'microscope', 'science', 'lab'] },
  { category: 'school-supply', keywords: ['ruler', 'pencil', 'pen', 'notebook', 'binder', 'folder', 'marker', 'eraser'] },
  { category: 'robotics', keywords: ['tool', 'toolkit', 'wrench', 'screwdriver', 'robot'] },
  { category: 'media', keywords: ['camera', 'tripod', 'microphone', 'lens'] },
  { category: 'sports', keywords: ['ball', 'cleats', 'racket', 'sports'] },
  { category: 'tech', keywords: ['laptop', 'mouse', 'keyboard', 'headphone', 'tablet'] },
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

  const projectRoot = /*turbopackIgnore: true*/ process.cwd();
  const modelPath = path.join(projectRoot, 'models', 'yolo26n.pt');
  const scriptPath = path.join(projectRoot, 'scripts', 'classify_image.py');
  const python = process.env.PYTHON_PATH || 'python';
  const workDir = await mkdtemp(path.join(tmpdir(), 'borrowboard-model-'));
  const imagePath = path.join(workDir, file.name.replace(/[^\w.-]/g, '_') || 'upload.jpg');

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    const roboflowDetections = await classifyWithRoboflow(buffer);

    if (roboflowDetections) {
      const top = roboflowDetections[0];

      if (!top) {
        return Response.json({
          ok: false,
          modelReady: true,
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

    if (isVercel) {
      return Response.json({
        ok: false,
        modelReady: false,
        provider: 'vercel',
        error: 'Set ROBOFLOW_API_KEY in Vercel to enable hosted image classification.',
      });
    }

    await writeFile(imagePath, buffer);

    const { stdout } = await execFileAsync(python, [scriptPath, modelPath, imagePath], {
      cwd: projectRoot,
      timeout: 30_000,
      maxBuffer: 1024 * 1024,
    });

    const parsed = JSON.parse(stdout.trim()) as {
      ok: boolean;
      top?: ModelDetection | null;
      detections?: ModelDetection[];
      error?: string;
      details?: string;
    };

    if (!parsed.ok || !parsed.top) {
      return Response.json({
        ok: false,
        modelReady: false,
        error: parsed.error || 'The model did not detect an item.',
        details: parsed.details,
      });
    }

    const category = mapLabelToCategory(parsed.top.label);

    return Response.json({
      ok: true,
      modelReady: true,
      provider: 'local-yolo',
      label: parsed.top.label,
      displayName: labelToName(parsed.top.label),
      category,
      confidence: parsed.top.confidence,
      detections: parsed.detections ?? [],
    });
  } catch (error) {
    const stdout = typeof error === 'object' && error && 'stdout' in error ? String((error as { stdout?: string }).stdout || '') : '';

    if (stdout.trim()) {
      try {
        const parsed = JSON.parse(stdout.trim()) as { error?: string; details?: string };
        return Response.json({
          ok: false,
          modelReady: false,
          error: parsed.error || 'Could not run the trained model.',
          details: parsed.details,
        });
      } catch {
        // Fall through to the generic error response.
      }
    }

    return Response.json({
      ok: false,
      modelReady: false,
      error: error instanceof Error ? error.message : 'Could not run the trained model.',
    });
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}
