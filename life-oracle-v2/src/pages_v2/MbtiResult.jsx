import { cognitiveFunctionMap, famousPeople } from '../data_v2/meta/cognitiveFunctions.js';
import { biasInfo } from '../data_v2/meta/biasInfo.js';

const TYPE_DESC = {
  ENTJ: 'ゴールを決め、最短でたどり着く力を持つ。人を動かし、組織を動かす。',
  INTJ: '静かに、しかし確実に前進する。見えていないものが見え、計画通りに実現させる。',
  ENTP: 'アイデアが止まらない。可能性を広げ、既成概念を塗り替えることに喜びを感じる。',
  INTP: '深く考え、自分だけの体系をつくる。正確に理解することへの純粋な喜びがある。',
  ENFJ: '人の可能性を見抜き、引き出す。いつのまにかその場の核になっている。',
  INFJ: '他者の内面を深く感じ取り、大きなビジョンで動く。静かな影響力がある。',
  ENFP: '情熱とアイデアで周囲を引き込む。人に希望を与え、可能性を信じさせる力がある。',
  INFP: '自分の価値観に忠実に生きる。人の痛みに深く共感し、誠実さで信頼される。',
  ESTJ: '実際的で頼れる。責任を引き受け、計画を確実に実行する力がある。',
  ISTJ: '誠実で正確。約束を守り、細部まで丁寧に仕上げることで信頼を積み上げる。',
  ESTP: '今この瞬間の判断が速い。変化の多い状況でこそ、本来の力が出る。',
  ISTP: '静かに観察し、最善の方法を見つける。実用的で、いざとなれば誰より頼れる。',
  ESFJ: '周囲の調和を大切にし、人が安心できる環境を自然とつくる。',
  ISFJ: '大切な人を細部まで気にかける。静かな献身が、チームや家族の基盤を支えている。',
  ESFP: '今この場を輝かせる力がある。その場にいるだけで空気が変わる。',
  ISFP: '感受性豊かで、独自の美的センスを持つ。自分のペースで、深く誠実に生きる。',
};

export function MbtiResult({ result, onRetry }) {
  if (!result) return null;

  const { mbtiType, biasScores } = result;
  const typeInfo   = cognitiveFunctionMap[mbtiType] ?? {};
  const famous     = famousPeople[mbtiType]?.people ?? [];
  const desc       = TYPE_DESC[mbtiType] ?? '';

  const topBiases = Object.entries(biasScores ?? {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([key]) => ({ key, ...biasInfo[key] }))
    .filter(b => b.name);

  return (
    <div className="mbti-result-screen">

      <div className="mbti-result-type-block">
        <p className="mbti-result-type-code">{mbtiType}</p>
        <p className="mbti-result-light-name">{typeInfo.lightName}</p>
        <p className="mbti-result-desc">{desc}</p>
      </div>

      {famous.length > 0 && (
        <div className="mbti-result-famous">
          <p className="mbti-result-famous-label">同じパターンの人</p>
          <p className="mbti-result-famous-names">{famous.join(' / ')}</p>
        </div>
      )}

      {typeInfo.shadowName && (
        <div className="mbti-result-shadow">
          <p className="mbti-result-shadow-label">表れやすいクセ</p>
          <p className="mbti-result-shadow-name">{typeInfo.shadowName}</p>
        </div>
      )}

      {topBiases.length > 0 && (
        <div className="mbti-result-biases">
          <p className="mbti-result-biases-label">思考のクセ</p>
          {topBiases.map(b => (
            <div key={b.key} className="mbti-result-bias-item">
              <span className="mbti-bias-name">{b.name}</span>
              <span className="mbti-bias-short">{b.short}</span>
            </div>
          ))}
        </div>
      )}

      {typeInfo.todayAction && (
        <div className="mbti-result-action">
          <p className="mbti-result-action-label">今日ひとつだけ試すなら</p>
          <p className="mbti-result-action-text">{typeInfo.todayAction}</p>
        </div>
      )}

      <button className="mbti-result-retry" onClick={onRetry}>
        もう一度診断する
      </button>
    </div>
  );
}
