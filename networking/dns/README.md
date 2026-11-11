# DNS

## Public (Cloudflare)
- `example.com` zone hosted at Cloudflare (USER-PROVIDED).
- Tunnel routes create proxied CNAMEs `<sub> -> <tunnel-id>.cfargotunnel.com` automatically.
- A wildcard route (Pattern B) needs a manual proxied `CNAME * <tunnel-id>.cfargotunnel.com`.
- Full record list: TO_BE_VERIFIED. Export: DNS > Records > Import and Export > Export (BIND file; no secrets, may be committed under `networking/dns/` after review).

## Local (home network)
| Item | Value | Label |
| --- | --- | --- |
| DHCP DNS server | TO_BE_VERIFIED (UDM default is the gateway) | |
| Local records for `*.example.com` | TO_BE_VERIFIED (none expected) | |
| NAS mDNS name | `dxp6800pro-a416.local` | VERIFIED 2026-11-11 |

Optional split DNS (Pattern B on LAN): UniFi Network > Settings > Policy Engine /
DNS records: `*.example.com A 192.168.0.119`, then NPM needs its own
certificates (DNS challenge), see [ssl/](../ssl/README.md).

Check from any machine:
```sh
dig +short oknote.example.com        # should return Cloudflare IPs
dig +short oknote.example.com @192.168.0.1   # local answer, TO_BE_VERIFIED gateway IP
```
