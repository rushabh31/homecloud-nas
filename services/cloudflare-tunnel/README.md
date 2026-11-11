# Cloudflare Tunnel (cloudflared)

> Fact labels: see the [README](../../README.md#how-facts-are-labelled). Source of this file: Reconstructed from `docker inspect` on 2026-11-11. The `command` line is TO_BE_VERIFIED (token was hidden by design).

## Purpose
Outbound-only connector that publishes selected NAS apps at `*.example.com` without port forwarding.

## Deployment
| Item | Value |
| --- | --- |
| Type | Docker container `cloudflare-tunnel` (project folder TO_BE_VERIFIED) |
| Images | `cloudflare/cloudflared:latest` |
| Restart policy | `unless-stopped` (read from Docker through Portainer, VERIFIED 2026-11-11). UGOS shows "Disabled" because it only counts `always`. Managed as Portainer stack `cloudflared`. |
| Inventory entry | [`inventory/services.yaml`](../../inventory/services.yaml) key `cloudflare-tunnel` |

## Ports
| NAS port | Container port | Use | Exposure |
| --- | --- | --- | --- |
| none | none | Outbound only | n/a |

## Volumes and data
| NAS path | Container path | Holds | Back up? |
| --- | --- | --- | --- |
| none | none | Configuration lives in the Cloudflare dashboard (token-managed tunnel) | Back up the token in a password manager |

## Environment variables
Names only. Real values live on the NAS, never in git. Copy `.env.example` to `.env` where one exists.

| Variable | Meaning |
| --- | --- |
| `TUNNEL_TOKEN` | **Secret.** Zero Trust > Networks > Tunnels > (tunnel) > Configure. Never commit. |

## Access from a phone or laptop
Nothing to open on a phone or laptop: the tunnel has no web page. Manage it from any browser at the Cloudflare Zero Trust dashboard (Networks > Tunnels). On the NAS, check it in Docker app > Container > `cloudflare-tunnel` > Log.

## Networks
Own project network. Reaches apps via the NAS LAN IP `192.168.0.119:<port>`.

## Dependencies
Internet access to Cloudflare; target apps must be running. Public hostnames (routes) are defined in the Cloudflare dashboard: TO_BE_VERIFIED, see [networking/cloudflare](../../networking/cloudflare/README.md).

## Domain and routing
Serves `oknote.example.com` (USER-PROVIDED) and `mattermost.example.com` (from Mattermost's site URL). Full route list TO_BE_VERIFIED.

## Deploy or replicate
1. Create the project folder on the NAS (`Files > docker > cloudflare-tunnel`) and any data subfolders listed above.
2. Copy `docker-compose.yml` (and `.env` from `.env.example`, filled in on the NAS).
3. `docker compose config -q` to check the file, or paste it into Docker app > Project > Create.
4. Deploy and watch logs: `docker compose logs -f`.
5. Create the tunnel in Cloudflare Zero Trust first and copy its token into `.env`.
6. Update this README, `inventory/services.yaml` and `CHANGELOG.md` in the same commit.

Full checklist: [runbooks/deploy-new-service.md](../../runbooks/deploy-new-service.md).

## Update
Pull the new `latest` image and recreate. Safe; brief disconnect only. See [runbooks/update-service.md](../../runbooks/update-service.md).

## Backup
Nothing on disk. Keep the token in a password manager and export the route list (screenshot or `cloudflared tunnel info`) into [domains/domain-inventory.md](../../domains/domain-inventory.md).

## Restore
Redeploy with the same token. If the token is lost: rotate it in the dashboard (Configure > Refresh token) and redeploy. See [runbooks/restore-service.md](../../runbooks/restore-service.md).

## Troubleshooting
| Symptom | Fix |
| --- | --- |
| Error 1033 | Tunnel not connected: container stopped or token wrong. |
| 502 Bad Gateway | Tunnel fine, origin app down or wrong IP:port in the route. |
| Tunnel shows `Down` after reboot | Check the container's restart policy in Portainer; it should be `unless-stopped`. |

## Security notes
Whoever holds the token can run the tunnel. Rotate it if it leaks. Consider Cloudflare Access in front of every hostname.

## Verification
Last verified: 2026-11-11 (UGOS Docker app and `docker inspect`, read only).
Re-verify with `scripts/discover-services.sh` and `scripts/detect-drift.py`.
