#!/bin/bash

# List all branches
echo "Available branches:"
echo "=================="

if [ -d "branches" ]; then
    for branch in branches/*/; do
        if [ -d "$branch" ]; then
            branch_name=$(basename "$branch")
            echo "📂 $branch_name"
            
            # Show branch info if available
            if [ -f "$branch/BRANCH_INFO.md" ]; then
                echo "   $(grep "Created:" "$branch/BRANCH_INFO.md" || echo "No creation date")"
                echo "   $(grep "Status:" "$branch/BRANCH_INFO.md" || echo "Status: unknown")"
            fi
            echo
        fi
    done
else
    echo "No branches directory found. Create your first branch with:"
    echo "./scripts/branch-create.sh <branch-name>"
fi