# VPS Git Setup — u-select Backend

## Goal
Set up the VPS to receive backend code pushes directly from the local machine via SSH and git, without going through GitHub.

The local workspace has two parts:
- `backend/` → pushed directly to VPS via git (this folder)
- `u-select/` → frontend, goes through GitHub separately

---

## Step 1 — Install git on VPS

```bash
sudo apt update && sudo apt install git -y
git --version
```

---

## Step 2 — Create the bare repo (the git "hub" on this VPS)

```bash
mkdir -p ~/repos/u-select-backend.git
cd ~/repos/u-select-backend.git
git init --bare
```

---

## Step 3 — Create the working directory (where the actual code will live)

```bash
mkdir -p ~/apps/u-select-backend
```

---

## Step 4 — Set up the post-receive hook (auto-deploys code on every push)

```bash
nano ~/repos/u-select-backend.git/hooks/post-receive
```

Paste the following content into the file:

```bash
#!/bin/bash
git --work-tree=/root/apps/u-select-backend \
    --git-dir=/root/repos/u-select-backend.git \
    checkout -f
echo "Deployed successfully"
```

Save and exit (`Ctrl+X`, then `Y`, then `Enter`), then make it executable:

```bash
chmod +x ~/repos/u-select-backend.git/hooks/post-receive
```

---

## Step 5 — Verify the hook is executable

```bash
ls -la ~/repos/u-select-backend.git/hooks/post-receive
```

Should show `-rwxr-xr-x` permissions.

---

## That's it — VPS side is ready.

The local machine will now add this VPS as a git remote and push the backend folder using:

```bash
git remote add vps ssh://root@your-vps-ip/root/repos/u-select-backend.git
git subtree push --prefix=backend vps main
```

Every subsequent deploy from the local machine is just:

```bash
git subtree push --prefix=backend vps main
```

---

## Notes
- The bare repo at `~/repos/u-select-backend.git` is the central hub (like GitHub)
- The working directory at `~/apps/u-select-backend` is where the live code lives
- The post-receive hook automatically syncs the working directory on every push
- Changes made on the VPS can be committed and pushed back to the bare repo, then pulled locally
