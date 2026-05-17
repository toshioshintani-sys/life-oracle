import { getWorkResult } from './work.js';

export function getResult(situation, ageGroup) {
  if (situation.startsWith('w_')) return getWorkResult(situation, ageGroup);
  // 今後: r_ s_ f_ のドメインを追加
  return null;
}
