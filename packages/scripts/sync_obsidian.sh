#!/bin/bash
# sync_obsidian_to_repo.sh

SOURCE="/Users/alexgodfrey/Library/Mobile Documents/iCloud~md~obsidian/Documents/vaultington/website/notes/"
DEST="/Users/alexgodfrey/Developer/personal3/apps/web/src/content/notes/"

# Step 0: If DEST is a symlink, remove it safely
if [ -L "$DEST" ]; then
  echo "🧹 Removing existing symlink at $DEST"
  rm "$DEST"
fi

# Ensure DEST exists as a normal folder
mkdir -p "$DEST"

# Also clear the dest folder
rm -rf "$DEST"/*

# Step 1: Sync all files (dereferencing symlinks, preserving structure)
echo "📦 Syncing Obsidian notes..."
rsync -avh --delete --copy-links "$SOURCE" "$DEST"

# Step 2: Convert all .md files to .mdx and remove originals
echo "📝 Converting .md → .mdx ..."
find "$DEST" -type f -name "*.md" | while read -r file; do
  newfile="${file%.md}.mdx"
  mv "$file" "$newfile"
done

echo "✅ All Obsidian notes synced to $DEST (with .md files converted to .mdx)"
