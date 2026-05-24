import type { ModelId, AspectRatio, GenerationResult, LlmId } from './types';

async function callFunction(
  endpoint: string,
  prompt: string,
  aspectRatio: AspectRatio,
): Promise<Omit<GenerationResult, 'modelId' | 'status'>> {
  const res = await fetch(`/api/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, aspectRatio }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'APIエラー' }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }

  return res.json();
}

const ENDPOINT: Record<ModelId, string> = {
  gemini: 'generate-gemini',
  openai: 'generate-openai',
  flux: 'generate-flux',
};

export async function generateImage(
  modelId: ModelId,
  prompt: string,
  aspectRatio: AspectRatio,
): Promise<Omit<GenerationResult, 'modelId' | 'status'>> {
  return callFunction(ENDPOINT[modelId], prompt, aspectRatio);
}

export async function generatePromptFromArticle(
  articleText: string,
  llm: LlmId,
  docxBase64?: string,
): Promise<string> {
  const res = await fetch('/api/generate-prompt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ articleText, docxBase64, llm }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'APIエラー' }));
    throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
  }

  const data = await res.json() as { prompt: string };
  return data.prompt;
}
