# Disaster recovery

| Scenario | Impact today | Recovery |
| --- | --- | --- |
| Single HDD fails | **All data lost** (no RAID, no backup) | None today. Fix with RAID 1 + backup |
| Photos deleted in Immich | Recoverable 30 days from Immich trash, longer from snapshots (if the home folder has a plan) | Immich Trash or Snapshot app |
| Ransomware on SMB share | Snapshots are read-only, so recoverable | Snapshot app restore |
| NAS hardware dies, disk OK | Data likely fine | New UGREEN NAS, migrate disk, [rebuild runbook](../runbooks/rebuild-entire-nas.md) |
| Cloudflare token lost | Public apps down | Refresh token, redeploy cloudflared |
| House loss | Everything lost | Needs off-site backup |

## Recovery order
1. Network (UDM) -> 2. NAS + Volume 1 -> 3. cloudflared -> 4. databases ->
5. apps (Immich, Mattermost, OKNote, SiYuan) -> 6. NPM (if Pattern B) -> 7. Home Assistant VM.
Start order and dependencies: [inventory/dependencies.md](../inventory/dependencies.md).

## Keep off the NAS
- Password manager entries: NAS admin, Cloudflare account, tunnel token, each `.env`.
- A copy of this repo (GitHub).
- UniFi backup file.
