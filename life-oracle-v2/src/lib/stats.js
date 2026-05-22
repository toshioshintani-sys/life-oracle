// 診断統計（ソーシャルプルーフ用）

import { supabase } from './supabase.js';

/** 全フローの累計診断数を取得 */
export async function getDiagnosisStats() {
  const { data, error } = await supabase
    .from('diagnosis_stats')
    .select('flow, count');

  if (error || !data) return null;

  const stats = {};
  for (const row of data) {
    stats[row.flow] = Number(row.count);
  }
  return stats;
}

/** 診断完了時に該当フローのカウンターを増分 */
export async function incrementDiagnosisStat(flow) {
  if (!['mbti', 'situation', 'attack'].includes(flow)) return null;
  try {
    const { data, error } = await supabase.rpc('increment_diagnosis_stat', { p_flow: flow });
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

/** 重複インクリメント防止（同じセッションで複数回呼ばないようにする） */
const incrementedFlows = new Set();
export function incrementOnce(flow) {
  if (incrementedFlows.has(flow)) return;
  incrementedFlows.add(flow);
  incrementDiagnosisStat(flow);
}
