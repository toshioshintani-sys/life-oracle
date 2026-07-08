const GROUPS = [
  {
    groupLabel: '職場',
    targets: [
      { id: 'boss',        label: '上司',   desc: 'こちらの動きが届かない・噛み合わない上司' },
      { id: 'colleague',   label: '同僚',   desc: 'なぜか消耗する同僚との関係' },
      { id: 'subordinate', label: '部下',   desc: '指示が通らない・動かない部下' },
    ],
  },
  {
    groupLabel: '家族',
    targets: [
      { id: 'parent',      label: '親',     desc: '過干渉・価値観の押しつけ・関係の距離感' },
      { id: 'child',       label: '子供',   desc: '伝わらない・反抗・何を考えているかわからない' },
      { id: 'sibling',     label: 'きょうだい', desc: 'マウント・比較・昔からのモヤモヤ' },
      { id: 'grandparent', label: '祖父母', desc: '時代の違い・言いにくいお願いへの対応' },
    ],
  },
  {
    groupLabel: '恋愛・友情',
    targets: [
      { id: 'partner',        label: '恋人',             desc: '喧嘩の仕方・感情表現・関係の修復' },
      { id: 'almost_partner', label: '恋人未満友達以上', desc: 'あの人の本心・距離感の読み方' },
    ],
  },
];

export function TargetSelect({ onSelect, onBack, okMessage }) {
  return (
    <div className="target-screen">
      <button className="back-button" onClick={onBack}>もどる</button>
      {okMessage && <p className="topic-ok-message">{okMessage}</p>}
      <p className="topic-lead">攻略したい相手は、どなたですか？</p>
      {GROUPS.map(group => (
        <div key={group.groupLabel} className="target-group">
          <p className="target-group-label">{group.groupLabel}</p>
          <div className="target-choices">
            {group.targets.map(t => (
              <button
                key={t.id}
                className="target-button"
                onClick={() => onSelect(t.id)}
              >
                <span className="target-label">{t.label}</span>
                <span className="target-desc">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
