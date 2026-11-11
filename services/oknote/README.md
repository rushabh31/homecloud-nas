# OKNote

> Fact labels: see the [README](../../README.md#how-facts-are-labelled). Source of this file: Reconstructed from `docker inspect` on 2026-11-11. **Reference only**: reinstall from App Center.

## Purpose
Note-taking app installed from the UGREEN App Center.

## Deployment
| Item | Value |
| --- | --- |
| Type | App Center app (runs as Docker container `oknote`) |
| Images | `oknote/oknote:3.2.7` |
| Restart policy | Managed by App Center. |
| Inventory entry | [`inventory/services.yaml`](../../inventory/services.yaml) key `oknote` |

## Ports
| NAS port | Container port | Use | Exposure |
| --- | --- | --- | --- |
| 38080 | 38080 | Web UI | via tunnel |

## Volumes and data
| NAS path | Container path | Holds | Back up? |
| --- | --- | --- | --- |
| `/volume1/@appstore/com.magicforest.oknote/config` | `/app/config` | App config | Yes |
| `/volume1/Documents` | `/app/data` | Notes (Documents share) | **Yes** |
| `/volume1/@appstore/com.magicforest.oknote/data` | `/app/legacy` | Older data | Yes |

## Environment variables
Names only. Real values live on the NAS, never in git. Copy `.env.example` to `.env` where one exists.

| Variable | Meaning |
| --- | --- |
| `TZ` | Container uses `America/Manaus` (VERIFIED); set to `America/New_York` if the App Center allows. |

## Access from a phone or laptop
| Device | At home | Away from home |
| --- | --- | --- |
| Phone | Browser: `http://192.168.0.119:38080`, or `https://oknote.example.com` | `https://oknote.example.com`  |
| Laptop | Same as phone | Same as phone |

Add the page to the phone's home screen (Share > Add to Home Screen on iPhone, menu > Add to Home screen on Android) for an app-like icon.

## Networks
Default `bridge`.

## Dependencies
None.

## Domain and routing
`oknote.example.com` via Cloudflare Tunnel UGreenNAS, direct to `http://192.168.0.119:38080` (VERIFIED 2026-11-11).

## Deploy or replicate
1. Create the project folder on the NAS (`Files > docker > oknote`) and any data subfolders listed above.
2. Copy `docker-compose.yml` (and `.env` from `.env.example`, filled in on the NAS).
3. `docker compose config -q` to check the file, or paste it into Docker app > Project > Create.
4. Deploy and watch logs: `docker compose logs -f`.
5. Install from App Center; the compose here documents what App Center creates.
6. Update this README, `inventory/services.yaml` and `CHANGELOG.md` in the same commit.

Full checklist: [runbooks/deploy-new-service.md](../../runbooks/deploy-new-service.md).

## Update
App Center > Updates. See [runbooks/update-service.md](../../runbooks/update-service.md).

## Backup
Documents share (has a daily snapshot plan) plus the `@appstore` config folder.

## Restore
Reinstall from App Center, restore Documents from snapshot. See [runbooks/restore-service.md](../../runbooks/restore-service.md).

## Troubleshooting
| Symptom | Fix |
| --- | --- |
| 502 on the public URL | App stopped or route points to the wrong port. |

## Security notes
Public via tunnel; put Cloudflare Access in front.

## Verification
Last verified: 2026-11-11 (UGOS Docker app and `docker inspect`, read only).
Re-verify with `scripts/discover-services.sh` and `scripts/detect-drift.py`.
