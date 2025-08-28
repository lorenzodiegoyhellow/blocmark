#!/bin/bash

# Simple branch switching script
if [ -z "$1" ]; then
    echo "Usage: ./scripts/branch-switch.sh <branch-name>"
    echo "Available branches:"
    ls -1 branches/ 2>/dev/null || echo "No branches found"
    exit 1
fi

BRANCH_NAME="$1"
BRANCH_DIR="branches/$BRANCH_NAME"

if [ ! -d "$BRANCH_DIR" ]; then
    echo "Branch '$BRANCH_NAME' does not exist!"
    echo "Available branches:"
    ls -1 branches/ 2>/dev/null || echo "No branches found"
    exit 1
fi

echo "Switching to branch: $BRANCH_NAME"

# Backup current state to main branch
echo "Backing up current state to branches/main-backup..."
mkdir -p branches/main-backup
rsync -av --exclude=node_modules --exclude=.git --exclude=branches --exclude=dist ./ branches/main-backup/

# Copy branch files to main directory
echo "Copying branch files to main directory..."
rsync -av --exclude=node_modules --exclude=.git --exclude=branches --exclude=dist "$BRANCH_DIR/" ./

echo "Successfully switched to branch: $BRANCH_NAME"
echo "Previous state backed up to: branches/main-backup"