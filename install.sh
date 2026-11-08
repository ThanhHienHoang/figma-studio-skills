#!/bin/sh
# Link each skill folder (and _shared) into a Claude Code skills directory.
# Existing entries are never touched: anything already there is skipped.
# Usage: sh install.sh [target-dir]   (default: ~/.claude/skills)
set -eu

SRC="$(cd "$(dirname "$0")/skills" && pwd)"
DEST="${1:-$HOME/.claude/skills}"
mkdir -p "$DEST"

for dir in "$SRC"/*/; do
  name="$(basename "$dir")"
  if [ -e "$DEST/$name" ] || [ -L "$DEST/$name" ]; then
    echo "skip   $name (already exists in $DEST)"
  else
    ln -s "${dir%/}" "$DEST/$name"
    echo "linked $name -> $DEST/$name"
  fi
done
