// GA4 イベント送信の共有ヘルパー
// window.gtag が未定義（ローカル開発・計測ブロック時）でも安全に no-op になる。

export function trackEvent(action, params = {}) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', action, { event_category: 'app_flow', ...params });
  }
}
