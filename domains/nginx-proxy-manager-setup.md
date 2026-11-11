# Nginx Proxy Manager setup (Pattern B, one time)

> Production-impacting: starting NPM binds ports 80/443/81 on the NAS. Get owner approval first.

1. Check the ports are free on the NAS: `sudo ss -ltnp | grep -E ':(80|81|443) '`.
   If UGOS uses 80/443, change the mapping to e.g. `8080:80` and use that port below.
2. Deploy [services/nginx-proxy-manager](../services/nginx-proxy-manager/README.md)
   (`.env` from `.env.example` on the NAS).
3. Open `http://192.168.0.119:81`, sign in, change the admin email and password.
4. Cloudflare tunnel > Configure > Public Hostname > Add:
   Subdomain `*`, Domain `example.com`, Service `HTTP`, URL `192.168.0.119:80`.
5. Cloudflare does **not** create DNS for wildcards. DNS > Records > Add:
   `CNAME`, Name `*`, Target `<tunnel-id>.cfargotunnel.com`, **Proxied**.
   (Tunnel ID is on the tunnel overview page.)
6. Optional default site in NPM (Settings > Default Site > 404) so unknown names don't reach anything.
7. Record the wildcard in [domain-inventory.md](domain-inventory.md).

Specific tunnel hostnames keep working and take priority over `*`.
