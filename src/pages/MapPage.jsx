import { useState } from 'react';
import { cognitiveFunctionMap, typeLabels } from '../data/types';

const biasData = {
  INTJ: { biases: [{ n: '確証バイアス', r: 'ビジョンへの確信が反証を遮断しやすい' }, { n: '過信バイアス', r: '長期洞察への自信が盲点をつくることがある' }] },
  INFJ: { biases: [{ n: '確証バイアス', r: '強い信念が反対意見を無意識に遮断しやすい' }, { n: '損失回避', r: '理想を失うことへの恐れが行動を妨げることがある' }] },
  INTP: { biases: [{ n: '確証バイアス', r: '自分の理論を前提に情報を集めがち' }, { n: '過信バイアス', r: '論理への自信が盲点をつくることがある' }] },
  INFP: { biases: [{ n: '確証バイアス', r: '価値観に合う情報だけを集めやすい' }, { n: '損失回避', r: '大切なものを失うことへの恐れが強い' }] },
  ENTP: { biases: [{ n: '過信バイアス', r: 'アイデアへの自信が実行可能性を甘く見積もる' }, { n: '現在バイアス', r: '新しいことへの興味で今やるべきことが後回しに' }] },
  ENFP: { biases: [{ n: '過信バイアス', r: '可能性への熱量が現実的な壁を見えにくくする' }, { n: '現在バイアス', r: '今の気持ちを最優先にして計画が変わりやすい' }] },
  ENTJ: { biases: [{ n: '過信バイアス', r: '実行力への自信がリスク評価を甘くすることがある' }, { n: '確証バイアス', r: '決めたことを正当化する情報を優先しがち' }] },
  ENFJ: { biases: [{ n: '同調バイアス', r: '周囲の調和を優先して自分の意見を引っ込めやすい' }, { n: '感情ヒューリスティック', r: '場の雰囲気で判断が揺れやすい' }] },
  ISTJ: { biases: [{ n: '現状維持バイアス', r: '実績のある方法を変えることへの強い抵抗感' }, { n: '損失回避', r: '安定を失うリスクを過大評価しやすい' }] },
  ISFJ: { biases: [{ n: '現状維持バイアス', r: '慣れた環境・関係を守ることを最優先にしやすい' }, { n: '損失回避', r: '変化によって大切なものを失うことへの恐れ' }] },
  ISTP: { biases: [{ n: '現状維持バイアス', r: '自分のやり方・ペースを崩されることへの抵抗' }, { n: '過信バイアス', r: '技術的な判断への自信が他の視点を遮ることがある' }] },
  ISFP: { biases: [{ n: '現状維持バイアス', r: '今の心地よい状態を変えることへの抵抗感' }, { n: '感情ヒューリスティック', r: 'その瞬間の感情で判断が大きく動きやすい' }] },
  ESTJ: { biases: [{ n: '同調バイアス', r: '組織・社会の規範に合わせることを重視しがち' }, { n: '現状維持バイアス', r: '秩序や決まりを変えることへの抵抗感' }] },
  ESFJ: { biases: [{ n: '同調バイアス', r: '周囲の意見・空気に強く引っ張られやすい' }, { n: '感情ヒューリスティック', r: 'その場の雰囲気や感情で判断しやすい' }] },
  ESTP: { biases: [{ n: '現在バイアス', r: '今この瞬間の判断・行動を優先しやすい' }, { n: '感情ヒューリスティック', r: '直感と勢いで動いて後から考えることが多い' }] },
  ESFP: { biases: [{ n: '現在バイアス', r: '今楽しいことを優先して将来の計画が後回しに' }, { n: '同調バイアス', r: '場の盛り上がり・周囲の反応に乗りやすい' }] },
};

const quadrants = [
  { key: 'ni', label: '内向 × 直観', types: ['INTJ', 'INFJ', 'INTP', 'INFP'], biasTags: ['確証バイアス', '過信バイアス'] },
  { key: 'ne', label: '外向 × 直観', types: ['ENTP', 'ENFP', 'ENTJ', 'ENFJ'], biasTags: ['過信バイアス', '現在バイアス'] },
  { key: 'si', label: '内向 × 感覚', types: ['ISTJ', 'ISFJ', 'ISTP', 'ISFP'], biasTags: ['現状維持バイアス', '損失回避'] },
  { key: 'se', label: '外向 × 感覚', types: ['ESTJ', 'ESFJ', 'ESTP', 'ESFP'], biasTags: ['同調バイアス', '感情ヒューリスティック'] },
];

export default function MapPage({ onBack }) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (type) => {
    setSelected(selected === type ? null : type);
  };

  return (
    <div className="map-page">
      <div className="map-header">
        <button className="back-btn" onClick={onBack}>← 戻る</button>
        <h2>16タイプ 全体マップ</h2>
        <p className="map-desc">タイプをタップすると、光・影・思考のクセが確認できます</p>
      </div>

      <div className="map-axis-label">直観（N）寄り</div>

      <div className="map-grid">
        {quadrants.map((q) => (
          <div key={q.key} className={`map-quadrant q-${q.key}`}>
            <div className="q-label">{q.label}</div>
            <div className="q-chips">
              {q.types.map((type) => (
                <button
                  key={type}
                  className={`type-chip chip-${q.key} ${selected === type ? 'active' : ''}`}
                  onClick={() => handleSelect(type)}
                >
                  {type}
                </button>
              ))}
            </div>
            <div className="q-tags">
              {[...new Set(q.types.map(t => cognitiveFunctionMap[t].lightName))].map((name) => (
                <span key={name} className="tag tag-light">{name}</span>
              ))}
              {[...new Set(q.types.map(t => cognitiveFunctionMap[t].shadowName))].map((name) => (
                <span key={name} className="tag tag-shadow">{name}</span>
              ))}
            </div>
            <div className="q-bias-tags">
              {q.biasTags.map((b) => (
                <span key={b} className="tag tag-bias">{b}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="map-axis-label">感覚（S）寄り</div>

      {selected && (
        <div className="detail-card">
          <div className="detail-header">
            <div>
              <span className="detail-type">{selected}</span>
              <span className="detail-catch">{typeLabels[selected]}</span>
            </div>
            <button className="close-btn" onClick={() => setSelected(null)}>閉じる</button>
          </div>
          <div className="detail-row">
            <span className="detail-key">光</span>
            <span className="detail-light">{cognitiveFunctionMap[selected].lightName}</span>
          </div>
          <div className="detail-row">
            <span className="detail-key">影</span>
            <span className="detail-shadow">{cognitiveFunctionMap[selected].shadowName}</span>
          </div>
          <div className="detail-row">
            <span className="detail-key">思考のクセ</span>
            <div className="detail-biases">
              {biasData[selected].biases.map((b) => (
                <div key={b.n} className="bias-item">
                  <span className="bias-name">{b.n}</span>
                  <span className="bias-reason">{b.r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
