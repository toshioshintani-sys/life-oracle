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

// 結果冒頭の「私はこう読みました」—— タイプ別コールドリーディング
const TYPE_READING = {
  ENTJ: 'あなたの答えを見ていると、一つのことが見えました。あなたは「決める」ことで、周囲が動き出すのを知っている人です。',
  INTJ: 'あなたの答えには一貫した線があります。遠くを見ながら、静かに動いている人です。',
  ENTP: '答えのパターンから分かります。あなたは「まだ誰も気づいていないこと」を見つけるのが好きな人です。',
  INTP: 'あなたが選んだ答えは、細部まで正確であろうとしています。自分の中に体系を持っている人です。',
  ENFJ: 'あなたの答えを読むと、人のことを自分のことのように考えている人だと分かります。',
  INFJ: '答えの奥に、何か大きなものを守ろうとしている意志が見えます。静かですが、強い人です。',
  ENFP: 'あなたの答えは、可能性に向かって開いています。人に希望を与えることが、あなたの自然な在り方です。',
  INFP: '答えのひとつひとつに、あなた自身の価値観が滲んでいます。自分に正直に生きている人です。',
  ESTJ: 'あなたの答えには、責任を引き受ける姿勢があります。頼まれると断れない人でもありますね。',
  ISTJ: '答えに揺らぎがない。約束を守ることを、当たり前だと思っている人です。',
  ESTP: 'あなたの答えは速く、今この瞬間に向いています。考えるより先に動ける人です。',
  ISTP: '答えのパターンから、あなたは静かに観察してから動く人だと分かります。無駄がない。',
  ESFJ: 'あなたの答えには、周囲への気遣いが自然に入っています。場の空気を読むのが得意な人です。',
  ISFJ: '答えを見ていると、あなたが大切にしているものが伝わってきます。気づかれないところで支えている人です。',
  ESFP: 'あなたの答えには、今この場を楽しもうとするエネルギーがあります。一緒にいると明るくなる人です。',
  ISFP: '答えのひとつひとつが、あなた自身のペースで選ばれています。感じたことに正直な人です。',
};

export function MbtiResult({ result, onRetry }) {
  if (!result) return null;

  const { mbtiType, biasScores } = result;
  const typeInfo = cognitiveFunctionMap[mbtiType] ?? {};
  const famous   = famousPeople[mbtiType]?.people ?? [];
  const desc     = TYPE_DESC[mbtiType] ?? '';
  const reading  = TYPE_READING[mbtiType] ?? null;

  const topBiases = Object.entries(biasScores ?? {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([key]) => ({ key, ...biasInfo[key] }))
    .filter(b => b.name);

  return (
    <div className="mbti-result-screen">

      {reading && (
        <div className="mbti-result-reading-intro">
          <p className="mbti-result-reading-label">私はこう読みました。</p>
          <p className="mbti-result-reading-text">{reading}</p>
        </div>
      )}

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
