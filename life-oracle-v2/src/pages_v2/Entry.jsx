import { useState } from 'react';

const INTENTS = [
  { key: 'work_stress',       label: '仕事でのストレスや人間関係',   desc: '職場の悩みや疲れ方のクセを知りたい' },
  { key: 'relation_conflict', label: '家族・友人との分かり合えなさ', desc: '大切な人と噛み合わない理由を知りたい' },
  { key: 'self_understand',   label: 'なぜ自分はこうなのか',         desc: '自分の行動パターンの理由が気になる' },
  { key: 'future_decision',   label: '将来の選択・迷い',             desc: '大事な決断の前に自分の判断軸を知りたい' },
];

export function Entry({ onStart }) {
  const [selected, setSelected] = useState(null);

  function handleStart() {
    if (!selected) return;
    onStart({ intent: selected, flow: 'self' });
  }

  return (
    <div className="entry-screen">
      <div className="entry-header">
        <h1 className="entry-title">ライフオラクル</h1>
        <p className="entry-subtitle">いま、何が一番気になっていますか？</p>
      </div>

      <div className="intent-list">
        {INTENTS.map(item => (
          <button
            key={item.key}
            className={`intent-card ${selected === item.key ? 'selected' : ''}`}
            onClick={() => setSelected(item.key)}
          >
            <span className="intent-label">{item.label}</span>
            <span className="intent-desc">{item.desc}</span>
          </button>
        ))}
      </div>

      <button
        className="start-button"
        disabled={!selected}
        onClick={handleStart}
      >
        診断を始める
      </button>

      <p className="entry-note">所要時間：約8分 ／ 全22問以内</p>
    </div>
  );
}
