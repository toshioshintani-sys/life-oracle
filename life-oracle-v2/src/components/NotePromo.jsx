// note 記事への送客 CTA（日付で自動切り替え）
// Phase 1: ~5/28  → 予告バナー
// Phase 2: 5/29~   → シリーズ記事へのプレーンな送客（課金要素なし）
// Phase 3: メンバーシップ募集 — 2026-07-08 停止中。getPhase() 参照。

const NOTE_BASE = 'https://note.com/lifeoraclejp';
const NOTE_SERIES_URL = `${NOTE_BASE}`;       // 5/29時点のシリーズURLに差し替え可能
const NOTE_MEMBERSHIP_URL = `${NOTE_BASE}/membership`;

const SERIES_START    = new Date('2026-05-29T00:00:00+09:00');
const MEMBERSHIP_START = new Date('2026-06-04T00:00:00+09:00');

function getPhase() {
  // 2026-07-08: メンバーシップCTA(月額980円)を一旦停止。診断の利用者がまだ少ない段階で
  // 課金要素を見せると警戒感を与えるため。noteはアプリの補完的な位置づけに戻し、将来的には
  // 自己啓発書などの情報提供・アフィリエイトへの切り替えを検討する（CLAUDE.md 参照）。
  // MEMBERSHIP_START 到達後も 'series'（プレーンなnote記事リンクのみ）で止める。
  // 再開する場合は下の行を戻す： if (now >= MEMBERSHIP_START) return 'membership';
  const now = new Date();
  if (now >= SERIES_START) return 'series';
  return 'preview';
}

const PHASES = {
  preview: {
    label:   '5月29日スタート',
    heading: '対人攻略シリーズ、まもなく公開',
    body:    '上司・同僚・部下——あの人がそう動く理由を、note記事で深掘りします。5/29・6/2の2本は無料で読めます。',
    cta:     'note をフォローして通知を受け取る',
    url:     NOTE_BASE,
    variant: 'preview',
  },
  series: {
    label:   '公開中',
    heading: '対人攻略シリーズを読む',
    body:    '職場の人間関係を読み解く記事シリーズ。noteでじっくり読めます。',
    cta:     'note で読む',
    url:     NOTE_SERIES_URL,
    variant: 'series',
  },
  membership: {
    label:   'メンバーシップ募集中',
    heading: '月額980円で読み放題',
    body:    '対人攻略シリーズ全記事＋特典10記事が読み放題。1記事500円×複数買うより断然お得です。',
    cta:     'メンバーシップに参加する（月額980円）',
    url:     NOTE_MEMBERSHIP_URL,
    variant: 'membership',
  },
};

export function NotePromo({ minimal = false }) {
  const phase = getPhase();
  const p = PHASES[phase];

  if (minimal) {
    return (
      <a
        href={p.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`note-promo-minimal note-promo-minimal--${p.variant}`}
      >
        <span className="note-promo-minimal-label">{p.label}</span>
        <span className="note-promo-minimal-cta">{p.cta} →</span>
      </a>
    );
  }

  return (
    <div className={`note-promo note-promo--${p.variant}`}>
      <span className="note-promo-label">{p.label}</span>
      <p className="note-promo-heading">{p.heading}</p>
      <p className="note-promo-body">{p.body}</p>
      <a
        href={p.url}
        target="_blank"
        rel="noopener noreferrer"
        className="note-promo-cta"
      >
        {p.cta}
      </a>
    </div>
  );
}
