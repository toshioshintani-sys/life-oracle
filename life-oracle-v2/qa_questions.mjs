// 質問構成 QA Lint / ストレステスト基盤
// ユーザー指摘の3問題を機械検出する：
//   ① 似た回答の選択肢（choice同士の文字類似度が高い）
//   ② 文字が分散していない（choiceの文字数バラつきが小さい＝のっぺり）
//   ③ 回答が度合いじゃない（は構造判定が難しいので「選択肢が並列名詞で軸が不明」を近似検出）
// さらに診断健全性：各選択肢にスコア寄与があるか／識別子が実在するか等。

import { WORK_QUESTIONS }     from './src/data_v2/questions/work.js';
import { RELATION_QUESTIONS } from './src/data_v2/questions/relation.js';
import { SELF_QUESTIONS }     from './src/data_v2/questions/self.js';
import { FUTURE_QUESTIONS }   from './src/data_v2/questions/future.js';
import { DISCRIMINATING_QUESTIONS } from './src/data_v2/questions/discriminating.js';
import { ATTACK_BOSS_QUESTIONS }           from './src/data_v2/questions/attack_boss.js';
import { ATTACK_COLLEAGUE_QUESTIONS }      from './src/data_v2/questions/attack_colleague.js';
import { ATTACK_SUBORDINATE_QUESTIONS }    from './src/data_v2/questions/attack_subordinate.js';
import { ATTACK_PARENT_QUESTIONS }         from './src/data_v2/questions/attack_parent.js';
import { ATTACK_CHILD_QUESTIONS }          from './src/data_v2/questions/attack_child.js';
import { ATTACK_SIBLING_QUESTIONS }        from './src/data_v2/questions/attack_sibling.js';
import { ATTACK_GRANDPARENT_QUESTIONS }    from './src/data_v2/questions/attack_grandparent.js';
import { ATTACK_PARTNER_QUESTIONS }        from './src/data_v2/questions/attack_partner.js';
import { ATTACK_ALMOST_PARTNER_QUESTIONS } from './src/data_v2/questions/attack_almost_partner.js';

const POOLS = {
  work: WORK_QUESTIONS, relation: RELATION_QUESTIONS, self: SELF_QUESTIONS,
  future: FUTURE_QUESTIONS, discriminating: DISCRIMINATING_QUESTIONS,
  attack_boss: ATTACK_BOSS_QUESTIONS, attack_colleague: ATTACK_COLLEAGUE_QUESTIONS,
  attack_subordinate: ATTACK_SUBORDINATE_QUESTIONS, attack_parent: ATTACK_PARENT_QUESTIONS,
  attack_child: ATTACK_CHILD_QUESTIONS, attack_sibling: ATTACK_SIBLING_QUESTIONS,
  attack_grandparent: ATTACK_GRANDPARENT_QUESTIONS, attack_partner: ATTACK_PARTNER_QUESTIONS,
  attack_almost_partner: ATTACK_ALMOST_PARTNER_QUESTIONS,
};

// ── 文字列ユーティリティ ──
function bigrams(s) {
  const t = (s || '').replace(/\s/g, '');
  const set = new Set();
  for (let i = 0; i < t.length - 1; i++) set.add(t.slice(i, i + 2));
  return set;
}
function diceSim(a, b) {
  const A = bigrams(a), B = bigrams(b);
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  return (2 * inter) / (A.size + B.size);
}
function variance(arr) {
  if (arr.length === 0) return 0;
  const m = arr.reduce((s, x) => s + x, 0) / arr.length;
  return arr.reduce((s, x) => s + (x - m) ** 2, 0) / arr.length;
}

// 共通語尾候補（全選択肢がこれで終わると「のっぺり・選びにくい」）
function tail(s, n) { return (s || '').replace(/\s/g, '').slice(-n); }
function head(s, n) { return (s || '').replace(/\s/g, '').slice(0, n); }

const SIM_THRESHOLD = 0.45;   // 意味の重複（bigram Dice）

const findings = [];
let totalQ = 0, totalChoiceQ = 0;

for (const [pool, qs] of Object.entries(POOLS)) {
  for (const q of qs) {
    totalQ++;
    const choices = q.choices || [];
    if (choices.length < 2) continue;
    if (q.type === 'demographic') continue;
    totalChoiceQ++;
    const labels = choices.map(c => c.label || '');

    // ① 意味が似すぎるペア
    const simPairs = [];
    for (let i = 0; i < labels.length; i++)
      for (let j = i + 1; j < labels.length; j++) {
        const s = diceSim(labels[i], labels[j]);
        if (s >= SIM_THRESHOLD) simPairs.push({ i, j, s: +s.toFixed(2) });
      }

    // ② 全選択肢が同じ語尾（3字）で終わる＝のっぺり・対比が弱い
    const tails = labels.map(l => tail(l, 4));
    const sharedTail = labels.length >= 3 && tails.every(t => t === tails[0]) ? tails[0] : null;
    // 全選択肢が同じ語頭（3字）で始まる
    const heads = labels.map(l => head(l, 3));
    const sharedHead = labels.length >= 3 && heads.every(h => h === heads[0]) ? heads[0] : null;

    // ③ スコア寄与のない選択肢（diagnostic dead choice）
    const deadChoices = choices.filter(c => {
      const hasScore =
        (c.situationScores && Object.keys(c.situationScores).length) ||
        (c.attackTypeHints && Object.keys(c.attackTypeHints).length) ||
        (c.biasHints && Object.keys(c.biasHints).length) ||
        (c.jungHints && Object.keys(c.jungHints).length) ||
        (c.jungShadowHints && Object.keys(c.jungShadowHints).length) ||
        (typeof c.value === 'number');
      return !hasScore;
    }).map(c => c.id);

    const issues = [];
    if (simPairs.length)    issues.push(`似すぎ選択肢 ${simPairs.map(p => `「${labels[p.i].slice(0,12)}」×「${labels[p.j].slice(0,12)}」(${p.s})`).join(' / ')}`);
    if (sharedTail)         issues.push(`全選択肢が同語尾「…${sharedTail}」`);
    if (sharedHead)         issues.push(`全選択肢が同語頭「${sharedHead}…」`);
    if (deadChoices.length) issues.push(`無スコア選択肢 [${deadChoices.join(',')}]`);

    if (issues.length) {
      findings.push({ pool, id: q.id, choices: choices.length, issues, text: (q.text||'').slice(0, 30) });
    }
  }
}

// ── レポート ──
const byType = { sim: 0, tail: 0, head: 0, dead: 0 };
for (const f of findings) for (const is of f.issues) {
  if (is.startsWith('似すぎ')) byType.sim++;
  else if (is.startsWith('全選択肢が同語尾')) byType.tail++;
  else if (is.startsWith('全選択肢が同語頭')) byType.head++;
  else if (is.startsWith('無スコア')) byType.dead++;
}

console.log('========================================');
console.log('  質問構成 QA Lint レポート');
console.log('========================================');
console.log(`総質問数: ${totalQ} / 選択式: ${totalChoiceQ}`);
console.log(`問題のある質問: ${findings.length}`);
console.log(`  ① 似すぎ選択肢を含む:   ${byType.sim}`);
console.log(`  ② 全選択肢が同じ語尾:   ${byType.tail}`);
console.log(`  ③ 全選択肢が同じ語頭:   ${byType.head}`);
console.log(`  ④ 無スコア選択肢:       ${byType.dead}`);
console.log('----------------------------------------');
for (const f of findings) {
  console.log(`[${f.pool}] ${f.id} (${f.choices}択)「${f.text}…」`);
  for (const is of f.issues) console.log(`    - ${is}`);
}
console.log('========================================');

// JSON も吐く（差分比較用）
import { writeFileSync } from 'fs';
writeFileSync(process.argv[2] || '/tmp/qa_report.json', JSON.stringify({ totalQ, totalChoiceQ, count: findings.length, byType, findings }, null, 2));
console.log(`JSON: ${process.argv[2] || '/tmp/qa_report.json'}`);
