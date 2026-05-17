// 8つの角度マスター
// angle ID → 名前・代表シーン・主要/補助フラグ

export const ANGLES = {
  work:     { label: '仕事場面',       scenes: '会議・締切・上司・部下', phase: 1 },
  relation: { label: '人間関係',       scenes: '友人・飲み会・SNS',       phase: 1 },
  stress:   { label: 'ストレス・限界時', scenes: '怒り・焦り・追い詰め',   phase: 1 },
  choice:   { label: '選択・意思決定', scenes: '買い物・メニュー・進路',   phase: 1 },
  rest:     { label: '休日・回復',     scenes: '一人時間・休日の過ごし方', phase: 2 },
  money:    { label: 'お金',           scenes: '値段・契約・衝動買い',     phase: 2 },
  conflict: { label: '対立・指摘',     scenes: '意見食い違い・ミス指摘',   phase: 2 },
  planning: { label: '計画・段取り',   scenes: '旅行・ToDo・締切管理',     phase: 2 },
};

export const PRIMARY_ANGLES = Object.keys(ANGLES).filter(k => ANGLES[k].phase === 1);
export const SECONDARY_ANGLES = Object.keys(ANGLES).filter(k => ANGLES[k].phase === 2);
