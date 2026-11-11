# Deployment checklist

Copy into the PR description or the service README while deploying.

## Before
- [ ] Owner approved the change (anything that touches a running service)
- [ ] Port is free (`ss -ltn | grep :<port>`) and not in [inventory/network-inventory.md](../inventory/network-inventory.md)
- [ ] Image tag pinned; release notes read
- [ ] Data paths under `/volume1/docker/<name>/`
- [ ] `.env` created on the NAS from `.env.example`; nothing secret in git
- [ ] `docker compose config -q` passes; `make check` passes

## Deploy
- [ ] Deployed (Docker app > Project, or `docker compose up -d`)
- [ ] Containers healthy (`docker compose ps`), logs clean
- [ ] Reachable on LAN at `http://192.168.0.119:<port>`

## If public
- [ ] Cloudflare route added (Pattern A or B) and Access policy set if needed
- [ ] Row added to [domains/domain-inventory.md](../domains/domain-inventory.md)
- [ ] HTTPS works from mobile data, not only Wi-Fi

## After
- [ ] `services/<name>/` README filled from [templates/service-readme.md](service-readme.md)
- [ ] `inventory/services.yaml`, `inventory/docker-services.md`, `inventory/dependencies.md` updated
- [ ] Data folder covered by snapshot plan / backup ([backups/backup-strategy.md](../backups/backup-strategy.md))
- [ ] `CHANGELOG.md` entry
