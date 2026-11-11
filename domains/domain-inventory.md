# Domain inventory

Update this table in the same commit as any Cloudflare or NPM change.

Primary domain: **example.com** (registered at Namecheap 2026-11-11, nameservers
the two Cloudflare nameservers). Old domain **example.net**
still routes in parallel until the owner approves removing it.

Read from the Cloudflare dashboard (tunnel **UGreenNAS**, Routes tab) and opened in a browser on 2026-11-11: VERIFIED.

### example.com (primary, all Pattern A: tunnel straight to the app port)

| Hostname | Service | Tunnel target | Works today? |
| --- | --- | --- | --- |
| `immich.example.com` | Immich | `http://192.168.0.119:2283` | Yes, login page loads |
| `mattermost.example.com` | Mattermost | `http://192.168.0.119:8401` | Yes, Mattermost loads |
| `oknote.example.com` | OKNote | `http://192.168.0.119:38080` | Yes, sign-in page loads |
| `siyuan.example.com` | SiYuan | `http://192.168.0.119:6806` | Yes, unlock page loads |
| `portainer.example.com` | Portainer | `http://192.168.0.119:9000` | Yes, login page loads (public, see note) |
| `ha.example.com` | Home Assistant | `http://192.168.0.75:8123` | No, 502: HA itself is down (being moved to VM "HAOS-2026") |
| `dashboard.example.com` | Dashboard (Homepage) | `http://192.168.0.119:3010` | Yes, Cloudflare Access sign-in, then the dashboard |

### example.net (old, kept until removal is approved)

| Hostname | Tunnel target | Pattern |
| --- | --- | --- |
| `oknote.example.net` | `http://192.168.0.119` (port 80 = NPM) | B |
| `portainer.example.net` | `http://192.168.0.119` (NPM) | B |
| `mattermost.example.net` | `http://192.168.0.119` (NPM) | B |
| `siyuan.example.net` | `http://192.168.0.119` (NPM) | B |
| `ha.example.net` | `http://192.168.0.75:8123` | A |
| `immich.example.net` | `http://192.168.0.119:2283` | A |

Notes:
- The new domain does not use Nginx Proxy Manager, so an NPM outage no longer takes apps offline.
  NPM still serves the four old Pattern B hostnames.
- NPM stopped on 2026-11-04 at 22:15 (it received a stop signal, exit code 0) and did not come
  back because its auto-restart is disabled. Started again 2026-11-11. Same for Mattermost and
  Mattermost-DB. Fix for good: `docker update --restart unless-stopped Nginx-Proxy-Manager Mattermost Mattermost-DB`
  over SSH (these projects were created outside the UGOS Docker app, which cannot edit them).
- Immich external domain set to `https://immich.example.com` (2026-11-11).
- Mattermost's running container still has `MM_SERVICESETTINGS_SITEURL=https://mattermost.example.net`;
  the compose file in this repo has the new value. Recreate the container to apply it.
- Portainer controls every container. Put Cloudflare Access in front of
  `portainer.example.com` or remove the route.
- Records Cloudflare imported from Namecheap on zone setup (apex A, `www` CNAME, MX, TXT) were left as they are.
- Cloudflare Access application "Patel Home Cloud dashboard" protects `dashboard.example.com` (reusable policy "Owner only", session 7 days).
- Wildcard `*` route: none.

## How to verify
1. Zero Trust > Networks > Tunnels > (tunnel) > Configure > Public Hostname: copy every row here.
2. DNS > Records: confirm each hostname has a proxied CNAME to `<tunnel-id>.cfargotunnel.com`.
3. Zero Trust > Access > Applications: note which hostnames are protected.
4. `curl -sI https://<host> | head -1` from outside the LAN.
Or use the read-only API calls in [networking/cloudflare](../networking/cloudflare/README.md).
