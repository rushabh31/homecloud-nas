# Domain inventory

Update this table in the same commit as any Cloudflare or NPM change.

Read from the Cloudflare dashboard (tunnel **UGreenNAS**, Routes tab) on 2026-11-11: VERIFIED.

| Hostname | Service | Tunnel target | Pattern | Works today? |
| --- | --- | --- | --- | --- |
| `oknote.example.com` | OKNote | `http://192.168.0.119` (port 80 = NPM) | B | **No, 502**: NPM is stopped |
| `portainer.example.com` | Portainer | `http://192.168.0.119` (NPM) | B | No (NPM stopped). Publishing Portainer is risky, see note |
| `mattermost.example.com` | Mattermost | `http://192.168.0.119` (NPM) | B | No (NPM and Mattermost stopped) |
| `siyuan.example.com` | SiYuan | `http://192.168.0.119` (NPM) | B | No (NPM stopped) |
| `ha.example.com` | Home Assistant (separate device) | `http://192.168.0.75:8123` | A | Not checked |
| `immich.example.com` | Immich | `http://192.168.0.119:2283` | A | **Yes** (added 2026-11-11, login page loads through Cloudflare) |

Notes:
- The four NPM-backed hosts depend on Nginx Proxy Manager listening on port 80.
  NPM was stopped on 2026-11-11, so they return Cloudflare 502. Starting NPM
  (owner approval) brings them back, provided its proxy hosts are still configured.
- Immich uses a direct route (Pattern A) so it works without NPM. It can move to
  NPM later; if so, enable Websockets and set `client_max_body_size 0;`.
- Portainer controls every container. If it stays published, put Cloudflare
  Access in front of `portainer.example.com` or remove the route.
- Cloudflare Access applications: TO_BE_VERIFIED.
- Wildcard `*` route: none (VERIFIED, not in the route list).

## How to verify
1. Zero Trust > Networks > Tunnels > (tunnel) > Configure > Public Hostname: copy every row here.
2. DNS > Records: confirm each hostname has a proxied CNAME to `<tunnel-id>.cfargotunnel.com`.
3. Zero Trust > Access > Applications: note which hostnames are protected.
4. `curl -sI https://<host> | head -1` from outside the LAN.
Or use the read-only API calls in [networking/cloudflare](../networking/cloudflare/README.md).
