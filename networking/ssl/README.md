# TLS / SSL

| Hop | Certificate | Label |
| --- | --- | --- |
| Browser -> Cloudflare | Cloudflare Universal SSL (edge) | Design; TO_BE_VERIFIED in dashboard |
| Cloudflare -> NAS | Tunnel encryption, no cert to manage | VERIFIED (tunnel in use) |
| LAN -> NPM :443 | None today | TO_BE_VERIFIED |
| UGOS admin :9443 | UGOS self-signed | VERIFIED 2026-11-11 |

Rules:
- Public HTTPS is Cloudflare's job. Do not open port 80/443 on the router for Let's Encrypt.
- If LAN HTTPS with real names is wanted, issue certs in NPM with the **DNS
  challenge** (Cloudflare API token scoped to Zone:DNS:Edit for this zone only;
  token stays in NPM, not git).
- Turn off "Force SSL" in NPM for tunnel-only hosts to avoid redirect loops.
