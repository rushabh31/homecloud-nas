# Nginx (Nginx Proxy Manager)

The only nginx on the network that this repo manages is **Nginx Proxy Manager**
(service docs: [services/nginx-proxy-manager](../../services/nginx-proxy-manager/README.md)).

| Item | Value | Label |
| --- | --- | --- |
| State | Stopped | VERIFIED 2026-11-11 |
| Admin UI | `http://192.168.0.119:81` | VERIFIED (port mapping) |
| Proxy hosts configured | TO_BE_VERIFIED (start NPM or read `data/database.sqlite`/DB) | |
| Role | Pattern B hop: tunnel wildcard -> NPM :80 -> app | Design; live use TO_BE_VERIFIED |

UGOS has its own nginx for the admin UI on 9999/9443; do not edit it, and check
that NPM's 80/443 do not collide with it.

List proxy hosts without starting the UI (read only, SQLite case):
```sh
sudo sqlite3 /volume1/docker/npm/data/database.sqlite \
  "select id, domain_names, forward_host, forward_port, enabled from proxy_host where is_deleted=0;"
```

How to add a host: [domains/nginx-proxy-manager-setup.md](../../domains/nginx-proxy-manager-setup.md).
