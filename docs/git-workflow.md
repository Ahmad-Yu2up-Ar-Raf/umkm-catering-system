# Team Git Workflow — Catering Nusantara

> Every team member MUST read and follow this guide before writing code.
> Goal: avoid conflicts, keep the commit history clean, and make code review easy.

---

## Table of Contents

1. [Branch Structure](#1-branch-structure)
2. [Naming Convention Rules](#2-naming-convention-rules)
3. [Daily Workflow (Step-by-Step)](#3-daily-workflow-step-by-step)
4. [How to Commit Properly](#4-how-to-commit-properly)
5. [How to Create a Pull Request](#5-how-to-create-a-pull-request)
6. [How to Review & Merge a PR](#6-how-to-review--merge-a-pr)
7. [How to Update a Branch with Main](#7-how-to-update-a-branch-with-main)
8. [How to Handle Merge Conflicts](#8-how-to-handle-merge-conflicts)
9. [Quick Command Cheat Sheet](#9-quick-command-cheat-sheet)

---

## 1. Branch Structure

We use a simple branch model:

```
main
  └── feat/nama-fitur        (new feature branch)
  └── fix/nama-bug           (bug fix branch)
  └── chore/nama-tugas       (setup/refactor/docs branch)
```

| Branch | Purpose | Who pushes |
|--------|--------|------------|
| `main` | Stable production code | **PROTECTED** — only via Pull Request & review |
| `feat/*` | New features | Each member |
| `fix/*` | Bug fixes | Each member |
| `chore/*` | Setup, refactor, docs | Each member |

**Important rules:**
- `main` is **protected** — cannot be pushed to directly. Must go through a Pull Request.
- One branch per task (issue). Do not use one branch for two different tasks.
- Delete the branch after it is merged into main (so they don't pile up).

---

## 2. Naming Convention Rules

### Branch Names

Format: `<type>/<short-feature-name>`

```
feat/api-paket-catalog
feat/halaman-katalog
fix/harga-kalkulasi-salah
chore/setup-tailwind-theme
chore/cleanup-route-lama
```

| Type | When to use |
|------|-------------|
| `feat/` | New feature (API, new page, new component) |
| `fix/` | Bug fix (wrong price, data not showing, errors) |
| `chore/` | Project setup, refactor, docs updates, code cleanup |

### Commit Messages

Format: `<type>: <short message>`

```
feat: add API endpoint public catalog
feat: slicing halaman katalog paket
fix: perbaiki kalkulasi total harga di pesanan
fix: handle error ketika API timeout
chore: setup tailwind v4 theme tokens
chore: hapus controller proyek lama
```

Use the same **type** as in the branch name.

---

## 3. Daily Workflow (Step-by-Step)

These are the steps every member must follow EVERY DAY:

### Step 1: Pull the latest updates from main

```bash
# Switch to the main branch
git checkout main

# Pull all the latest updates from GitHub
git pull origin main
```

> **Note:** Always `git pull` on `main` BEFORE you start coding.
> This keeps your local branch up to date with the team's latest code.

### Step 2: Create a new branch for today's task

```bash
# Create a new branch based on main (already pulled)
git checkout -b feat/api-paket-catalog
```

> **Rule:** 1 branch = 1 issue/task. If you are working on 2 different issues,
> create 2 separate branches. Do not mix them.

### Step 3: Do the work (coding)

```bash
# Edit files, add code, delete code, etc.
# Use VS Code or any editor
```

While coding, if you want to save temporary progress:

```bash
# Check which files changed
git status

# View the detailed changes
git diff
```

### Step 4: Stage & commit regularly

Don't wait until everything is finished to commit. **Commit every time you finish one logical unit.**

```bash
# Stage specific files (recommended: don't use git add . directly)
git add app/Http/Controllers/PaketController.php
git add routes/api.php

# or, if there are many files and you are sure it's safe:
git add .

# Commit with a clear message
git commit -m "feat: add PaketController with index and show methods"
```

**When to commit?** Every time you:
- Finish a function/method
- Finish a React component
- Finish slicing a page
- Before a break/lunch
- Before going home

### Step 5: Push the branch to GitHub

```bash
# First push (also creates the branch on the remote)
git push -u origin feat/api-paket-catalog

# Subsequent pushes (this is enough)
git push
```

> The first push will error if you've never pushed this branch before.
> That's why you use `git push -u origin branchname` for the first time.

### Step 6: Update the branch with main (if there are changes)

If someone merges into main while you're coding:

```bash
# Fetch main updates
git fetch origin main

# Merge main updates into your branch
git rebase origin/main

# or the merge alternative:
# git merge origin/main
```

**Why rebase?** It keeps the commit history tidy and linear.
But if you're not sure, `git merge origin/main` is safer.

### Step 7: Create a Pull Request (PR)

After the task is done and pushed:

1. Open https://github.com/Ahmad-Yu2up-Ar-Raf/umkm-catering-system
2. Click the **"Pull requests"** tab → click **"New pull request"**
3. Select: `base: main` ← `compare: feat/api-paket-catalog`
4. Fill in the PR form (details in the [How to Create a Pull Request](#5-how-to-create-a-pull-request) section)
5. Click **"Create pull request"**
6. Assign a reviewer (at least 1 person)
7. Attach a label: `backend`, `frontend`, or `fullstack`

### Step 8: PR merged? Delete the local branch

```bash
# Switch to main
git checkout main

# Pull the merged updates
git pull origin main

# Delete the local branch (no longer needed)
git branch -d feat/api-paket-catalog
```

---

## 4. How to Commit Properly

### Commit Format

```
<type>: <short message>
```

| Type | Meaning | Example |
|------|---------|---------|
| `feat` | New feature | `feat: add API paket catalog` |
| `fix` | Bug fix | `fix: kalkulasi total harga` |
| `chore` | Setup/deps/docs | `chore: setup tailwind v4` |
| `refactor` | Change code without changing behavior | `refactor: pindah logic ke service class` |
| `style` | Formatting/cleanup only | `style: format blade template` |

### Commit Rules

1. **Separate** feature commits from bug-fix commits. Do not mix them.
2. **1 logical change = 1 commit.** Don't wait until 10 files change before committing.
3. **Don't commit .env, node_modules, or vendor files.** These are already in `.gitignore`.
4. **Keep the commit message short, concise, and clear.** Avoid messages like "update", "fix", "nyoba".

---

## 5. How to Create a Pull Request

### PR Description Format

Open the **Pull requests** tab → **New pull request**, then fill in:

```
## Description
[briefly explain what was done]

## Related issue
Closes #4

## Changes
- [x] Clean routes/api.php of old controllers
- [x] Add public route GET /api/paket
- [x] Add public route GET /api/paket/{id}

## Screenshot (if any)
[attach screenshot]

## Checklist
- [ ] Code tested manually
- [ ] No console.log / debug code
- [ ] Pulled the latest main before creating the PR
```

### Assign a Reviewer

- **Backend** PR → assign to **@DenizRizki** or **@Ahmad-Yu2up-Ar-Raf**
- **Frontend** PR → assign to **@ThoriqAR1301** or **@Ahmad-Yu2up-Ar-Raf**
- **Fullstack** PR → assign to **@Ahmad-Yu2up-Ar-Raf** at minimum

### PR Labels

Attach the matching label:
- `backend` — for API / database / server-logic changes
- `frontend` — for UI / components / styling
- `fullstack` — for backend-frontend integration
- `priority-critical` — urgent, needs immediate review

---

## 6. How to Review & Merge a PR

### If you are assigned as Reviewer:

1. Open the **Pull requests** tab on GitHub
2. Click the PR that needs review
3. Click the **"Files changed"** tab — look at the code changes
4. Click a green/red line to leave a comment (if something needs fixing)
5. If it's fine, click **"Review changes"** → choose **"Approve"**
6. If something is wrong, choose **"Request changes"** and explain what needs fixing
7. **Don't merge it yourself** — let the PR author do the merge

### After it is approved (PR author):

1. Click the **"Merge pull request"** button
2. Choose **"Squash and merge"** (so the commits are combined into 1 on main)
3. Click **"Confirm merge"**
4. Click **"Delete branch"** — remove the branch that is no longer used

---

## 7. How to Update a Branch with Main

If your branch has fallen behind main (e.g. someone else's PR was merged first):

### Use Rebase (recommended)

```bash
# Make sure you are on your own branch
git checkout feat/api-paket-catalog

# Fetch main updates
git fetch origin main

# Rebase your branch on top of the latest main
git rebase origin/main

# If there are conflicts, resolve them first (see section 8)
# Once resolved, force push
git push --force-with-lease
```

### Use Merge (safer alternative)

```bash
git checkout feat/api-paket-catalog
git fetch origin main
git merge origin/main
# Resolve any conflicts
git push
```

> **Warning:** `git push --force` is dangerous. Always use `--force-with-lease`,
> which is safer. Or, if in doubt, use `git merge` instead.

---

## 8. How to Handle Merge Conflicts

A conflict happens when 2 people change the same file on the same lines.

### Step-by-step:

```bash
# 1. Update your branch
git fetch origin main
git rebase origin/main

# 2. Git will tell you which file conflicts
#    CONFLICT (content): Merge conflict in app/Http/Controllers/PaketController.php

# 3. Open the conflicting file
#    You will see markers:
#    <<<<<<< HEAD
#    your code
#    =======
#    code from main
#    >>>>>>> main

# 4. Remove the <<<<<<, ======, >>>>>> markers
#    Then choose which code is correct (or combine both)

# 5. Stage the fixed file
git add app/Http/Controllers/PaketController.php

# 6. Continue the rebase
git rebase --continue

# 7. If you're confused or want to cancel the rebase:
git rebase --abort
```

**Tips when conflicted:**
- Don't panic. Conflicts are normal, not a disaster.
- Communicate with the teammate who changed the same file.
- If confused, call **@Ahmad-Yu2up-Ar-Raf**, the Tech Lead.
- Alternative: use VS Code. Open the conflicting file — you'll see "Accept Current", "Accept Incoming", "Accept Both" options.

---

## 9. Quick Command Cheat Sheet

### Initial Setup (once)

```bash
git clone https://github.com/Ahmad-Yu2up-Ar-Raf/umkm-catering-system.git
cd umkm-catering-system
```

### Every Day (required)

```bash
git checkout main
git pull origin main
git checkout -b feat/tugas-saya
# ...coding...
git add .
git commit -m "feat: selesai bikin fitur X"
git push -u origin feat/tugas-saya
```

### Commit & Push

```bash
git status                          # Check changed files
git diff                            # View detailed changes
git add namafile                    # Stage a specific file
git add .                           # Stage all files (careful)
git commit -m "feat: pesan commit"  # Commit
git push                            # Push to GitHub
```

### Branch

```bash
git branch                          # List all local branches
git branch -a                       # List all branches (including remote)
git checkout namabranch             # Switch branch
git checkout -b namabranch          # Create + switch to a new branch
git branch -d namabranch            # Delete local branch (safe)
git branch -D namabranch            # Delete local branch (force)
```

### Update & Sync

```bash
git fetch origin main               # Fetch main updates (no merge)
git rebase origin/main              # Rebase branch onto the latest main
git merge origin/main               # Merge main into the branch
git push --force-with-lease         # Push after rebase (SAFE)
git push --force                    # Force push (DANGEROUS, don't use)
```

### Pull Request (via CLI)

```bash
# Create a PR from the terminal
gh pr create --base main --head feat/nama-branch --title "feat: judul PR" --body "deskripsi"
```

---

## Concise Visual Flow

```
main
  │
  ├── git pull (get updates)
  │
  ├── git checkout -b feat/tugas-saya
  │
  ├── [CODING] → git add → git commit (repeat several times)
  │
  ├── git push -u origin feat/tugas-saya
  │
  ├── [OPEN GITHUB] → Create Pull Request → Assign Reviewer
  │
  ├── [REVIEWER] → Approve
  │
  ├── [MERGE] → Squash and merge → Delete branch
  │
  └── Back to the start
```

---

## References

- GitHub Issues & Project Board: https://github.com/users/Ahmad-Yu2up-Ar-Raf/projects/6
- Repository: https://github.com/Ahmad-Yu2up-Ar-Raf/umkm-catering-system
- Official Git Guide: https://git-scm.com/docs

---

*This document can be updated as the team needs. If anything is unclear, ask **@Ahmad-Yu2up-Ar-Raf**.*
