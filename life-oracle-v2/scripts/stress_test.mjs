/**
 * ストレステスト：MBTI診断フローを3回自動走行し、
 * 「結果に到達するまでの操作数」と「全内容を読むのに必要なタップ数」を計測する。
 *
 * 実行: node scripts/stress_test.mjs
 */
import { createSession as createMbtiSession } from '../src/engine_v2/session.js';
import { applyAnswer, nextQuestion, buildResult } from '../src/engine_v2/flowSelf.js';
import { isFinished } from '../src/engine_v2/selector.js';

const MBTI_MAX_QUESTIONS = 20;

// 3パターンの回答クセ（被験者）
const PERSONAS = [
  { name: '即決タイプ（全部そう寄り）', pick: () => (Math.random() < 0.7 ? 1 : -1) },
  { name: '迷いタイプ（わからない多め）', pick: () => { const r = Math.random(); return r < 0.4 ? 0 : r < 0.7 ? 1 : -1; } },
  { name: 'ランダムタイプ', pick: () => [1, 0, -1][Math.floor(Math.random() * 3)] },
];

function runOnce(persona) {
  const sess = createMbtiSession('self');
  sess.maxQuestions = MBTI_MAX_QUESTIONS;
  let q = nextQuestion(sess);
  let answered = 0;
  const stems = [];
  while (q && !isFinished(sess)) {
    stems.push(q.stem ?? q.text ?? '(no stem)');
    applyAnswer(sess, q, persona.pick());
    answered++;
    if (isFinished(sess)) break;
    q = nextQuestion(sess);
  }
  const result = buildResult(sess);
  return { answered, result };
}

console.log('\n======================================================');
console.log('  ストレステスト：診断フロー実走 ×3');
console.log('======================================================\n');

for (let i = 0; i < PERSONAS.length; i++) {
  const p = PERSONAS[i];
  const { answered, result } = runOnce(p);
  console.log(`■ 実行 ${i + 1}：${p.name}`);
  console.log(`   設問数：${answered} 問`);
  console.log(`   判定タイプ：${result.mbtiType}`);
  const top2 = Object.entries(result.biasScores ?? {})
    .sort(([, a], [, b]) => b - a).slice(0, 2).map(([k]) => k);
  console.log(`   上位バイアス：${top2.join(', ') || '(なし)'}`);
  console.log('');
}

// ── 結果画面のUX計測（静的）─────────────────────────────
const HUB_CARDS = [
  '今日ひとつだけ試すなら', 'なぜそれが起きるか', 'あなた専用の処方箋',
  'あなたの思考のクセ', 'あなたの強み・心の癖', 'note で深く読む',
  'みんなのひとこと', 'この結果をシェアする',
];
console.log('------------------------------------------------------');
console.log('  結果画面（MbtiResult ハブ）の操作コスト');
console.log('------------------------------------------------------');
console.log(`設問回答後、結果テキストを見るまでに必要な追加操作：`);
console.log(`  1. 職業を選ぶ（18択）または スキップ ← PostQuiz`);
console.log(`  2. 年代を選ぶ（7択）`);
console.log(`  3. 「結果を見る」`);
console.log(`  → ここでようやくハブ画面。だが本文はまだ0文字。`);
console.log('');
console.log(`ハブ画面のカード数：${HUB_CARDS.length} 枚（すべてタップ式）`);
console.log(`全カードの中身を読むのに必要なタップ：`);
console.log(`  ${HUB_CARDS.length} 枚 ×（開く1 + 戻る1）= ${HUB_CARDS.length * 2} タップ`);
console.log('');
console.log(`→ 設問20問に加え、結果を全部読むのに最大 ${3 + HUB_CARDS.length * 2} 操作。`);
console.log(`→ 診断直後に表示される「文章」は TYPE_READING の1〜2文のみ。`);
console.log('======================================================\n');
