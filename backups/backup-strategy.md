# Backup strategy

## Current (VERIFIED 2026-11-11)
| Item | State |
| --- | --- |
| Backup tasks | None |
| Sync tasks | None |
| Snapshots | Documents, user2, user3 daily; Rushabh home gap since ~2026-11-01; `docker` none |
| Cloud | Google Drive connected (about 179 of 300 GB used), no task |
| UPS | None detected |

## What to protect (priority order)
| Data | Path | Why |
| --- | --- | --- |
| Family photos | `/volume1/@home/*/Photos` | Irreplaceable; now editable from Immich |
| Immich uploads | `/volume1/docker/immich/library` | Phone uploads exist only here |
| Immich DB | `/volume1/docker/immich/library/backups` (nightly dumps) | Albums, faces, sharing |
| Documents | `/volume1/Documents` | Shared docs, OKNote |
| Service data | `/volume1/docker/*` | Fast rebuild |
| HA backups | Home Assistant > Backups | Automations |
| This repo | GitHub | Rebuild instructions |

## Target (3-2-1)
1. **Snapshots** (same disk): daily on `docker` and every home folder, keep 30. Fix Rushabh's plan.
2. **Local backup**: nightly to a USB drive or second NAS via Sync & Backup > Back up & Restore.
3. **Off-site**: weekly encrypted copy of Photos + Documents + Immich library to cloud (Google Drive has ~120 GB free; photos alone are ~167 GB, so a bigger plan or another target such as Backblaze B2 is needed).
4. **RAID 1** with a second disk (availability, not a backup).
5. Test a restore every quarter; log it in `CHANGELOG.md`.

All of these change production settings: owner approval required.
