// jin_types.json をJSモジュールとして読み込む薄いラッパー。
// データは src/data_v2/jin/jin_types.json に置く（Viteは public/ からの import を許さないため）。
// 運用上の編集は jin_types.json を直接触り、Viteのリロードでバンドルに反映される。

import jinTypesJson from './jin_types.json';

export const JIN_TYPES = jinTypesJson.types;

export const JIN_TYPES_BY_ID = Object.fromEntries(
  jinTypesJson.types.map(t => [t.id, t])
);

export const JIN_TYPES_BY_TARGET = jinTypesJson.types.reduce((acc, t) => {
  (acc[t.target] ??= []).push(t);
  return acc;
}, {});

export function listCandidateIds(target) {
  return (JIN_TYPES_BY_TARGET[target] ?? []).map(t => t.id);
}
