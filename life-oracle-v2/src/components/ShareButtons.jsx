import { useState, useCallback } from 'react';

export function ShareButtons({ shareText, shareUrl }) {
  const url = shareUrl ?? (typeof window !== 'undefined' ? window.location.origin + '/' : '');
  const [copied, setCopied] = useState(false);
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const openX = useCallback(() => {
    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;
    window.open(intent, '_blank', 'noopener,noreferrer');
  }, [shareText, url]);

  const openLine = useCallback(() => {
    const intent = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`;
    window.open(intent, '_blank', 'noopener,noreferrer');
  }, [shareText, url]);

  const handleCopy = useCallback(async () => {
    const payload = `${shareText}\n${url}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(payload);
      } else {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = payload;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silent fail; do not show "copied" so the user knows it didn't work.
    }
  }, [shareText, url]);

  const handleNativeShare = useCallback(async () => {
    if (!canNativeShare) return;
    try {
      await navigator.share({
        title: 'ライフオラクル',
        text: shareText,
        url,
      });
    } catch {
      // User cancelled or share unsupported; silent.
    }
  }, [canNativeShare, shareText, url]);

  return (
    <div className="share-buttons">
      <p className="share-buttons-label">この結果を伝える</p>
      <div className="share-buttons-row">
        <button
          type="button"
          className="share-btn share-btn--twitter"
          onClick={openX}
          aria-label="Xでシェア"
        >
          <span className="share-btn-icon" aria-hidden="true">X</span>
          <span className="share-btn-label">Xでシェア</span>
        </button>

        <button
          type="button"
          className="share-btn share-btn--line"
          onClick={openLine}
          aria-label="LINEで送る"
        >
          <span className="share-btn-icon" aria-hidden="true">L</span>
          <span className="share-btn-label">LINEで送る</span>
        </button>

        <button
          type="button"
          className="share-btn share-btn--copy"
          onClick={handleCopy}
          aria-label="リンクをコピー"
        >
          <span className="share-btn-icon" aria-hidden="true">⧉</span>
          <span className="share-btn-label">
            {copied ? 'コピーしました' : 'リンクをコピー'}
          </span>
        </button>

        {canNativeShare && (
          <button
            type="button"
            className="share-btn share-btn--native"
            onClick={handleNativeShare}
            aria-label="その他のアプリでシェア"
          >
            <span className="share-btn-icon" aria-hidden="true">…</span>
            <span className="share-btn-label">その他</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default ShareButtons;
