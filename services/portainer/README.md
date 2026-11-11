# Portainer CE

> Fact labels: see the [README](../../README.md#how-facts-are-labelled). Source of this file: Reconstructed from `docker inspect` on 2026-11-11.

## Purpose
Web UI to manage every Docker container on the NAS.

## Deployment
| Item | Value |
| --- | --- |
| Type | Docker project `portainer` |
| Images | `portainer/portainer-ce:latest` |
| Restart policy | `unless-stopped` in this file; observed policy TO_BE_VERIFIED. |
| Inventory entry | [`inventory/services.yaml`](../../inventory/services.yaml) key `portainer` |

## Ports
| NAS port | Container port | Use | Exposure |
| --- | --- | --- | --- |
| 9000 | 9000 | Web UI (HTTP) | LAN only |
| 8000 | 8000 | Edge agent tunnel | LAN (unused) |

## Volumes and data
| NAS path | Container path | Holds | Back up? |
| --- | --- | --- | --- |
| `/volume1/docker/portainer` | `/data` | Portainer DB and settings | Yes |
| `/var/run/docker.sock` | `/var/run/docker.sock` | Full Docker control (root-equivalent) | n/a |

## Environment variables
Names only. Real values live on the NAS, never in git. Copy `.env.example` to `.env` where one exists.

| Variable | Meaning |
| --- | --- |
| none | |

## Access from a phone or laptop
| Device | At home | Away from home |
| --- | --- | --- |
| Laptop | Browser: `http://192.168.0.119:9000` | `https://portainer.example.com` (published 2026-11-11; it controls every container, so add Cloudflare Access or remove the route) |
| Phone | Same address in the phone browser | `https://portainer.example.com` |

## Networks
`portainer_default`.

## Dependencies
Docker engine.

## Domain and routing
`portainer.example.com` via Cloudflare Tunnel UGreenNAS, direct to `http://192.168.0.119:9000` (added 2026-11-11 at the owner's request to bring all services up on the new domain). **Risk:** Portainer controls every container. Put Cloudflare Access in front of it or remove the route.

## Deploy or replicate
1. Create the project folder on the NAS (`Files > docker > portainer`) and any data subfolders listed above.
2. Copy `docker-compose.yml` (and `.env` from `.env.example`, filled in on the NAS).
3. `docker compose config -q` to check the file, or paste it into Docker app > Project > Create.
4. Deploy and watch logs: `docker compose logs -f`.
5. Create the admin user within 5 minutes of first start or Portainer locks setup.
6. Update this README, `inventory/services.yaml` and `CHANGELOG.md` in the same commit.

Full checklist: [runbooks/deploy-new-service.md](../../runbooks/deploy-new-service.md).

## Update
Pull new image and recreate. See [runbooks/update-service.md](../../runbooks/update-service.md).

## Backup
`/volume1/docker/portainer`.

## Restore
Restore the folder and redeploy. See [runbooks/restore-service.md](../../runbooks/restore-service.md).

## Troubleshooting
| Symptom | Fix |
| --- | --- |
| Setup page times out | Restart the container and create the admin within 5 minutes. |

## Security notes
Docker socket = root on the NAS. LAN only, strong password. Port 8000 can be removed if no edge agents are used.

## Verification
Last verified: 2026-11-11 (UGOS Docker app and `docker inspect`, read only).
Re-verify with `scripts/discover-services.sh` and `scripts/detect-drift.py`.
