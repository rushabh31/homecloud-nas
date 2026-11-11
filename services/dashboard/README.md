# Dashboard (Patel Home Cloud)

> Fact labels: see the [README](../../README.md#verification-labels). Source of this file: deployed from this folder's `docker-compose.yml` on 2026-11-11.

## Purpose
One start page, **Patel Home Cloud**, with a tile for every service on the NAS. Each tile
opens that service's own sign-in page. Built with [Homepage](https://gethomepage.dev).
A green dot on a tile means the NAS can reach that service right now; red means it can't.

## Deployment
| Item | Value |
| --- | --- |
| Type | UGOS Docker app project `dashboard` |
| Images | `ghcr.io/gethomepage/homepage:v2.7.0`, `busybox:1.37.0` (config writer, runs once per deploy) |
| Restart policy | `unless-stopped` (dashboard); `no` (config writer) |
| Inventory entry | `inventory/services.yaml` key `dashboard` |

## Ports
| NAS port | Container port | Use | Exposure |
| --- | --- | --- | --- |
| 3010 | 3000 | Web UI | LAN, and via tunnel behind Cloudflare Access |

## Volumes and data
| NAS path | Container path | Holds | Back up? |
| --- | --- | --- | --- |
| `/volume1/docker/dashboard/config` | `/app/config` | Homepage YAML + `custom.css`, rewritten on every deploy | No, the compose file rebuilds it |

## Environment variables
No secrets. `HOMEPAGE_ALLOWED_HOSTS` lists the addresses the page may be opened at
(`dashboard.example.com`, `192.168.0.119:3010`, the NAS's `.local` name). Add a host
here if you open it some other way, or Homepage shows "host validation failed".

## What is on it
| Group | Tile | Opens |
| --- | --- | --- |
| Photos | Immich | `https://immich.example.com` |
| Communication | Mattermost | `https://mattermost.example.com` |
| Smart home | Home Assistant | `https://ha.example.com` |
| Notes | OKNote, SiYuan | `https://oknote.example.com`, `https://siyuan.example.com` |
| Admin | NAS admin, Portainer, Nginx Proxy Manager | `https://mynas.example.com`, `https://portainer.example.com`, `http://192.168.0.119:81` (home only) |

Top bar: NAS CPU and free memory, free space on Volume 1, date and time.

## How to change a tile
Everything is in [docker-compose.yml](docker-compose.yml): the `dashboard-config` container
writes `settings.yaml`, `widgets.yaml`, `services.yaml` and `custom.css` before Homepage starts.
1. UGOS Docker app > Project > `dashboard` > Edit.
2. Change the YAML under `cat > /config/services.yaml` (keep the indentation; icons are
   [dashboard-icons](https://github.com/homarr-labs/dashboard-icons) names like `immich.png`, or `mdi-...`).
3. Save and redeploy. Copy the same change into this repo.

## Access from a phone or laptop
| Device | At home | Away from home |
| --- | --- | --- |
| Phone | `https://dashboard.example.com` (or `http://192.168.0.119:3010`). Add it to the home screen: Safari Share > Add to Home Screen, or Chrome menu > Add to Home screen. | `https://dashboard.example.com` |
| Laptop | `http://192.168.0.119:3010` or `https://dashboard.example.com`; bookmark it or set it as the browser start page | `https://dashboard.example.com` |

**Login**: the public address is behind Cloudflare Access (app "Patel Home Cloud dashboard",
reusable policy "Owner only"). Enter the owner's email and type the code Cloudflare emails,
or use "Sign in with Google" with the same address. One sign-in lasts 7 days per browser.
The LAN address has no login of its own, like the other apps' LAN ports.

Each tile then asks for that app's own sign-in. NAS admin and Portainer have a second
Cloudflare Access check (their own app, 24 h). The Home Assistant phone app, Immich app and
Mattermost app keep using the service addresses directly, not the dashboard.

## Networks
Project default network `dashboard_default`.

## Dependencies
None to run. Status dots need the NAS to reach each service's LAN address.

## Domain and routing
`https://dashboard.example.com` -> Cloudflare Access -> tunnel UGreenNAS -> `http://192.168.0.119:3010` (Pattern A).

## Deploy or replicate
1. UGOS Docker app > Project > Create: name `dashboard`, storage path `Shared folder/docker/dashboard`,
   paste `docker-compose.yml`, Deploy.
2. Check `http://192.168.0.119:3010` loads.
3. Cloudflare Zero Trust > Access > Applications: self-hosted app for `dashboard.example.com`
   with the "Owner only" policy. **Create this before the route.**
4. Tunnel UGreenNAS > Public hostname `dashboard.example.com` -> `http://192.168.0.119:3010`.
5. Open the public address in a private window: the Cloudflare Access sign-in must appear.

## Update
Change the pinned `homepage` tag after reading the release notes, then redeploy.

## Backup
Nothing to back up beyond this repo.

## Restore
Redeploy from this folder (steps above).

## Troubleshooting
| Symptom | Fix |
| --- | --- |
| "Host validation failed" | Add the address to `HOMEPAGE_ALLOWED_HOSTS` and redeploy |
| A tile has a red dot | The NAS can't reach that service: check the container, or the VLAN path for Home Assistant |
| Dashboard container not starting | Look at the `dashboard-config` log: a YAML heredoc may be broken |
| Public address shows Cloudflare 502 | Container stopped, or the tunnel route points at the wrong port |

## Security notes
No secrets, no Docker socket, read-only links only. Public access only through Cloudflare
Access (owner's email). Do not add API keys for service widgets without moving them to `.env`.

## Verification
Last verified: 2026-11-11 (LAN page loaded with all tiles; public address showed the Cloudflare Access sign-in).
