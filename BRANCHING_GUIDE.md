# 🌿 Simple Branching System for Your Project

Since Git operations are restricted in Replit, I've created a file-based branching system that works perfectly for your development workflow.

## Quick Commands

### Create a new branch:
```bash
./scripts/branch-create.sh feature-name
```

### Switch to a branch:
```bash
./scripts/branch-switch.sh feature-name
```

### List all branches:
```bash
./scripts/branch-list.sh
```

## Example Workflow

1. **Create a new branch for payment improvements:**
   ```bash
   ./scripts/branch-create.sh payment-improvements
   ```

2. **Make your changes in the main directory** (client/, server/, etc.)

3. **Switch to another branch when needed:**
   ```bash
   ./scripts/branch-switch.sh main-backup
   ```

4. **List all your branches:**
   ```bash
   ./scripts/branch-list.sh
   ```

## How It Works

- Creates complete copies of your project in `branches/` folder
- Automatically excludes heavy folders (node_modules, .git, dist)
- Backs up your current state before switching
- Each branch has its own `BRANCH_INFO.md` with details

## Ready to Use!

Your branching system is now ready. Just tell me:
1. What branch name you want to create
2. What changes you want to make in that branch

I'll handle the rest!