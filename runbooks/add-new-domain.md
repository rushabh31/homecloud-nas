# Add a new domain or subdomain

> Approval: required (makes something reachable from the internet).

- New **subdomain** of `example.com`: follow [domains/add-new-subdomain.md](../domains/add-new-subdomain.md).
- New **root domain** (e.g. `example.org`):
  1. Add it to Cloudflare (Add a domain > Free), switch nameservers at the registrar, wait for Active.
  2. SSL/TLS Full, Always Use HTTPS.
  3. In the existing tunnel, add public hostnames for the new domain (one tunnel can serve many zones).
  4. For Pattern B, add another wildcard route `*.example.org -> http://192.168.0.119:80` and a manual `CNAME *` record.
  5. Add Cloudflare Access policies.
  6. Document in [domains/domain-inventory.md](../domains/domain-inventory.md), `inventory/domains.md`, `CHANGELOG.md`.

Security checklist before going live: app has its own login + 2FA, admin tools stay private, Access on everything a browser uses.
