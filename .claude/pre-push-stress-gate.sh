#!/usr/bin/env bash
# git push 前の proposal-stress-test ゲート（A案：毎回ブロック＋2段階）
#
# 既定で push をブロックする。proposal-stress-test スキル（Step0→A→B→C）を実施し、
# 結果を俊雄さんに提示して承認を得たうえで
#     touch .claude/.stress-test-ok
# を作成すると、直後の push 1回だけ通過する（マーカーは消費・30分で失効）。
#
# これは「Claude が暴走しがちなときの安全弁」。マーカーを儀式なしに作るのは本末転倒。
set -euo pipefail

MARKER="/home/user/life-oracle/.claude/.stress-test-ok"
NOW=$(date +%s)

if [ -f "$MARKER" ]; then
  MTIME=$(stat -c %Y "$MARKER" 2>/dev/null || echo 0)
  AGE=$((NOW - MTIME))
  rm -f "$MARKER"   # 単回使用：通っても弾いても必ず消費
  if [ "$AGE" -lt 1800 ]; then
    printf '{"systemMessage":"✅ stress-test ゲート通過（マーカー消費）。push を続行します。"}\n'
    exit 0
  fi
fi

printf '%s\n' '{"continue": false, "stopReason": "proposal-stress-test 未実施", "systemMessage": "🛑 git push はブロックされました（A案ゲート）。\n\n1) proposal-stress-test スキル（Step0→A→B→C）を実施\n2) 結果を俊雄さんに提示して承認を得る\n3) `touch .claude/.stress-test-ok` を作成\n4) もう一度 push する（2回目で通過）\n\nマーカーは単回使用・30分で失効します。"}'
exit 0
