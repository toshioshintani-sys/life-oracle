import { getWorkResult }     from './work.js';
import { getRelationResult } from './relation.js';
import { getSelfResult }     from './self.js';
import { getFutureResult }   from './future.js';

// 年代・状況に関係なく絶対に破綻しない絶対安全テキスト
// neutral テキストが存在しない場合の最終フォールバック（30代など特定年代に落とさない）
const ABSOLUTE_FALLBACK = {
  hook: '言葉にしにくい何かが、あなたの中に溜まっています。',
  sideA: '何かが引っかかっている。でもそれが何なのか、うまく言葉にできない。その感覚は、あなたが鈍いからではありません。状況が複合的に絡んでいるとき、人はそうなります。',
  sideB: 'もう一つの可能性は、見えていても直視を避けていることです。知っているけど認めたくない。その回避には、必ず何らかの理由があります。',
  closing: 'どちらにせよ、そのモヤモヤは「今の自分に何かを変えるタイミングが来ている」というサインかもしれません。',
  jungNote: null,
  biasNote: null,
  action: 'まず、今日感じたことを3行だけ書いてみてください。うまく書けなくてもいい。書くことで、モヤモヤが少し輪郭を持ちはじめます。',
};

export function getResult(situation, ageGroup) {
  if (situation.startsWith('w_')) return getWorkResult(situation, ageGroup);
  if (situation.startsWith('r_')) return getRelationResult(situation, ageGroup);
  if (situation.startsWith('s_')) return getSelfResult(situation, ageGroup);
  if (situation.startsWith('f_')) return getFutureResult(situation, ageGroup);
  return null;
}

// 年代信頼度に基づく安全なテキスト取得
// 優先順: 指定ageGroup → neutral → ABSOLUTE_FALLBACK（特定年代には落とさない）
export function getResultWithFallback(situation, ageGroup) {
  // ageGroup が有効なら年代別テキストを試みる
  if (ageGroup && ageGroup !== 'neutral') {
    const primary = getResult(situation, ageGroup);
    if (primary) return primary;
  }

  // neutral テキスト（全年代に違和感のない汎用版）
  const neutral = getResult(situation, 'neutral');
  if (neutral) return neutral;

  // 絶対安全フォールバック（特定年代テキストには落とさない）
  return ABSOLUTE_FALLBACK;
}
