# Add a new subdomain

Worked example (EXAMPLE values from the real setup): **`oknote.example.com`
-> OKNote on port 38080**. Replace host and port for your app.

## 0. Before you start
- [ ] The app works on the LAN: `curl -sI http://192.168.0.119:38080 | head -1` returns `HTTP/1.1 200` or a redirect.
- [ ] The hostname is not already in [domain-inventory.md](domain-inventory.md).
- [ ] Decide Pattern A (direct) or B (through NPM). If NPM is not running, use A.

## Pattern A: tunnel straight to the app
1. Cloudflare dashboard > **Zero Trust** > **Networks** > **Tunnels** (newer UI: Networks > Connectors > Cloudflare Tunnels).
2. Click the tunnel > **Configure** > **Public Hostname** (newer UI: *Published application routes*) > **Add a public hostname**.
3. Fill in:
   - Subdomain: `oknote`
   - Domain: `example.com`
   - Path: empty
   - Service type: `HTTP`
   - URL: `192.168.0.119:38080`
4. Save. Cloudflare creates the DNS CNAME automatically.
5. Test from mobile data: `https://oknote.example.com`.
6. Protect it: Zero Trust > Access > Applications > Add > Self-hosted >
   hostname `oknote.example.com` > policy Allow > Emails = family addresses.
   (Skip Access only for hosts a phone app must reach directly, e.g. Immich.)
7. Set the app's own public URL if it has one (Immich External domain, Mattermost SiteURL).
8. Add the row to [domain-inventory.md](domain-inventory.md), the service README, and `CHANGELOG.md`.

## Pattern B: through Nginx Proxy Manager
Prerequisite: [nginx-proxy-manager-setup.md](nginx-proxy-manager-setup.md) done once
(NPM running, tunnel wildcard `*` -> `http://192.168.0.119:80`, wildcard CNAME).

1. Open NPM `http://192.168.0.119:81` > **Hosts** > **Proxy Hosts** > **Add Proxy Host**.
2. Details tab:
   - Domain Names: `oknote.example.com`
   - Scheme: `http`; Forward Hostname/IP: `192.168.0.119`; Forward Port: `38080`
   - Tick **Block Common Exploits** and **Websockets Support**
3. SSL tab: none for tunnel-only use. (For LAN HTTPS, see [networking/ssl](../networking/ssl/README.md).)
4. Save. Nothing to change in Cloudflare; the wildcard already routes the name to NPM.
5. Test, protect with Access, document (steps 5 to 8 above).

## Rollback
- Pattern A: delete the public hostname in the tunnel, then delete the leftover CNAME in DNS.
- Pattern B: disable or delete the proxy host in NPM.
- Revert the doc commit.
