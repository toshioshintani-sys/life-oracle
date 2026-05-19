const TARGETS = [
  { id: 'boss',        label: '上司', desc: 'こちらの動きが届かない・噛み合わない上司', enabled: true },
  { id: 'colleague',   label: '同僚', desc: 'なぜか消耗する同僚との関係',               enabled: true },
  { id: 'subordinate', label: '部下', desc: '指示が通らない・動かない部下',             enabled: true },
];

export function TargetSelect({ onSelect, onBack }) {
  return (
    <div className="topic-screen">
      <button className="back-button" onClick={onBack}>もどる</button>
      <p className="topic-lead">攻略したい相手は、どなたですか？</p>
      <div className="topic-choices">
        {TARGETS.map(t => (
          <button
            key={t.id}
            className="topic-button"
            disabled={!t.enabled}
            onClick={() => t.enabled && onSelect(t.id)}
            style={{ opacity: t.enabled ? 1 : 0.4, cursor: t.enabled ? 'pointer' : 'not-allowed' }}
          >
            <span className="topic-label">
              {t.label}{!t.enabled && '（準備中）'}
            </span>
            <span className="topic-desc">{t.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
