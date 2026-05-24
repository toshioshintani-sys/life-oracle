import { useState, useEffect } from 'react';
import { PromptInput } from './components/PromptInput';
import { AspectRatioSelector } from './components/AspectRatioSelector';
import { ModelSelector } from './components/ModelSelector';
import { ImageGrid } from './components/ImageGrid';
import { PromptHistory } from './components/PromptHistory';
import { ArticleUpload } from './components/ArticleUpload';
import { StyleSettings } from './components/StyleSettings';
import { useGeneration } from './hooks/useGeneration';
import { getHistory, getTodayTotal, getStyleSettings, saveStyleSettings } from './lib/storage';
import type { AspectRatio, ModelId, PromptHistoryItem, StyleSettings as StyleSettingsType } from './lib/types';
import { DEFAULT_STYLE_SETTINGS } from './lib/types';

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [selectedModels, setSelectedModels] = useState<ModelId[]>(['gemini', 'openai']);
  const [history, setHistory] = useState<PromptHistoryItem[]>([]);
  const [todayTotal, setTodayTotal] = useState(0);
  const [styleSettings, setStyleSettings] = useState<StyleSettingsType>(DEFAULT_STYLE_SETTINGS);

  const { results, isGenerating, lastRequest, generate, regenerate } = useGeneration();

  useEffect(() => {
    setHistory(getHistory());
    setTodayTotal(getTodayTotal());
    setStyleSettings(getStyleSettings());
  }, []);

  const handleStyleChange = (settings: StyleSettingsType) => {
    setStyleSettings(settings);
    saveStyleSettings(settings);
  };

  const handleGenerate = () => {
    generate(prompt, aspectRatio, selectedModels, styleSettings);
    setHistory(getHistory());
    setTodayTotal(getTodayTotal());
  };

  const handleHistorySelect = (historyPrompt: string, ratio: AspectRatio) => {
    setPrompt(historyPrompt);
    setAspectRatio(ratio);
  };

  const handleRegenerate = () => {
    regenerate(styleSettings);
    setTodayTotal(getTodayTotal());
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <header className="border-b border-slate-700 px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold text-indigo-400">Thumbnail Forge</h1>
          <p className="text-xs text-slate-500 mt-0.5">マルチモデル画像生成 — Gemini / OpenAI</p>
        </div>
        <div className="text-xs text-slate-500">
          今日: <span className="text-slate-300">{todayTotal}</span> / 100 生成
        </div>
      </header>

      <div className="flex flex-col lg:flex-row flex-1 min-h-0">
        <aside className="w-full lg:w-80 xl:w-96 border-b lg:border-b-0 lg:border-r border-slate-700
                          p-4 space-y-4 overflow-y-auto lg:h-[calc(100vh-57px)] shrink-0">
          {/* 記事からプロンプト生成 */}
          <ArticleUpload onPromptGenerated={setPrompt} />

          <div className="border-t border-slate-700" />

          {/* プロンプト入力 */}
          <PromptInput
            value={prompt}
            onChange={setPrompt}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />

          <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
          <ModelSelector selected={selectedModels} onChange={setSelectedModels} />

          {/* 世界観設定 */}
          <StyleSettings settings={styleSettings} onChange={handleStyleChange} />

          {lastRequest && (
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={isGenerating}
              className="w-full py-2 px-4 rounded-lg text-sm border border-slate-600
                         text-slate-300 hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              再生成
            </button>
          )}

          <PromptHistory history={history} onSelect={handleHistorySelect} />
        </aside>

        <main className="flex-1 p-4 overflow-y-auto min-h-0">
          <ImageGrid results={results} />
        </main>
      </div>
    </div>
  );
}
