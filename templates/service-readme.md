# <Service name>

> Fact labels: see the [README](../../README.md#how-facts-are-labelled). Source of this file: <how you know: deployed from this file on DATE / reconstructed from docker inspect on DATE / EXAMPLE>

## Purpose
<One or two sentences: what it does and who uses it.>

## Deployment
| Item | Value |
| --- | --- |
| Type | Docker Compose project `<name>` / App Center app / VM |
| Images | `<image>:<pinned tag>` |
| Restart policy | `unless-stopped` |
| Inventory entry | `inventory/services.yaml` key `<name>` |

## Ports
| NAS port | Container port | Use | Exposure |
| --- | --- | --- | --- |
| <port> | <port> | Web UI | LAN / via tunnel |

## Volumes and data
| NAS path | Container path | Holds | Back up? |
| --- | --- | --- | --- |
| `/volume1/docker/<name>/data` | `/data` | <what> | Yes |

## Environment variables
Names only. Real values live in `.env` on the NAS.

| Variable | Meaning |
| --- | --- |
| `<VAR>` | <meaning; mark secrets> |

## Access from a phone or laptop
| Device | At home | Away from home |
| --- | --- | --- |
| Phone | <app to install, or browser address `http://192.168.0.119:<port>`> | <public hostname / VPN only> |
| Laptop | <browser address> | <public hostname / VPN only> |

## Networks
<project default network / shared `proxy` network>

## Dependencies
<other services, databases, external APIs>

## Domain and routing
<`https://<sub>.example.com` via Pattern A/B, or "LAN only">

## Deploy or replicate
1. Create `/volume1/docker/<name>` and data folders.
2. Copy `docker-compose.yml`; create `.env` from `.env.example` on the NAS.
3. `docker compose config -q`, then deploy.
4. <first-run steps>

## Update
<how to update; pin tags; read release notes>

## Backup
<what to back up>

## Restore
<steps>

## Troubleshooting
| Symptom | Fix |
| --- | --- |
| | |

## Security notes
<exposure, auth, secrets>

## Verification
Last verified: YYYY-MM-DD (<how>).
