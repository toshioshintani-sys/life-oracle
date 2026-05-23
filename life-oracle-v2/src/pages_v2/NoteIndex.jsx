// note 記事まとめ画面：公開済み記事をカテゴリ別に一覧表示
import types from '../data_v2/jin/jin_types.json';
import { NotePromo } from '../components/NotePromo.jsx';

const TARGET_LABELS = {
  boss:           '上司',
  colleague:      '同僚',
  subordinate:    '部下',
  parent:         '親',
  child:          '子供',
  sibling:        'きょうだい',
  grandparent:    '祖父母',
  partner:        '恋人',
  almost_partner: '恋人未満',
  friend:         '友人',
};

const TARGET_GROUPS = [
  { label: '職場の人間関係',  keys: ['boss', 'colleague', 'subordinate'] },
  { label: '家族',            keys: ['parent', 'child', 'sibling', 'grandparent'] },
  { label: '恋愛・恋人未満', keys: ['partner', 'almost_partner'] },
  { label: 'その他',          keys: ['friend'] },
];

const allTypes = (types.types ?? []);

const byTarget = {};
for (const t of allTypes) {
  if (!t.notePublished || !t.noteUrl) continue;
  const tgt = t.target ?? 'other';
  if (!byTarget[tgt]) byTarget[tgt] = [];
  byTarget[tgt].push(t);
}

export function NoteIndex({ onBack }) {
  return (
    <div className="note-index-screen">
      <div className="note-index-header">
        <button className="note-index-back" onClick={onBack}>← 戻る</button>
        <p className="note-index-title">note 記事まとめ</p>
        <p className="note-index-sub">対人攻略シリーズ50本掲載中。職場・家族・恋愛別に読めます。</p>
      </div>

      <NotePromo />

      {TARGET_GROUPS.map(group => {
        const articles = group.keys.flatMap(k => byTarget[k] ?? []);
        if (articles.length === 0) return null;
        return (
          <div key={group.label} className="note-index-group">
            <p className="note-index-group-label">{group.label}</p>
            <div className="note-index-list">
              {articles.map(t => (
                <a
                  key={t.id}
                  href={t.noteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="note-index-item"
                >
                  <span className="note-index-tag">{TARGET_LABELS[t.target] ?? t.target}</span>
                  <span className="note-index-slug">{t.noteUrlSlug ?? t.internalLabel}</span>
                  <span className="note-index-arrow">→</span>
                </a>
              ))}
            </div>
          </div>
        );
      })}

      <a
        href="https://note.com/lifeoraclejp"
        target="_blank"
        rel="noopener noreferrer"
        className="note-index-all"
      >
        note ですべての記事を見る →
      </a>
    </div>
  );
}
