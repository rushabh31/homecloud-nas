# Changelog

Newest first. Infrastructure changes and documentation baselines.

## 2026-11-11 (dashboard film look)
- **dashboard**: new animated valley in a warm 3D cartoon-film style with original characters (fox cub,
  bunny, ducks, owl, snowman, cottage) that react to the season, time of day and live weather. Tiles are now
  one four-column, two-row grid (Notes moved before Smart home, two columns). The script reloads its CSS and JS
  with a 5-minute time stamp so Cloudflare's 4-hour cache can't keep an old look.

## 2026-11-11 (old domain removed, NAS review)
- **domains**: all six `example.net` tunnel routes and their DNS records removed at the owner's
  request (zone and registration untouched). The tunnel now has only `example.com` routes.
- **ugos**: new route `mynas.example.com` to the UGOS web UI (port 9999).
- **cloudflare**: Access app "NAS admin (mynas + portainer)" with reusable policy "Owner only"
  now protects `mynas` and `portainer`.
- **home-assistant**: `ha.example.com` now points at the HA VM (192.168.30.99:8123) and loads.
- **npm, mattermost**: Portainer stacks changed from `restart: on-failure:5` to `unless-stopped` and redeployed;
  Mattermost site URL now `https://mattermost.example.com`. `cloudflare-tunnel` already used `unless-stopped`.
- **review**: full NAS settings review (kept in the private edition).

## 2026-11-11 (dashboard look)
- **dashboard**: replaced the plain theme with an animated cartoon landscape that follows the season, the real
  sunrise and sunset, and the live local weather (Open-Meteo, no key). Added a weather chip to the top
  bar and tidied the top bar and tiles to one set of spacing, radius and type rules. Notes now uses three columns
  like Admin. The project is now a single container: its entrypoint writes the config, then starts Homepage
  (the separate `dashboard-config` helper container is gone).

## 2026-11-11 (dashboard)
- **dashboard**: new Homepage start page "Patel Home Cloud" (UGOS project `dashboard`, port 3010) with a tile for every
  service. Published at `dashboard.example.com` through the tunnel, behind a new Cloudflare Access app using the "Owner only" policy.

## 2026-11-11 (domain move)
- **domains**: primary domain is now `example.com` (Cloudflare zone, Namecheap nameservers
  switched). Six tunnel routes added that go straight to each app's port. Old `example.net`
  routes kept until removal is approved.
- **nginx-proxy-manager**: found stopped since 2026-11-04 (auto-restart disabled); started.
- **mattermost**: both containers started; compose SiteURL changed to the new domain.
- **immich**: external domain set to `https://immich.example.com`.

## 2026-11-11
- **Baseline**: repository created from a read-only review of the NAS (UGOS UI),
  Immich API and UniFi topology page. No shell access used.
- **immich**: deployed as UGREEN Docker project `immich` (v3 images) at
  `/volume1/docker/immich`; port 2283. First deploy failed on a ghcr.io pull
  rate limit, redeploy succeeded.
- **immich**: Immich accounts created by the owner (3 users). External libraries
  added for Rushabh, user2 and user3 Photos folders; scanned (about 31,000 files).
- **immich**: photo folder mounts changed from read-only to read-write at the
  owner's request (edits/deletes in Immich change real files; 30-day trash).
- **repo**: knowledge base structure added: architecture, per-service folders,
  networking, domains, storage, backups, runbooks, templates, discovery/drift/
  validation scripts and GitHub checks. No NAS service was changed.
- **docs**: added "Access from a phone or laptop" (at home and away) to every
  service README, the service template, and a quick-access table in the README.
- **immich**: published at `immich.example.net` through Cloudflare Tunnel
  UGreenNAS (direct to 192.168.0.119:2283); Immich External domain set to it.
- **docs**: tunnel routes read from Cloudflare and recorded. The four NPM-backed
  hostnames return 502 because NPM is stopped (not changed).
