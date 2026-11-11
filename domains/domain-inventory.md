# Domain inventory

Update this table in the same commit as any Cloudflare or NPM change.

| Hostname | Service | Target | Pattern | Cloudflare Access | Status | Label |
| --- | --- | --- | --- | --- | --- | --- |
| `example.com` (apex) | none known | TO_BE_VERIFIED | | | | USER-PROVIDED zone |
| `oknote.example.com` | OKNote | `http://192.168.0.119:38080` (TO_BE_VERIFIED) | A (TO_BE_VERIFIED) | TO_BE_VERIFIED | App running | USER-PROVIDED hostname |
| `mattermost.example.com` | Mattermost | `http://192.168.0.119:8401` (TO_BE_VERIFIED) | A (TO_BE_VERIFIED) | TO_BE_VERIFIED | App **stopped** | VERIFIED 2026-11-11 (Mattermost site URL) |
| `*.example.com` | NPM | `http://192.168.0.119:80` | B | | NPM stopped | TO_BE_VERIFIED (does it exist?) |

## How to verify
1. Zero Trust > Networks > Tunnels > (tunnel) > Configure > Public Hostname: copy every row here.
2. DNS > Records: confirm each hostname has a proxied CNAME to `<tunnel-id>.cfargotunnel.com`.
3. Zero Trust > Access > Applications: note which hostnames are protected.
4. `curl -sI https://<host> | head -1` from outside the LAN.
Or use the read-only API calls in [networking/cloudflare](../networking/cloudflare/README.md).
