# meals: Our Kitchen (family meal planner)

`VERIFIED 2026-11-27` (deployed and checked from the LAN and the public address that day).

## What it is and who uses it
Our Kitchen is the family meal planner: a 3-week menu, today's meals with estimated protein, carbs and fat,
the shopping list, and a pantry that tracks what's at home, prices and barcodes. The family uses it
from their phones (Add to Home Screen). Both phones share one copy of the data on the NAS.

## Deployment
- Type: UGREEN Docker Project `meals` (not Portainer), folder `/volume1/docker/meals`.
- Image: `node:22-alpine` (pinned to the Node 22 line). No npm packages: `app/server.mjs` uses Node's built-in
  `http` and `node:sqlite`.
- Runs as `user: "1000:10"` (the NAS user that owns `./data`), `read_only: true`, `cap_drop: ALL`,
  `no-new-privileges`, tmpfs `/tmp`, `restart: unless-stopped`, healthcheck `GET /healthz`.
- Network: `meals_default`.

## Ports
| Host | Container | Use |
| --- | --- | --- |
| 3040 | 8080 | the app and its API; tunnel target |

## Volumes
| Host | Container | Holds | Back up? |
| --- | --- | --- | --- |
| `/volume1/docker/meals/app` | `/app` (ro) | server, built site, seed menu | Covered anyway (rebuildable from the meal-app source) |
| `/volume1/docker/meals/data` | `/data` | `kitchen.db` (SQLite: ticks, pantry, settings) | **Yes** |

## Environment variable names
`PORT`, `DB_PATH`. No secrets.

## Users and who sees what
No accounts in the app. Who can open it is decided by Cloudflare Access (policy **Family**). Every change is
stamped with the signer-in's Access email (`lan` when opened on the home Wi-Fi). Everyone sees the same data.

## Reaching it
- Phone or laptop, anywhere: `https://kitchen.example.com`, sign in through Cloudflare Access (Google,
  GitHub or an emailed code), then on a phone Share > Add to Home Screen.
- At home: `http://192.168.0.119:3040` (the barcode camera needs HTTPS, so use the public address for scanning).

## Dependencies
- `cloudflare-tunnel` (public route). Outbound internet for barcode lookups (Open Food Facts); without it you
  pick items by hand. Nothing else.

## Domain and routing
- `kitchen.example.com` -> tunnel UGreenNAS -> `http://192.168.0.119:3040` (Pattern A).
- Cloudflare Access app "Our Kitchen", self-hosted, policies **Family** and **Owner only**, 7-day session, like the dashboard. Family alone does not include the owner.
- Sign-in happens on the Cloudflare Access team domain (`<team>.cloudflareaccess.com`), then returns to the app.

## Deploy or replicate
1. Copy this folder to `/volume1/docker/meals` with the built `app/` (not in git; built from the meal-app source)
   and an empty `data/`, owned by the NAS user (uid 1000).
2. UGOS Docker > Project > Create, name `meals`, import `docker-compose.yml`.
3. Check `http://192.168.0.119:3040/healthz` says `ok`. First start logs `seeded plan from /app/seed/plan.json`.
4. Add the Access app first, then the tunnel route, then the dashboard tile.
`app/` is built from the meal-app source with `python3 -I tools/build_site.py`.

## Update
Replace `app/` with the new build and restart the `meals` project. The database keeps its own copy of the plan,
so a new seed only matters for a fresh database.

## Backup
- Already covered: `/volume1/docker` gets the daily 00:00 snapshot (30 kept) and the nightly backup to the 8 TB
  mirror (see backups/backup-strategy.md), so `data/` is included with no change.
- A copy of `kitchen.db` is safe with the container stopped; while it runs, also copy `kitchen.db-wal` and
  `kitchen.db-shm`, or use a snapshot.
- Anytime: `https://kitchen.example.com/api/export` downloads everything as one JSON file.

## Restore
Stop the project, put `kitchen.db` (plus `-wal`/`-shm` if present) back into `data/`, owner uid 1000, start it.

## Troubleshooting
- Container restarts with a write error: `data/` isn't owned by uid 1000 (`cap_drop: ALL` stops root writing it).
- App says it's offline: check `/healthz` on the LAN, then the tunnel route, then the Access app.
- Barcode lookups fail: the container has no outbound internet.

## Security notes
- Behind Cloudflare Access (Family). Same-origin check refuses writes from other sites.
- Read-only root filesystem, no capabilities, non-root user. No secrets anywhere.
- Fonts load from Google Fonts; everything else is served from the NAS. Only barcode numbers leave the house.

Last verified: 2026-11-27 (LAN health check ok, tile green on the dashboard; public address showed the Cloudflare Access sign-in).
