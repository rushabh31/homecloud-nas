# Deploy a new service

> Approval: required before step 5.

1. Scaffold the docs: `python3 scripts/scaffold-service.py <name>` (creates `services/<name>/` from templates).
2. Pick a free port: check [inventory/network-inventory.md](../inventory/network-inventory.md), then on the NAS `sudo ss -ltn | grep :<port>`.
3. Edit `services/<name>/docker-compose.yml`: pinned image tag, `restart: unless-stopped`, data under `/volume1/docker/<name>/`, secrets as `${VAR}` with names in `.env.example`.
4. `make check` (validates compose + docs + secret scan). Open a PR with [templates/deployment-checklist.md](../templates/deployment-checklist.md).
5. On the NAS:
   - Files: create `/volume1/docker/<name>` and data subfolders.
   - Create `.env` there from `.env.example` with real values.
   - Docker app > Project > **Create**: name `<name>`, storage path `docker/<name>`, paste the compose, **Deploy**.
   - Or over SSH: `cd /volume1/docker/<name> && sudo docker compose up -d`.
6. Verify: `docker compose ps` healthy; `curl -sI http://192.168.0.119:<port>`; logs clean.
7. Snapshot plan: add `docker` (or the folder) in the Snapshot app if not covered.
8. Public? Follow [add-new-domain.md](add-new-domain.md).
9. Fill the README, add the entry to `inventory/services.yaml`, `inventory/docker-services.md`, `inventory/dependencies.md`, `CHANGELOG.md`. Merge.

Rollback: Docker app > Project > Stop > Delete; remove the folder only after approval.
