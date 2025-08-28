#!/bin/bash

# Simulate pulling latest changes from main branch
if [ -z "$1" ]; then
    echo "Usage: ./scripts/branch-pull.sh <branch-name>"
    echo "This updates the specified branch with the latest changes from main"
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

echo "Pulling latest changes from main into branch: $BRANCH_NAME"

# Create a backup of the branch
echo "Creating backup of branch..."
cp -r "$BRANCH_DIR" "$BRANCH_DIR.backup.$(date +%s)"

# Update branch with latest main changes
echo "Updating branch files with main..."
cp -r client/ "$BRANCH_DIR/"
cp -r server/ "$BRANCH_DIR/"
cp -r shared/ "$BRANCH_DIR/"
cp -r public/ "$BRANCH_DIR/"
cp *.ts "$BRANCH_DIR/" 2>/dev/null || true
cp *.js "$BRANCH_DIR/" 2>/dev/null || true
cp *.json "$BRANCH_DIR/" 2>/dev/null || true
cp *.md "$BRANCH_DIR/" 2>/dev/null || true

# Update branch info
echo "Updated: $(date)" >> "$BRANCH_DIR/BRANCH_INFO.md"

echo "Successfully pulled latest changes from main into branch: $BRANCH_NAME"
echo "Branch backup created at: $BRANCH_DIR.backup.*"