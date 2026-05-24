import type { GenerationResult } from '../lib/types';

const MODEL_LABEL: Record<string, string> = {
  gemini: 'Gemini 2.5 Flash',
  openai: 'GPT Image 1',
  flux: 'FLUX 1.1 Pro',
};

interface Props {
  result: GenerationResult;
}

export function ImageCard({ result }: Props) {
  const { modelId, status, imageData, imageUrl, mimeType, error } = result;

  const handleDownload = async () => {
    const timestamp = Date.now();
    const filename = `${modelId}-${timestamp}.png`;

    if (imageData) {
      const link = document.createElement('a');
      link.href = `data:${mimeType ?? 'image/png'};base64,${imageData}`;
      link.download = filename;
      link.click();
      return;
    }

    if (imageUrl) {
      try {
        // FLUX returns a URL — fetch and convert to blob for reliable download
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(objectUrl);
      } catch {
        // Fallback: open in new tab
        window.open(imageUrl, '_blank');
      }
    }
  };

  const displaySrc = imageData
    ? `data:${mimeType ?? 'image/png'};base64,${imageData}`
    : imageUrl;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700">
        <span className="text-xs font-semibold text-slate-300">{MODEL_LABEL[modelId]}</span>
        {status === 'success' && (
          <button
            type="button"
            onClick={handleDownload}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            ダウンロード
          </button>
        )}
      </div>

      <div className="flex-1 min-h-52 flex items-center justify-center bg-slate-900">
        {status === 'idle' && (
          <p className="text-xs text-slate-600">待機中</p>
        )}
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500">生成中...</p>
          </div>
        )}
        {status === 'success' && displaySrc && (
          <img
            src={displaySrc}
            alt={`${MODEL_LABEL[modelId]} による生成画像`}
            className="w-full h-full object-contain"
          />
        )}
        {status === 'error' && (
          <div className="p-4 text-center max-w-xs">
            <p className="text-red-400 text-xs font-medium mb-1">エラー</p>
            <p className="text-slate-500 text-xs break-words">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
