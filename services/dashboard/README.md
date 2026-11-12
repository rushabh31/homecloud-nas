# Dashboard (Our Home)

> Fact labels: see the [README](../../README.md#verification-labels). Source of this file: deployed from this folder's `docker-compose.yml` on 2026-11-11.

## Purpose
One start page, **Our Home** (renamed from Patel Home Cloud on 2026-11-12), with a tile for every service on the NAS. Each tile
opens that service's own sign-in page. Built with [Homepage](https://gethomepage.dev).
A green dot on a tile means the NAS can reach that service right now; red means it can't.

### Look and background
Behind the tiles is a small animated mountain village in the style of a warm 3D cartoon film,
drawn by [config/custom.js](config/custom.js) and styled by [config/custom.css](config/custom.css).
Everyone in it is an original character (no film characters or artwork are copied).
- **Village**: six cottages and a chapel with a bell on the first hill, a square with street
  lamps and a well, a pond with a little dock, rolling hills and snow-capped peaks. Windows and
  lamps light up at dusk and in gloomy weather, and chimneys smoke when it is cold.
- **Villagers by season** (daytime, dry weather): spring has a gardener with a watering can, a
  kid flying a kite and a cyclist; summer has someone fishing off the dock, a swimmer, a picnic
  and an ice cream cart; fall has leaf raking, a kid jumping into the pile and pumpkin carrying;
  winter has a snowman being built, sledding, a snowball fight and skaters once the pond freezes.
- **Rain**: villagers walk under umbrellas and a kid in a raincoat jumps in a puddle; the
  outdoor activities pause. **Night**: a lantern walker strolls the path and someone sits on
  the bench looking at the stars.
- **Holidays** (US calendar, computed each year): Valentine's (Feb 10 to 14, heart garland and a
  couple on the bench), Easter week (egg hunt), Fourth of July (Jul 1 to 5 flags, bunting and a
  grill; fireworks the nights of Jul 3 and 4), Halloween (from Oct 15 pumpkins, bats and orange
  lights; costumed trick-or-treaters from Oct 25), Thanksgiving (the week before to the day after:
  a feast table in the square, cornstalks and hay bales), Christmas (Dec 1 to Jan 5: roof lights,
  wreaths, a lit tree with presents, carolers; a sleigh crosses the sky on Christmas Eve night)
  and New Year (fireworks the nights of Dec 31 and Jan 1). Diwali (two days either side of
  Lakshmi Puja: diyas on every doorstep, star lanterns, a rangoli in the square, kids with
  sparklers and fireworks on the night itself) and Holi (the day of colours and the days around
  it: villagers in white throwing coloured powder). Their dates follow the Hindu lunar calendar,
  so they are listed per year in `DIWALI` and `HOLI` near `festival()` in `custom.js`
  (filled in through 2030; add later years there). The fox cub, bunny, ducks and owl
  from the earlier valley still live here.
- **Testing**: in the browser console set `window.PHC_NOW = new Date(2026, 11, 24, 20)`,
  `window.PHC_FEST = "fest-xmas fest-eve"` or `window.PHC_TEST_WEATHER = {kind: "rain", ...}`,
  then run `PHC_APPLY()`.
- **Season**: colours blend day by day. Peaks (tune to your climate): spring mid-April, summer
  mid-July, fall colour early November, winter mid-January. Spring has blossom and petals,
  fall has falling leaves, summer nights have fireflies, deep winter has snow.
- **Time of day**: the sun and moon follow the real sunrise and sunset, with a warm golden
  hour, twilight and stars. Tiles switch to a dark glass look at night.
- **Live weather**: every 15 minutes the browser asks [Open-Meteo](https://open-meteo.com)
  (free, no key, no account) for the current weather at the home town (coordinates rounded to
  the town, set as `PHC_LAT`/`PHC_LON` on the prelude line the compose file writes ahead of `custom.js`). Cloud cover sets the clouds; rain, drizzle, snow, fog and thunderstorms
  each have their own effect; wind moves clouds, rain and trees. If the lookup fails the scene
  keeps a calm partly cloudy sky.
- **Weather chip**: the top bar's right end shows the temperature (°F) and the condition.
- Motion is slow, and switches off for anyone whose device asks for reduced motion.
- **Tile layout**: one grid of four columns: Photos, Communication and Notes (two
  tiles) on top; Smart home and Admin (three tiles) below; Documents (three tiles) in a third row. Two
  columns on a tablet.
  On a phone (640 px or narrower) the top bar shrinks to the name, the weather and three small gauges, every
  tile becomes an app icon in one glass panel (four to a row, same order, status dot on the icon), and the
  village is drawn across the lower half of the screen so the cottages and villagers stay in view.
- **Design rules**: 4/8/12/16/24 px spacing, 20 px radius for cards and the top bar, 12 px for
  chips and icon boxes, Nunito type (title 26/900, tile name 16/800, tile text 13/600, group
  labels 12/800 capitals), status dot in each tile's top-right corner (an arrow replaces it on
  hover), visible keyboard focus ring.
- **Cache**: Cloudflare caches `/api/config/custom.js` and `custom.css` for 4 hours. The script
  reloads both with a time stamp that changes every 5 minutes, so a new look shows within about
  5 minutes. To see it at once, purge the cache for the dashboard hostname in Cloudflare
  (Caching > Configuration > Custom Purge > Hostname).

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
| Documents | Paperless, Nextcloud, ConvertX | `https://paperless.example.com`, `https://nextcloud.example.com`, `https://convertx.example.com` |

Top bar: NAS CPU and free memory, free space on Volume 1, date and time, and the weather.

## How to change a tile
Everything is in [docker-compose.yml](docker-compose.yml): when the container starts, its
entrypoint writes `settings.yaml`, `widgets.yaml`, `services.yaml`, `custom.css` and `custom.js`
into `/app/config`, then starts Homepage. The copies in [config/](config/) are the readable
versions of the last two and must match what is in the compose file.

The tiles, widgets, settings and CSS are plain text in the compose file. `custom.js` is not: it is
written as a one-line prelude (`window.PHC_LAT`, `window.PHC_LON`, `window.PHC_PLACE`, the town the
weather is for) followed by the village script, gzipped and base64-encoded, because the whole start
command must stay under Linux's 128 KB limit for one argument. To change the script, edit
[config/custom.js](config/custom.js) and rebuild the compose file:
`python3 scripts/build_dashboard_compose.py services/dashboard 'window.PHC_LAT = ...; window.PHC_LON = ...; window.PHC_PLACE = "...";' > new.yml`
(it keeps the tile and widget blocks from the current compose file and refuses a `$`).

To change a tile:
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

**Login**: the public address is behind Cloudflare Access (app "Our Home dashboard", reusable
policies "Owner only" and "Family"; Family adds one family member's email, set 2026-11-12 and used
for this app only). Enter your email and type the code Cloudflare emails,
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
| Log says `exec /bin/sh: argument list too long` | The start command grew past 128 KB: rebuild with `scripts/build_dashboard_compose.py`, which compresses `custom.js` |
| No weather chip, scene stays partly cloudy | The browser could not reach `api.open-meteo.com` (blocked by an ad blocker or offline); the rest of the page still works |
| Public address still shows an old look | Hard refresh; if it persists, purge the Cloudflare cache for the dashboard hostname |
| Public address shows Cloudflare 502 | Container stopped, or the tunnel route points at the wrong port |

## Security notes
No secrets, no Docker socket, read-only links only. The only outside call is the browser's weather lookup to Open-Meteo, which sends the town's rounded coordinates and nothing about you. Public access only through Cloudflare
Access (owner's email). Do not add API keys for service widgets without moving them to `.env`.

## Verification
Last verified: 2026-11-11 (LAN page loaded with all tiles; public address showed the Cloudflare Access sign-in).
