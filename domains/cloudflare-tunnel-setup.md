# Cloudflare Tunnel setup (one time, or rebuild)

## 1. Zone
1. Cloudflare > Add a domain > `example.com` > Free.
2. At the registrar (TO_BE_VERIFIED which one), set the two Cloudflare nameservers.
3. Wait for **Active**.
4. SSL/TLS > Overview: **Full**. Edge Certificates: **Always Use HTTPS** on.

## 2. Tunnel
1. Zero Trust > Networks > Tunnels > **Create a tunnel** > *Cloudflared* > name it (e.g. `homecloud`).
2. Pick **Docker**. Copy only the value after `--token`.
3. On the NAS: put it in `/volume1/docker/cloudflared/.env` as `TUNNEL_TOKEN=...`
   (or in the UGOS project's environment). Never in git.
4. Deploy [services/cloudflare-tunnel](../services/cloudflare-tunnel/README.md):
   Docker app > Project > Create, paste the compose, Deploy.
5. Dashboard shows the connector **Healthy** within a minute.
6. Make sure the container's restart policy is `unless-stopped` (it is Disabled today).

## 3. Routes
Add one public hostname per app ([add-new-subdomain.md](add-new-subdomain.md)), or
a wildcard to NPM ([nginx-proxy-manager-setup.md](nginx-proxy-manager-setup.md)).

## Rebuild on a new NAS
Same token works on new hardware: redeploy the container with the old token, then
fix route targets if the NAS IP changed. If the token is lost, Configure >
Refresh token, update `.env`, redeploy.
