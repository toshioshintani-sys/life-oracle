// GA4 イベント送信の共有ヘルパー
// window.gtag が未定義（ローカル開発・計測ブロック時）でも安全に no-op になる。
//
// さらに、ヘッドレス/自動ブラウザ（クローラ・Lighthouse・Playwright 等）からの
// イベント送信を「源流」で抑止する（2026-06-21 追加）。
// 背景: GA4 にはボット除外フィルタが「既知ボットの自動除外（標準ON）」しか無く、
// それをすり抜ける JS 実行型ボットが (not set) / direct として大量イベントを撃ち、
// 異常値アラートと国別レポートを汚していた（実エンゲージはほぼ日本＝note由来）。
// 実ユーザーのブラウザは navigator.webdriver=false のため、この抑止の影響を受けない。

function isLikelyBot() {
  if (typeof navigator === 'undefined') return true; // 非ブラウザ環境では送らない
  // 1) WebDriver 制御下（Playwright/Puppeteer/Selenium/Lighthouse 等のヘッドレス）
  if (navigator.webdriver === true) return true;
  // 2) UA に明確なボット/ヘッドレス署名（実ユーザーの UA には出現しない語のみ）
  const ua = (navigator.userAgent || '').toLowerCase();
  if (/headlesschrome|bot|crawl|spider|slurp|lighthouse|puppeteer|playwright|phantomjs/.test(ua)) {
    return true;
  }
  return false;
}

export function trackEvent(action, params = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  if (isLikelyBot()) return; // ボット/自動ブラウザは GA4 に送らない（源流で除外）
  window.gtag('event', action, { event_category: 'app_flow', ...params });
}
