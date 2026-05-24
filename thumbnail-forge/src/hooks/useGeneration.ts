import { useState, useCallback } from 'react';
import type { GenerationResult, ModelId, AspectRatio, StyleSettings } from '../lib/types';
import { generateImage } from '../lib/api';
import { addToHistory, incrementCallCount } from '../lib/storage';
import { buildStyleSuffix } from '../lib/styleUtils';

interface LastRequest {
  prompt: string;
  aspectRatio: AspectRatio;
  models: ModelId[];
}

const INITIAL_RESULTS: GenerationResult[] = [
  { modelId: 'gemini', status: 'idle' },
  { modelId: 'openai', status: 'idle' },
  // { modelId: 'flux', status: 'idle' },
];

export function useGeneration() {
  const [results, setResults] = useState<GenerationResult[]>(INITIAL_RESULTS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastRequest, setLastRequest] = useState<LastRequest | null>(null);

  const updateResult = useCallback((modelId: ModelId, update: Partial<GenerationResult>) => {
    setResults((prev) =>
      prev.map((r) => (r.modelId === modelId ? { ...r, ...update } : r)),
    );
  }, []);

  const generate = useCallback(
    async (
      prompt: string,
      aspectRatio: AspectRatio,
      selectedModels: ModelId[],
      styleSettings?: StyleSettings,
    ) => {
      if (!prompt.trim() || selectedModels.length === 0) return;

      const { exceeded } = incrementCallCount(selectedModels);
      if (exceeded) {
        alert('本日の生成上限（100回）に達しました。明日またお試しください。');
        return;
      }

      // 世界観設定をプロンプトに付与
      const styleSuffix = styleSettings ? buildStyleSuffix(styleSettings) : '';
      const fullPrompt = prompt + styleSuffix;

      setIsGenerating(true);
      setLastRequest({ prompt, aspectRatio, models: selectedModels });
      addToHistory(prompt, aspectRatio);

      setResults((prev) =>
        prev.map((r) =>
          selectedModels.includes(r.modelId)
            ? { modelId: r.modelId, status: 'loading' }
            : { modelId: r.modelId, status: 'idle' },
        ),
      );

      const tasks = selectedModels.map(async (modelId) => {
        try {
          const result = await generateImage(modelId, fullPrompt, aspectRatio);
          updateResult(modelId, { status: 'success', ...result, timestamp: Date.now() });
        } catch (err) {
          updateResult(modelId, {
            status: 'error',
            error: err instanceof Error ? err.message : '不明なエラー',
          });
        }
      });

      await Promise.allSettled(tasks);
      setIsGenerating(false);
    },
    [updateResult],
  );

  const regenerate = useCallback(
    (styleSettings?: StyleSettings) => {
      if (!lastRequest) return;
      generate(lastRequest.prompt, lastRequest.aspectRatio, lastRequest.models, styleSettings);
    },
    [lastRequest, generate],
  );

  return { results, isGenerating, lastRequest, generate, regenerate };
}
