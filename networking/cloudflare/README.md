# Cloudflare

## Account and zone
| Item | Value | Label |
| --- | --- | --- |
| Zone | `example.com` | USER-PROVIDED |
| Nameservers | Cloudflare | TO_BE_VERIFIED (registrar) |
| Registrar | TO_BE_VERIFIED | |
| SSL/TLS mode | TO_BE_VERIFIED (recommend Full) | |
| Always Use HTTPS | TO_BE_VERIFIED (recommend on) | |

## Tunnel
| Item | Value | Label |
| --- | --- | --- |
| Connector | `cloudflare-tunnel` container on the NAS | VERIFIED 2026-11-11 |
| Type | Remotely managed (token) | VERIFIED 2026-11-11 (`TUNNEL_TOKEN` env present) |
| Tunnel name / ID | TO_BE_VERIFIED | |
| Routes (public hostnames) | see [domains/domain-inventory.md](../../domains/domain-inventory.md) | TO_BE_VERIFIED |
| Access applications | TO_BE_VERIFIED | |

Routes live in the Cloudflare dashboard, not on the NAS. Collect them from
Zero Trust > Networks > Tunnels > (tunnel) > Configure > Public Hostname, or
with the API (read only; token needs *Cloudflare Tunnel: Read*):

```sh
# CF_API_TOKEN and ACCOUNT_ID in your shell only, never in git
curl -s -H "Authorization: Bearer $CF_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/cfd_tunnel?is_deleted=false" | jq '.result[] | {id,name,status}'
curl -s -H "Authorization: Bearer $CF_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/cfd_tunnel/<tunnel-id>/configurations" | jq '.result.config.ingress'
```

Setup guide: [domains/cloudflare-tunnel-setup.md](../../domains/cloudflare-tunnel-setup.md).

## Secrets
Tunnel token and API tokens go in a password manager and `.env` on the NAS. Never in this repo.
