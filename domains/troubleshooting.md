# Domain troubleshooting

Work from the outside in: DNS -> Cloudflare -> tunnel -> NPM -> app.

| Symptom | Likely cause | Check / fix |
| --- | --- | --- |
| Error **1033** | Tunnel not connected | `docker ps --filter name=cloudflare-tunnel`; `docker logs --tail 50 cloudflare-tunnel`; token valid? |
| Error **502 / 504** | Tunnel OK, origin unreachable | From the NAS: `curl -sI http://192.168.0.119:<port>`; app running? route port right? |
| **DNS_PROBE / NXDOMAIN** | No DNS record | Wildcards need a manual CNAME; specific hosts get one automatically |
| Works on LAN, not outside | Local DNS override or record missing | `dig +short <host>` outside vs inside |
| **Too many redirects** | App or NPM forces HTTPS behind Cloudflare | Turn off Force SSL in NPM; set the app's trusted proxy / external URL |
| **413** / big uploads fail | Cloudflare free plan 100 MB per request, or NPM limit | Upload large files on LAN; NPM Advanced `client_max_body_size 0;` |
| Websocket apps break | Websockets not enabled | NPM: tick Websockets Support |
| Access login loop for phone app | Phone apps cannot do browser Access | Remove Access for that host or use a service token |
| Everything down after reboot | a container's restart policy is `no` or `on-failure` | Set `restart: unless-stopped` in its Portainer stack |

Useful commands (NAS, read only):
```sh
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
docker logs --tail 100 cloudflare-tunnel
curl -sI http://127.0.0.1:<port> | head -1
```
More: [runbooks/troubleshoot-network.md](../runbooks/troubleshoot-network.md), [runbooks/troubleshoot-ssl.md](../runbooks/troubleshoot-ssl.md).
