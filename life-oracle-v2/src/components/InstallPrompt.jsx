import { useState, useEffect } from 'react';
import { trackEvent } from '../lib/analytics.js';

// 「ホーム画面に追加」プロンプト（PWAインストール）。
// アプリは既に PWA（manifest+SW）なのでインストール可能。本コンポーネントは
// それを明示ボタンで促す。Android/Chrome は beforeinstallprompt を使い、
// iOS Safari は同イベントが来ないため手動手順を案内する。
// 一度閉じたら再表示しない（localStorage）。インストール済みなら出さない。

const DISMISS_KEY = 'lo_install_dismissed_v1';

function isStandalone() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches === true ||
    window.navigator.standalone === true // iOS Safari
  );
}

function isIOS() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const iPhoneLike = /iPad|iPhone|iPod/.test(ua);
  // iPadOS 13+ は Mac を名乗るのでタッチ数で判定
  const iPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return iPhoneLike || iPadOS;
}

export function InstallPrompt() {
  const [deferred, setDeferred]     = useState(null); // Android/Chrome の beforeinstallprompt
  const [iosTip, setIosTip]         = useState(false);
  const [visible, setVisible]       = useState(false);

  useEffect(() => {
    if (isStandalone()) return;                                   // 既にインストール済み
    try { if (localStorage.getItem(DISMISS_KEY)) return; } catch { /* private mode */ }

    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferred(e);
      setVisible(true);
      trackEvent('install_prompt_shown', { kind: 'android' });
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    // iOS は beforeinstallprompt が発火しないので、少し待ってから手順を案内
    let iosTimer = null;
    if (isIOS()) {
      iosTimer = setTimeout(() => {
        setIosTip(true);
        setVisible(true);
        trackEvent('install_prompt_shown', { kind: 'ios' });
      }, 1500);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, []);

  const remember = () => { try { localStorage.setItem(DISMISS_KEY, '1'); } catch { /* ignore */ } };

  const dismiss = () => {
    remember();
    setVisible(false);
    trackEvent('install_prompt_dismissed', { kind: iosTip ? 'ios' : 'android' });
  };

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    const choice = await deferred.userChoice.catch(() => null);
    trackEvent('install_prompt_result', { outcome: choice?.outcome ?? 'unknown' });
    setDeferred(null);
    setVisible(false);
    if (choice?.outcome === 'accepted') remember();
  };

  if (!visible) return null;

  const bar = {
    position: 'fixed', left: 12, right: 12, bottom: 12, zIndex: 2147483000,
    display: 'flex', alignItems: 'center', gap: 12,
    background: '#faf6f1', color: '#2d2318',
    border: '1px solid #e6dccb', borderRadius: 14,
    boxShadow: '0 8px 28px rgba(45,35,24,0.18)',
    padding: '12px 14px', maxWidth: 520, margin: '0 auto',
    fontFamily: 'Hiragino Sans, Hiragino Kaku Gothic ProN, Noto Sans JP, sans-serif',
  };
  const textWrap = { flex: 1, minWidth: 0, lineHeight: 1.5 };
  const title = { fontSize: 14, fontWeight: 700, margin: 0 };
  const sub   = { fontSize: 12, opacity: 0.75, margin: '2px 0 0' };
  const btn   = {
    flexShrink: 0, background: '#b8833f', color: '#fff', border: 'none',
    borderRadius: 999, padding: '8px 16px', fontSize: 13, fontWeight: 700,
    cursor: 'pointer', whiteSpace: 'nowrap',
  };
  const closeBtn = {
    flexShrink: 0, background: 'transparent', border: 'none',
    color: '#2d2318', opacity: 0.5, fontSize: 18, lineHeight: 1,
    cursor: 'pointer', padding: 4,
  };

  return (
    <div style={bar} role="dialog" aria-label="ホーム画面に追加">
      <span aria-hidden="true" style={{ fontSize: 22 }}>🧭</span>
      <div style={textWrap}>
        {iosTip ? (
          <>
            <p style={title}>ホーム画面に追加</p>
            <p style={sub}>共有ボタン <span aria-hidden="true">⬆️</span> →「ホーム画面に追加」でアプリになります</p>
          </>
        ) : (
          <>
            <p style={title}>ライフオラクルをホーム画面に</p>
            <p style={sub}>アプリとして、いつでもすぐ開けます</p>
          </>
        )}
      </div>
      {!iosTip && (
        <button style={btn} onClick={install}>追加する</button>
      )}
      <button style={closeBtn} onClick={dismiss} aria-label="閉じる">×</button>
    </div>
  );
}
