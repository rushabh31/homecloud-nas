# Dashboard (Patel Home Cloud)

> Fact labels: see the [README](../../README.md#verification-labels). Source of this file: deployed from this folder's `docker-compose.yml` on 2026-11-11.

## Purpose
One start page, **Patel Home Cloud**, with a tile for every service on the NAS. Each tile
opens that service's own sign-in page. Built with [Homepage](https://gethomepage.dev).
A green dot on a tile means the NAS can reach that service right now; red means it can't.

### Look and background
Behind the tiles is an animated cartoon landscape (mountains, a plateau, a lake, hills and
trees) drawn by [config/custom.js](config/custom.js) and styled by [config/custom.css](config/custom.css).
- **Season**: colours blend day by day. Peaks (tune to your climate): spring mid-April, summer
  mid-July, fall colour early November, winter mid-January. Spring has blossom and petals,
  fall has falling leaves, summer nights have fireflies, deep winter has snow on the ground.
- **Time of day**: the sun and moon follow the real sunrise and sunset, with a warm golden
  hour, twilight and stars. Tiles switch to a dark glass look at night.
- **Live weather**: every 15 minutes the browser asks [Open-Meteo](https://open-meteo.com)
  (free, no key, no account) for the current weather at the home town (coordinates
  rounded to the town, set as `LAT`/`LON` at the top of `custom.js`). Cloud cover sets how many clouds there are, rain, drizzle, snow, fog and
  thunderstorms each have their own effect, and wind speed moves the clouds, rain and trees.
  If the lookup fails the scene keeps a calm partly cloudy sky.
- **Weather chip**: the top bar's right end shows the temperature (°F) and the condition.
- Motion is slow, and switches off for anyone whose device asks for reduced motion.
- Design rules: 8 px spacing steps, 16 px radius for cards and the top bar, 12 px for chips
  and icon boxes, Nunito type (title 26/800, tile name 15/800, tile text 13/600), status
  dot 8 px in each tile's top-right corner, visible keyboard focus ring.

## Deployment
| Item | Value |
| --- | --- |
| Type | UGOS Docker app project `dashboard` |
| Image | `ghcr.io/gethomepage/homepage:v2.7.0` (one container) |
| Restart policy | `unless-stopped` |
| Inventory entry | `inventory/services.yaml` key `dashboard` |

## Ports
| NAS port | Container port | Use | Exposure |
| --- | --- | --- | --- |
| 3010 | 3000 | Web UI | LAN, and via tunnel behind Cloudflare Access |

## Volumes and data
| NAS path | Container path | Holds | Back up? |
| --- | --- | --- | --- |
| `/volume1/docker/dashboard/config` | `/app/config` | Homepage YAML, `custom.css` and `custom.js`, rewritten every time the container starts | No, the compose file rebuilds it |

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

Top bar: NAS CPU and free memory, free space on Volume 1, date and time, and the weather.

## How to change a tile
Everything is in [docker-compose.yml](docker-compose.yml): when the container starts, its
entrypoint writes `settings.yaml`, `widgets.yaml`, `services.yaml`, `custom.css` and `custom.js`
into `/app/config`, then starts Homepage. The copies in [config/](config/) are the readable
versions of the last two and must match what is in the compose file.
1. UGOS Docker app > Project > `dashboard` > Compose configuration.
2. Change the YAML under `cat > /app/config/services.yaml` (keep the indentation; icons are
   [dashboard-icons](https://github.com/homarr-labs/dashboard-icons) names like `immich.png`, or `mdi-...`).
   Do not use the `$` character anywhere: Docker Compose would treat it as a variable.
3. Redeploy. Copy the same change into this repo.

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
| Dashboard container not starting | Look at the `dashboard` log: a heredoc may be broken, or a `$` crept into the compose file |
| No weather chip, scene stays partly cloudy | The browser could not reach `api.open-meteo.com` (blocked by an ad blocker or offline); the rest of the page still works |
| Public address shows Cloudflare 502 | Container stopped, or the tunnel route points at the wrong port |

## Security notes
No secrets, no Docker socket, read-only links only. The only outside call is the browser's weather lookup to Open-Meteo, which sends the town's rounded coordinates and nothing about you. Public access only through Cloudflare
Access (owner's email). Do not add API keys for service widgets without moving them to `.env`.

## Verification
Last verified: 2026-11-11 (LAN page loaded with all tiles; public address showed the Cloudflare Access sign-in).
