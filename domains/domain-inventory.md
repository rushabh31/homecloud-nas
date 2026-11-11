# Domain inventory

Update this table in the same commit as any Cloudflare or NPM change.

Primary domain: **example.com** (registered at Namecheap 2026-11-11, nameservers
the two Cloudflare nameservers). Old domain **example.net**:
all six tunnel routes and their DNS records were removed on 2026-11-11 at the owner's request.
The zone and its registration were left alone.

Read from the Cloudflare dashboard (tunnel **UGreenNAS**, Routes tab) and opened in a browser on 2026-11-11: VERIFIED.

### example.com (primary, all Pattern A: tunnel straight to the app port)

| Hostname | Service | Tunnel target | Works today? |
| --- | --- | --- | --- |
| `immich.example.com` | Immich | `http://192.168.0.119:2283` | Yes, login page loads |
| `mattermost.example.com` | Mattermost | `http://192.168.0.119:8401` | Yes, Mattermost loads |
| `oknote.example.com` | OKNote | `http://192.168.0.119:38080` | Yes, sign-in page loads |
| `siyuan.example.com` | SiYuan | `http://192.168.0.119:6806` | Yes, unlock page loads |
| `portainer.example.com` | Portainer | `http://192.168.0.119:9000` | Yes, Cloudflare Access (owner only), then Portainer login |
| `ha.example.com` | Home Assistant | `http://192.168.30.99:8123` | Yes, HA login page loads (HA VM on the NAS) |
| `mynas.example.com` | UGOS web admin (the NAS itself) | `http://192.168.0.119:9999` | Yes, Cloudflare Access (owner only), then UGOS login |
| `dashboard.example.com` | Dashboard (Homepage) | `http://192.168.0.119:3010` | Yes, Cloudflare Access sign-in, then the dashboard |

### example.net (routes removed 2026-11-11)

Removed: `oknote`, `portainer`, `mattermost`, `siyuan` (were Pattern B through NPM), `ha` and `immich`
(were Pattern A). Each route's CNAME was deleted with it. These addresses no longer resolve.

Notes:
- The new domain does not use Nginx Proxy Manager, so an NPM outage no longer takes apps offline.
  NPM no longer serves any public hostname.
- NPM stopped on 2026-11-04 at 22:15 (stop signal, exit code 0) and did not come back because its
  restart policy was `on-failure:5`, which ignores a clean stop. Mattermost and Mattermost-DB had the same.
  Fixed 2026-11-11: their Portainer stacks (`npm`, `mattermost`) now use `restart: unless-stopped` and were
  redeployed. `cloudflare-tunnel` already had `unless-stopped` (it came back by itself on 2026-11-05).
  UGOS shows "Disabled" for every policy except `always`, so its Auto-restart field is misleading.
- Immich external domain set to `https://immich.example.com` (2026-11-11).
- Mattermost's site URL is `https://mattermost.example.com` (Portainer stack `mattermost`, redeployed 2026-11-11).
- Cloudflare Access app "NAS admin (mynas + portainer)" protects `mynas.example.com` and
  `portainer.example.com` with the reusable policy "Owner only" (email one-time code, the owner's
  address only). Both apps still ask for their own login after that.
- Records Cloudflare imported from Namecheap on zone setup (apex A, `www` CNAME, MX, TXT) were left as they are.
- Cloudflare Access application "Patel Home Cloud dashboard" protects `dashboard.example.com` (reusable policy "Owner only", session 7 days).
- Wildcard `*` route: none.

## How to verify
1. Zero Trust > Networks > Tunnels > (tunnel) > Configure > Public Hostname: copy every row here.
2. DNS > Records: confirm each hostname has a proxied CNAME to `<tunnel-id>.cfargotunnel.com`.
3. Zero Trust > Access > Applications: note which hostnames are protected.
4. `curl -sI https://<host> | head -1` from outside the LAN.
Or use the read-only API calls in [networking/cloudflare](../networking/cloudflare/README.md).
