# Mattermost Team Edition

> Fact labels: see the [README](../../README.md#how-facts-are-labelled). Source of this file: Reconstructed from `docker inspect` on 2026-11-11. Both containers are **stopped**.

## Purpose
Self-hosted team chat.

## Deployment
| Item | Value |
| --- | --- |
| Type | Docker project `mattermost` (2 containers) |
| Images | `mattermost/mattermost-team-edition:latest`, `postgres:18` |
| Restart policy | Observed: auto-restart **Disabled** (VERIFIED 2026-11-11). This file uses `unless-stopped`. |
| Inventory entry | [`inventory/services.yaml`](../../inventory/services.yaml) key `mattermost` |

## Ports
| NAS port | Container port | Use | Exposure |
| --- | --- | --- | --- |
| 8401 | 8065 | Web UI | via tunnel |

## Volumes and data
| NAS path | Container path | Holds | Back up? |
| --- | --- | --- | --- |
| `/volume1/docker/mattermost/{config,data,logs,plugins,client,indexes}` | `/mattermost/...` | App data | Yes |
| `/volume1/docker/mattermost/db` | `/var/lib/postgresql` | Postgres 18 data | **Yes** |

## Environment variables
Names only. Real values live on the NAS, never in git. Copy `.env.example` to `.env` where one exists.

| Variable | Meaning |
| --- | --- |
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | **Secret** (password). In `.env` on the NAS. |
| `MM_SQLSETTINGS_DATASOURCE` | Built from the above |
| `MM_SERVICESETTINGS_SITEURL` | `https://mattermost.example.com` (VERIFIED) |

## Access from a phone or laptop
Mattermost is **stopped** today; start the project first.

| Device | At home | Away from home |
| --- | --- | --- |
| Phone | Install **Mattermost** (App Store / Google Play), server URL `https://mattermost.example.com` (works at home too) | Same URL |
| Laptop | Browser or the Mattermost desktop app: `https://mattermost.example.com`, or `http://192.168.0.119:8401` on the home network | `https://mattermost.example.com` |

The site URL in the compose file must match the address people use, or links and the mobile app break.

## Networks
`mattermost_default`.

## Dependencies
`db` must be healthy first.

## Domain and routing
`mattermost.example.com` via the tunnel (route target TO_BE_VERIFIED).

## Deploy or replicate
1. Create the project folder on the NAS (`Files > docker > mattermost`) and any data subfolders listed above.
2. Copy `docker-compose.yml` (and `.env` from `.env.example`, filled in on the NAS).
3. `docker compose config -q` to check the file, or paste it into Docker app > Project > Create.
4. Deploy and watch logs: `docker compose logs -f`.
5. Mattermost runs as UID 2000: `chown -R 2000:2000 /volume1/docker/mattermost/{config,data,logs,plugins,client,indexes}`.
6. Update this README, `inventory/services.yaml` and `CHANGELOG.md` in the same commit.

Full checklist: [runbooks/deploy-new-service.md](../../runbooks/deploy-new-service.md).

## Update
Pin a version tag before upgrading; read https://docs.mattermost.com/upgrade/ . Postgres major upgrades need dump/restore. See [runbooks/update-service.md](../../runbooks/update-service.md).

## Backup
`pg_dump` of the DB plus `data/` and `config/`.

## Restore
Restore folders, `psql` the dump into a fresh `db`, start `mattermost`. See [runbooks/restore-service.md](../../runbooks/restore-service.md).

## Troubleshooting
| Symptom | Fix |
| --- | --- |
| Permission denied on start | UID 2000 ownership (see deploy). |
| Postgres 18 refuses old data dir | PG18 expects `/var/lib/postgresql`, not `/var/lib/postgresql/data`. |

## Security notes
Publicly reachable through the tunnel when running; consider Cloudflare Access.

## Verification
Last verified: 2026-11-11 (UGOS Docker app and `docker inspect`, read only).
Re-verify with `scripts/discover-services.sh` and `scripts/detect-drift.py`.
