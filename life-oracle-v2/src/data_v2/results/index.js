import { getWorkResult }     from './work.js';
import { getRelationResult } from './relation.js';
import { getSelfResult }     from './self.js';
import { getFutureResult }   from './future.js';

export function getResult(situation, ageGroup) {
  if (situation.startsWith('w_')) return getWorkResult(situation, ageGroup);
  if (situation.startsWith('r_')) return getRelationResult(situation, ageGroup);
  if (situation.startsWith('s_')) return getSelfResult(situation, ageGroup);
  if (situation.startsWith('f_')) return getFutureResult(situation, ageGroup);
  return null;
}
