#!/bin/bash

# Simple branch creation script
if [ -z "$1" ]; then
    echo "Usage: ./scripts/branch-create.sh <branch-name>"
    exit 1
fi

BRANCH_NAME="$1"
BRANCH_DIR="branches/$BRANCH_NAME"

if [ -d "$BRANCH_DIR" ]; then
    echo "Branch '$BRANCH_NAME' already exists!"
    exit 1
fi

echo "Creating branch: $BRANCH_NAME"
mkdir -p "$BRANCH_DIR"

# Copy main files to branch (excluding node_modules, .git, branches)
rsync -av --exclude=node_modules --exclude=.git --exclude=branches --exclude=dist ./ "$BRANCH_DIR/"

# Create branch info file
cat > "$BRANCH_DIR/BRANCH_INFO.md" << EOF
# Branch: $BRANCH_NAME

Created: $(date)
Base: main
Status: active

## Changes in this branch:
- 

## To switch to this branch:
\`\`\`bash
./scripts/branch-switch.sh $BRANCH_NAME
\`\`\`
EOF

echo "Branch '$BRANCH_NAME' created successfully!"
echo "Directory: $BRANCH_DIR"