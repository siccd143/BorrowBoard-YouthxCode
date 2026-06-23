import { ItemCategory } from '@/lib/types';

export type ImageClassificationResult = {
  ok: boolean;
  modelReady?: boolean;
  label?: string;
  displayName?: string;
  category?: ItemCategory;
  confidence?: number;
  error?: string;
};

export async function classifyImage(file: File): Promise<ImageClassificationResult> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('/api/classify-image', {
    method: 'POST',
    body: formData,
  });

  return response.json();
}
