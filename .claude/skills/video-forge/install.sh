#!/usr/bin/env bash
# video-forge を user レベルの skill として入れる（= どのプロジェクトでも発動する）。
#
#   bash install.sh              # ~/.claude/skills/video-forge へ
#   DEST=/path/to/skills bash install.sh
#
# 既に入っている場合は上書きする（作業中の kit は各プロジェクト側にコピーして使うので、
# ここが上書きされても作りかけの動画は消えない）。
set -euo pipefail

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST="${DEST:-$HOME/.claude/skills}"
TARGET="$DEST/video-forge"

mkdir -p "$DEST"
rm -rf "$TARGET"
mkdir -p "$TARGET"

# node_modules / out が紛れ込んでいてもコピーしない
tar -cf - -C "$SRC" \
  --exclude='node_modules' --exclude='out' --exclude='package-lock.json' \
  . | tar -xf - -C "$TARGET"

echo "installed: $TARGET"
echo "次のセッションから、どのプロジェクトでも「動画」の依頼で発動します。"
