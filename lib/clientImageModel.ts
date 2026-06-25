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

export type ClassificationFormResult = {
  status: string;
  toast: { message: string; type: 'success' | 'info' | 'error' };
  patch: { name?: string; category?: ItemCategory; description?: string } | null;
};

/**
 * Classifies a photo and shapes the result for an item/lost-found form:
 * a status line, a toast, and a `patch` of fields to merge (null when the
 * model couldn't classify the photo). Callers own the prev-state merge.
 */
export async function classifyImageForForm(file: File): Promise<ClassificationFormResult> {
  try {
    const result = await classifyImage(file);

    if (!result.ok || !result.category) {
      return {
        status: result.error || 'Model could not classify this photo',
        toast: { message: result.error || 'Model could not classify this photo.', type: 'info' },
        patch: null,
      };
    }

    const display = result.displayName || result.label;
    return {
      status: `${display} / ${Math.round((result.confidence || 0) * 100)}% confidence`,
      toast: { message: `Model classified this as ${display}.`, type: 'success' },
      patch: {
        name: result.displayName || result.label,
        category: result.category,
        description: result.label ? `Detected by BorrowBoard model: ${result.label}` : undefined,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not classify this image.';
    return { status: message, toast: { message, type: 'error' }, patch: null };
  }
}
