import type { GenerationResult, TextOverlay } from '../lib/types';
import { compositeTextOverlay } from '../lib/textOverlay';

const MODEL_LABEL: Record<string, string> = {
  gemini: 'Gemini 2.5 Flash',
  openai: 'GPT Image 1',
  flux: 'FLUX 1.1 Pro',
};

interface Props {
  result: GenerationResult;
  textOverlay?: TextOverlay;
}

export function ImageCard({ result, textOverlay }: Props) {
  const { modelId, status, imageData, imageUrl, mimeType, error } = result;
  const overlayActive = textOverlay?.enabled && (textOverlay.title || textOverlay.subtitle);

  const handleDownload = async () => {
    const timestamp = Date.now();
    const filename = `${modelId}-${timestamp}.png`;

    if (imageData) {
      let finalBase64 = imageData;
      let finalMime = mimeType ?? 'image/png';

      if (overlayActive && textOverlay) {
        try {
          finalBase64 = await compositeTextOverlay(imageData, finalMime, textOverlay);
          finalMime = 'image/png';
        } catch {
          // fallback: download without overlay
        }
      }

      const link = document.createElement('a');
      link.href = `data:${finalMime};base64,${finalBase64}`;
      link.download = filename;
      link.click();
      return;
    }

    if (imageUrl) {
      try {
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(objectUrl);
      } catch {
        window.open(imageUrl, '_blank');
      }
    }
  };

  const displaySrc = imageData
    ? `data:${mimeType ?? 'image/png'};base64,${imageData}`
    : imageUrl;

  const textColor =
    textOverlay?.titleColor === 'yellow' ? '#FFD700'
    : textOverlay?.titleColor === 'black' ? '#1a1a1a'
    : '#FFFFFF';
  const textShadow =
    textOverlay?.titleColor === 'black'
      ? '0 0 8px rgba(255,255,255,0.9), 1px 1px 3px rgba(255,255,255,0.7)'
      : '0 0 10px rgba(0,0,0,0.9), 2px 2px 6px rgba(0,0,0,0.8)';
  const isTop = textOverlay?.position === 'top';

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
            {overlayActive ? 'テキスト付きDL' : 'ダウンロード'}
          </button>
        )}
      </div>

      <div className="flex-1 min-h-52 flex items-center justify-center bg-slate-900 relative">
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
          <>
            <img
              src={displaySrc}
              alt={`${MODEL_LABEL[modelId]} による生成画像`}
              className="w-full h-full object-contain"
            />
            {overlayActive && textOverlay && (
              <div
                className={`absolute left-0 right-0 px-4 text-center pointer-events-none ${
                  isTop ? 'top-0 pt-3' : 'bottom-0 pb-3'
                }`}
                style={{
                  background: isTop
                    ? 'linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, transparent 100%)'
                    : 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)',
                }}
              >
                {textOverlay.title && (
                  <p
                    className="font-bold leading-tight"
                    style={{ color: textColor, textShadow, fontSize: 'clamp(12px, 2.5vw, 20px)' }}
                  >
                    {textOverlay.title}
                  </p>
                )}
                {textOverlay.subtitle && (
                  <p
                    className="mt-0.5 leading-tight"
                    style={{ color: textColor, textShadow, fontSize: 'clamp(9px, 1.5vw, 13px)' }}
                  >
                    {textOverlay.subtitle}
                  </p>
                )}
              </div>
            )}
          </>
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
