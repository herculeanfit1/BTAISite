#!/bin/bash
SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BACKUP_REPO="git@github.com:herculeanfit1/BridgingTrustAISite-Backups.git"
TEMP_DIR="/tmp/backup-$(date +%s)"
echo "Backing up $SOURCE_DIR to $BACKUP_REPO"
mkdir -p "$TEMP_DIR"; cd "$TEMP_DIR" || exit 1
git clone "$SOURCE_DIR" source || exit 1; cd source || exit 1
git remote add backup "$BACKUP_REPO" || echo "Remote already exists"
git push -f backup main
cd "$HOME"; rm -rf "$TEMP_DIR"; echo "Backup complete!"
