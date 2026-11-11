# SiYuan

> Fact labels: see the [README](../../README.md#how-facts-are-labelled). Source of this file: Reconstructed from `docker inspect` on 2026-11-11. **Reference only**.

## Purpose
Personal knowledge base / notes, installed from the UGREEN App Center.

## Deployment
| Item | Value |
| --- | --- |
| Type | App Center app (Docker container `siyuan-app-1`) |
| Images | `ugreen/siyuan:v3.8.4` |
| Restart policy | Managed by App Center. |
| Inventory entry | [`inventory/services.yaml`](../../inventory/services.yaml) key `siyuan` |

## Ports
| NAS port | Container port | Use | Exposure |
| --- | --- | --- | --- |
| 6806 | 6806 | Web UI | LAN |

## Volumes and data
| NAS path | Container path | Holds | Back up? |
| --- | --- | --- | --- |
| `/volume1/@appstore/com.ugreen.docker.siyuan/config` | `/home/siyuan/sy` | Workspace (all notes) | **Yes** |

## Environment variables
Names only. Real values live on the NAS, never in git. Copy `.env.example` to `.env` where one exists.

| Variable | Meaning |
| --- | --- |
| `TZ` | `America/Manaus` observed. Access code is set in the app (secret, not documented). |

## Access from a phone or laptop
| Device | At home | Away from home |
| --- | --- | --- |
| Laptop | Browser: `http://192.168.0.119:6806`, enter the SiYuan access code | Only through a VPN to the home network (UniFi VPN on the Dream Machine Pro, WireGuard or Teleport; not set up yet, TO_BE_VERIFIED), then use the home address, unless a hostname is published (set an access code and Cloudflare Access first) |
| Phone | Same address in the phone browser | VPN only today |

## Networks
Default `bridge`.

## Dependencies
None.

## Domain and routing
`siyuan.example.com` via Cloudflare Tunnel UGreenNAS, direct to `http://192.168.0.119:6806` (VERIFIED 2026-11-11). Protected by SiYuan's access code.

## Deploy or replicate
1. Create the project folder on the NAS (`Files > docker > siyuan`) and any data subfolders listed above.
2. Copy `docker-compose.yml` (and `.env` from `.env.example`, filled in on the NAS).
3. `docker compose config -q` to check the file, or paste it into Docker app > Project > Create.
4. Deploy and watch logs: `docker compose logs -f`.
5. Install from App Center.
6. Update this README, `inventory/services.yaml` and `CHANGELOG.md` in the same commit.

Full checklist: [runbooks/deploy-new-service.md](../../runbooks/deploy-new-service.md).

## Update
App Center > Updates. See [runbooks/update-service.md](../../runbooks/update-service.md).

## Backup
The workspace folder; also SiYuan's own export.

## Restore
Reinstall, stop the app, restore the workspace folder, start. See [runbooks/restore-service.md](../../runbooks/restore-service.md).

## Troubleshooting
| Symptom | Fix |
| --- | --- |
| Blank page | Clear browser cache; check container logs. |

## Security notes
Set an access code before any publishing.

## Verification
Last verified: 2026-11-11 (UGOS Docker app and `docker inspect`, read only).
Re-verify with `scripts/discover-services.sh` and `scripts/detect-drift.py`.
