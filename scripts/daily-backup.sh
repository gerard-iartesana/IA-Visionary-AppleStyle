#!/bin/bash
# Daily Git Backup - Creates dated tags and cleans old ones (keeps last 7 days)
# Runs daily at 9:00 AM via launchd

YESTERDAY=$(date -v-1d +%Y-%m-%d)
LOG_FILE="$HOME/Documents/GitHub/trabajos-antigravity-2026/scripts/backup.log"

echo "=== Backup $(date '+%Y-%m-%d %H:%M:%S') ===" >> "$LOG_FILE"

# --- Project 1: iadebarrio.com ---
REPO1="$HOME/Documents/GitHub/trabajos-antigravity-2026"
cd "$REPO1"
if git tag | grep -q "backup-$YESTERDAY"; then
    echo "[iadebarrio] Tag backup-$YESTERDAY already exists, skipping" >> "$LOG_FILE"
else
    git tag "backup-$YESTERDAY" -m "Daily backup $YESTERDAY"
    git push origin "backup-$YESTERDAY" 2>/dev/null
    echo "[iadebarrio] Created tag backup-$YESTERDAY" >> "$LOG_FILE"
fi

# --- Project 2: gerardfanals.online ---
REPO2="$HOME/Documents/GitHub/trabajos-antigravity-2026/gerard-fanals-web"
cd "$REPO2"
if git tag | grep -q "backup-$YESTERDAY"; then
    echo "[gerardfanals] Tag backup-$YESTERDAY already exists, skipping" >> "$LOG_FILE"
else
    git tag "backup-$YESTERDAY" -m "Daily backup $YESTERDAY"
    git push origin "backup-$YESTERDAY" 2>/dev/null
    echo "[gerardfanals] Created tag backup-$YESTERDAY" >> "$LOG_FILE"
fi

# --- Cleanup: delete tags older than 7 days ---
CUTOFF=$(date -v-7d +%Y-%m-%d)
for repo in "$REPO1" "$REPO2"; do
    cd "$repo"
    REPO_NAME=$(basename "$repo")
    for tag in $(git tag | grep "^backup-"); do
        TAG_DATE="${tag#backup-}"
        if [[ "$TAG_DATE" < "$CUTOFF" ]]; then
            git tag -d "$tag" 2>/dev/null
            git push origin --delete "$tag" 2>/dev/null
            echo "[$REPO_NAME] Deleted old tag $tag" >> "$LOG_FILE"
        fi
    done
done

echo "=== Done ===" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
