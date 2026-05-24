import { useState, useRef, useCallback } from 'react';
import type { LlmId } from '../lib/types';
import { generatePromptFromArticle } from '../lib/api';

interface Props {
  onPromptGenerated: (prompt: string) => void;
}

const ACCEPT = '.txt,.md,.docx';
const LLM_OPTIONS: { id: LlmId; label: string }[] = [
  { id: 'gemini', label: 'Gemini' },
  { id: 'openai', label: 'OpenAI' },
];

export function ArticleUpload({ onPromptGenerated }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLlm, setSelectedLlm] = useState<LlmId>('gemini');
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      setFileName(file.name);
      setIsLoading(true);

      try {
        let articleText = '';
        let docxBase64: string | undefined;

        if (file.name.endsWith('.docx')) {
          // docx はサーバー側で mammoth を使って解析
          const buffer = await file.arrayBuffer();
          const bytes = new Uint8Array(buffer);
          let binary = '';
          bytes.forEach((b) => (binary += String.fromCharCode(b)));
          docxBase64 = btoa(binary);
        } else {
          // txt / md はブラウザで直接読み込み
          articleText = await file.text();
        }

        const prompt = await generatePromptFromArticle(articleText, selectedLlm, docxBase64);
        onPromptGenerated(prompt);
      } catch (e) {
        setError(e instanceof Error ? e.message : '変換に失敗しました');
      } finally {
        setIsLoading(false);
      }
    },
    [selectedLlm, onPromptGenerated],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      e.target.value = '';
    },
    [processFile],
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-300">記事からプロンプト生成</label>
        <div className="flex gap-1">
          {LLM_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSelectedLlm(opt.id)}
              className={`px-2 py-0.5 text-xs rounded transition-colors ${
                selectedLlm === opt.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-indigo-400 bg-indigo-950'
            : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800'
        }`}
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-2 py-1">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400">プロンプト生成中...</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-400">
              {fileName ? `✓ ${fileName}` : 'ファイルをドロップ、またはクリックして選択'}
            </p>
            <p className="text-xs text-slate-600 mt-1">.txt / .md / .docx 対応</p>
          </>
        )}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
