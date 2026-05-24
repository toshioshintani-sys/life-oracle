import { useRef, useCallback } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function PromptInput({ value, onChange, onGenerate, isGenerating }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        onGenerate();
      }
    },
    [onGenerate],
  );

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value);
  }, [value]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">プロンプト</label>
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="生成したい画像を描写してください（日本語・英語対応）"
          rows={4}
          className="w-full rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500
                     px-4 py-3 pr-20 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="button"
          onClick={handleCopy}
          disabled={!value}
          className="absolute top-2 right-2 px-2 py-1 text-xs text-slate-400 hover:text-slate-200
                     bg-slate-700 hover:bg-slate-600 disabled:opacity-30 rounded transition-colors"
        >
          コピー
        </button>
      </div>
      <p className="text-xs text-slate-500">Cmd/Ctrl + Enter で生成</p>

      <button
        type="button"
        onClick={onGenerate}
        disabled={isGenerating || !value.trim()}
        className="w-full py-3 px-6 rounded-lg font-medium text-sm transition-colors
                   bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500
                   text-white disabled:cursor-not-allowed"
      >
        {isGenerating ? '生成中...' : '全モデルで生成'}
      </button>
    </div>
  );
}
