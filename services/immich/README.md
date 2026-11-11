# Immich

> Fact labels: see the [README](../../README.md#how-facts-are-labelled). Source of this file: Deployed by Claude on 2026-11-11 from this file; VERIFIED 2026-11-11.

## Purpose
Self-hosted photo and video library for the family (Rushabh, user2, user3), with phone backup.

## Deployment
| Item | Value |
| --- | --- |
| Type | Docker Compose project (UGOS Docker app > Project `immich`) |
| Images | `ghcr.io/immich-app/immich-server:v3`, `ghcr.io/immich-app/immich-machine-learning:v3`, `valkey/valkey:9` (pinned digest), `ghcr.io/immich-app/postgres:14-vectorchord0.4.3-pgvectors0.2.0` (pinned digest) |
| Restart policy | `always` (VERIFIED, from this compose). |
| Inventory entry | [`inventory/services.yaml`](../../inventory/services.yaml) key `immich` |

## Ports
| NAS port | Container port | Use | Exposure |
| --- | --- | --- | --- |
| 2283 | 2283 | Web UI and API | LAN |

## Volumes and data
| NAS path | Container path | Holds | Back up? |
| --- | --- | --- | --- |
| `/volume1/docker/immich/library` | `/data` | Phone uploads, thumbnails, encoded video, DB dumps (`library/backups`) | **Yes, irreplaceable** |
| `/volume1/docker/immich/postgres` | `/var/lib/postgresql/data` | Database: albums, faces, sharing | **Yes** |
| `/volume1/@home/<user>/Photos` (x3) | `/external/<user>` | Existing NAS photos, **read-write** (owner's request 2026-11-11) | Yes (home folders) |
| named volume `model-cache` | `/cache` | ML models, re-downloadable | No |

## Environment variables
Names only. Real values live on the NAS, never in git. Copy `.env.example` to `.env` where one exists.

| Variable | Meaning |
| --- | --- |
| `DB_PASSWORD` / `POSTGRES_PASSWORD` | Database password (YAML anchor `x-db-password`). Secret: set on the NAS only. |
| `DB_HOSTNAME`, `DB_USERNAME`, `DB_DATABASE_NAME`, `REDIS_HOSTNAME` | Internal wiring, not secret |
| `TZ` | `America/New_York` |
| `DB_STORAGE_TYPE` | `HDD` (Volume 1 is a hard drive) |

## Access from a phone or laptop
| Device | At home | Away from home |
| --- | --- | --- |
| Phone | Install **Immich** (App Store / Google Play). Server URL `https://immich.example.com` (works everywhere), sign in, turn on Backup. | Same: `https://immich.example.com` |
| Laptop | Browser: `http://192.168.0.119:2283` (fastest) or `https://immich.example.com` | `https://immich.example.com` |

Tip: in the phone app, **Settings > Networking > Automatic URL switching**: add your home Wi-Fi name with `http://192.168.0.119:2283` as the local URL and `https://immich.example.com` as the external one. Backups then go straight to the NAS at home (no 100 MB limit) and through Cloudflare elsewhere.
Phone apps cannot pass a Cloudflare Access login page, so leave Access off this hostname and rely on Immich's own login with 2FA.

## Networks
`immich_default` (project network). Containers talk by service name (`database`, `redis`).

## Dependencies
Internal: postgres, redis, machine-learning. External: none. Startup order handled by `depends_on`.

## Domain and routing
`https://immich.example.com` via Cloudflare Tunnel **UGreenNAS**, direct route to `http://192.168.0.119:2283` (Pattern A, added 2026-11-11, VERIFIED working). Immich's External domain is set to the same URL (Administration > Settings > Server). No Cloudflare Access, because the phone app cannot pass a browser login; Immich's own login protects it, so use strong passwords. Cloudflare limits one upload request to 100 MB: very large videos may fail from outside the house, so let the phone app back up on home Wi-Fi.

## Deploy or replicate
1. Create the project folder on the NAS (`Files > docker > immich`) and any data subfolders listed above.
2. Copy `docker-compose.yml` (and `.env` from `.env.example`, filled in on the NAS).
3. `docker compose config -q` to check the file, or paste it into Docker app > Project > Create.
4. Deploy and watch logs: `docker compose logs -f`.
5. After first start: create admin, users, and one External Library per user pointing at `/external/<user>` with exclusions `**/@eaDir/**`, `**/.*/**`, `**/#recycle/**`. Trash 30 days. Daily library rescan `0 0 * * *`.
6. Update this README, `inventory/services.yaml` and `CHANGELOG.md` in the same commit.

Full checklist: [runbooks/deploy-new-service.md](../../runbooks/deploy-new-service.md).

## Update
Read release notes first (https://github.com/immich-app/immich/releases). Docker app > Project `immich` > Update. Stay on the `v3` tag; a major version bump needs a compose review. See [runbooks/update-service.md](../../runbooks/update-service.md).

## Backup
Back up `library/` and `postgres/` (or rely on Immich's nightly dumps in `library/backups`). Photos folders are covered with the home folders. **No NAS backup exists yet.**

## Restore
Restore `library/` and the newest dump from `library/backups`, then follow https://docs.immich.app/administration/backup-and-restore . Restore of home-folder photos: Snapshot app. See [runbooks/restore-service.md](../../runbooks/restore-service.md).

## Troubleshooting
| Symptom | Fix |
| --- | --- |
| Scan finds 0 files | `docker exec immich_server ls /external/<user>`; empty means the mount path is wrong. |
| Pull fails `toomanyrequests` | ghcr rate limit; wait a few minutes and Redeploy. |
| High CPU for hours | Expected during first indexing (31k files). Check Administration > Jobs. |

## Security notes
Read-write photo mounts mean deletes in Immich remove real files after 30 days in trash. Not exposed publicly. Two Immich admins (Rushabh, User3).

## Verification
Last verified: 2026-11-11 (UGOS Docker app and `docker inspect`, read only).
Re-verify with `scripts/discover-services.sh` and `scripts/detect-drift.py`.
