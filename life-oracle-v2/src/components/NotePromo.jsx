// note 記事への送客 CTA
// 2026-07-08: 対人攻略シリーズ(jin_)はnote内で唯一の有料シリーズのため推奨対象から外し、
// 無料で多数公開されている行動経済学バイアス解説記事を案内する内容に変更。
// 件数は biasInfo（NoteIndex.jsx と同じ判定基準）からライブ算出するため、
// 新しいバイアス記事が公開されるたびに自動で反映され、日付フェーズの手動更新が不要になる。
import { biasInfo } from '../data_v2/meta/biasInfo.js';

const NOTE_BASE = 'https://note.com/lifeoraclejp';

function publishedBiasCount() {
  const now = new Date();
  return Object.values(biasInfo)
    .filter((b) => b.noteUrl && now >= new Date(b.noteScheduledAt ?? 0))
    .length;
}

export function NotePromo({ minimal = false }) {
  const count = publishedBiasCount();
  const p = count > 0
    ? {
        label:   `バイアス解説${count}本 公開中`,
        heading: '行動経済学バイアス解説を読む',
        body:    '損失回避・現在バイアス・確証バイアスなど、無意識の判断のクセをnote記事で深掘り。全て無料で読めます。',
        cta:     'バイアス解説記事を読む →',
        url:     NOTE_BASE,
        variant: 'series', // 既存CSS(.note-promo--series)の色味を流用
      }
    : {
        label:   'note 更新中',
        heading: '行動経済学バイアス解説、近日公開',
        body:    '無意識の判断のクセを1つずつ深掘りするシリーズを準備中です。',
        cta:     'note をフォローして通知を受け取る',
        url:     NOTE_BASE,
        variant: 'preview',
      };

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
