# VPS Git Setup — u-select Backend

## Goal
Set up the VPS to receive backend code pushes directly from the local machine via SSH and git, without going through GitHub.

- `backend/` → its own git repo, pushed directly to VPS via SSH
- `u-select/` → frontend, separate repo, goes through GitHub

---

## Actual Working Setup (as of April 5, 2026)

### VPS Details
- **Provider**: Google Cloud (GCP)
- **IP**: `34.132.140.203`
- **OS**: Debian/Ubuntu
- **Users on VPS**:
  - `danbagheni` — main user, owns the repos, used for Google Cloud browser SSH
  - `dan-macbook` — created automatically by GCP when SSH key was added
  - `root` — enabled for SSH key login (see below)

### Where things live on the VPS
- **Bare repo** (the git hub): `/home/danbagheni/repos/u-select-backend.git`
- **Working directory** (live code): `/home/danbagheni/apps/u-select-backend`
- **Post-receive hook**: `/home/danbagheni/repos/u-select-backend.git/hooks/post-receive`

### Post-receive hook content
```bash
#!/bin/bash
git --work-tree=/home/danbagheni/apps/u-select-backend \
    --git-dir=/home/danbagheni/repos/u-select-backend.git \
    checkout -f
echo "Deployed successfully"
```

### Local machine git setup
- Git is initialized inside `backend/` only (not the parent folder)
- Remote name: `vps`
- Remote URL: `ssh://root@34.132.140.203/home/danbagheni/repos/u-select-backend.git`

### Root SSH — how it was enabled on GCP
GCP blocks root SSH by default. To enable it:
1. SSH in as `dan-macbook` (the GCP-created user)
2. Copy the authorized key to root: `sudo cp ~/.ssh/authorized_keys /root/.ssh/authorized_keys`
3. Uncomment root login in sshd config: `sudo sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config`
4. Restart SSH: `sudo systemctl restart ssh`

Root pushes work because root can access files owned by `danbagheni`, and the safe.directory exception was added:
```bash
git config --global --add safe.directory /home/danbagheni/repos/u-select-backend.git
```

---

## Daily deploy command (from local `backend/` folder)

```bash
git add .
git commit -m "your message"
git push vps main
```

---

## Notes
- `backend/` has its own `.git` — it is NOT a subtree of the parent folder
- Root SSH uses key-only auth (`prohibit-password`) — no password brute force risk
- The post-receive hook auto-deploys to `/home/danbagheni/apps/u-select-backend` on every push
- To SSH into the VPS: `ssh root@34.132.140.203` or `ssh danbagheni@34.132.140.203` (via GCP browser console)




###In case Ip change
git remote set-url vps ssh://root@NEW_IP/home/danbagheni/repos/u-select-backend.git