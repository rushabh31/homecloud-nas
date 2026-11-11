# Nginx Proxy Manager

> Fact labels: see the [README](../../README.md#how-facts-are-labelled). Source of this file: Reconstructed from `docker inspect` on 2026-11-11. Container is **stopped**.

## Purpose
Reverse proxy with a web UI. Optional middle hop (Pattern B) between the tunnel and apps.

## Deployment
| Item | Value |
| --- | --- |
| Type | Docker project `npm` |
| Images | `jc21/nginx-proxy-manager:latest` |
| Restart policy | `unless-stopped` in this file; observed policy TO_BE_VERIFIED. |
| Inventory entry | [`inventory/services.yaml`](../../inventory/services.yaml) key `nginx-proxy-manager` |

## Ports
| NAS port | Container port | Use | Exposure |
| --- | --- | --- | --- |
| 80 | 80 | HTTP proxy (tunnel wildcard target) | LAN |
| 81 | 81 | Admin UI | LAN only |
| 443 | 443 | HTTPS proxy (LAN use) | LAN |

## Volumes and data
| NAS path | Container path | Holds | Back up? |
| --- | --- | --- | --- |
| `/volume1/docker/npm/data` | `/data` | Proxy hosts, DB, logs | Yes |
| `/volume1/docker/npm/letsencrypt` | `/etc/letsencrypt` | Certificates | Yes |
| `/volume1/docker/npm/config.json` | `/app/config/production.json` | DB config file (contents TO_BE_VERIFIED; may hold credentials) | Yes, never commit |

## Environment variables
Names only. Real values live on the NAS, never in git. Copy `.env.example` to `.env` where one exists.

| Variable | Meaning |
| --- | --- |
| `INITIAL_ADMIN_EMAIL`, `INITIAL_ADMIN_PASSWORD` | First-start admin only. **Secret.** |
| `TZ` | `America/New_York` |

## Access from a phone or laptop
| Device | At home | Away from home |
| --- | --- | --- |
| Laptop | Admin UI: `http://192.168.0.119:81` (NPM must be running) | Only through a VPN to the home network (UniFi VPN on the Dream Machine Pro, WireGuard or Teleport; not set up yet, TO_BE_VERIFIED), then use the home address. Never publish port 81. |
| Phone | Same address in the phone browser (small screen; laptop is easier) | VPN only |

The apps behind NPM are reached by their own `https://<name>.example.com` addresses, not through this page.

## Networks
`npm_default`. Forwards to apps via `192.168.0.119:<port>`.

## Dependencies
None to start. Pattern B routes depend on it being up.

## Domain and routing
Serves only the four old `example.net` hostnames (tunnel routes to `http://192.168.0.119:80`). The `example.com` routes go straight to each app and do not need NPM. NPM was found stopped on 2026-11-11 (stopped 2026-11-04, auto-restart disabled) and started again; set `docker update --restart unless-stopped Nginx-Proxy-Manager` over SSH so it survives restarts. See [domains/nginx-proxy-manager-setup.md](../../domains/nginx-proxy-manager-setup.md).

## Deploy or replicate
1. Create the project folder on the NAS (`Files > docker > nginx-proxy-manager`) and any data subfolders listed above.
2. Copy `docker-compose.yml` (and `.env` from `.env.example`, filled in on the NAS).
3. `docker compose config -q` to check the file, or paste it into Docker app > Project > Create.
4. Deploy and watch logs: `docker compose logs -f`.
5. Ports 80/443 may clash with UGOS's own web server. Check with `ss -ltnp | grep -E ':(80|443) '` first and remap (for example 8080:80) if busy.
6. Update this README, `inventory/services.yaml` and `CHANGELOG.md` in the same commit.

Full checklist: [runbooks/deploy-new-service.md](../../runbooks/deploy-new-service.md).

## Update
Pull new image and recreate. Back up `data/` first. See [runbooks/update-service.md](../../runbooks/update-service.md).

## Backup
`data/`, `letsencrypt/`, `config.json`.

## Restore
Restore the three paths, redeploy. See [runbooks/restore-service.md](../../runbooks/restore-service.md).

## Troubleshooting
| Symptom | Fix |
| --- | --- |
| Container exits immediately | Port 80/443 in use, or `config.json` points at a DB that is not running. Check logs. |
| Redirect loop | Turn off Force SSL in NPM; TLS is already handled by Cloudflare. |
| 413 Request Entity Too Large | Add `client_max_body_size 0;` in the host's Advanced tab. |

## Security notes
Keep port 81 off the internet. Change the default admin login on first start.

## Verification
Last verified: 2026-11-11 (UGOS Docker app and `docker inspect`, read only).
Re-verify with `scripts/discover-services.sh` and `scripts/detect-drift.py`.
