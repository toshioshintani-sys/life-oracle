import { getWorkResult }     from './work.js';
import { getRelationResult } from './relation.js';

export function getResult(situation, ageGroup) {
  if (situation.startsWith('w_')) return getWorkResult(situation, ageGroup);
  if (situation.startsWith('r_')) return getRelationResult(situation, ageGroup);
  // 今後: s_ f_ のドメインを追加
  return null;
}
