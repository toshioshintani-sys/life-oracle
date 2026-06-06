#!/usr/bin/env bash
# git push 前に自動発火するストレステスト
# 異常検出時は continue:false でプッシュをブロックし、Claudeに原因を見せる

set -euo pipefail

RESULT=$(cd /home/user/life-oracle && node life-oracle-v2/scripts/stress_test.mjs 2>&1) || true

# 失敗条件: SIT が上位バイアスに混入 / タイプ判定が空 / 設問数が0
FAIL=0
if echo "$RESULT" | grep -qE "上位バイアス:.*SIT"; then
  FAIL=1
  REASON="SITバグ再発：SITが上位バイアスに混入しています"
fi
if echo "$RESULT" | grep -qE "設問数：0 問"; then
  FAIL=1
  REASON="診断エンジンが0問で終了しています"
fi
if echo "$RESULT" | grep -qE "判定タイプ：$"; then
  FAIL=1
  REASON="タイプ判定が空です"
fi

# JSON出力（改行をスペースに変換してsystemMessageに埋め込む）
SUMMARY=$(echo "$RESULT" | tr '"' "'" | tr '\n' ' ' | cut -c1-800)

if [ "$FAIL" -eq 1 ]; then
  printf '{"continue": false, "stopReason": "ストレステスト失敗 — %s", "systemMessage": "【ストレステスト失敗】%s\\n\\n詳細:\\n%s"}\n' \
    "${REASON}" "${REASON}" "${SUMMARY}"
else
  printf '{"systemMessage": "【ストレステスト通過】git push を続行します。\\n%s"}\n' "${SUMMARY}"
fi
