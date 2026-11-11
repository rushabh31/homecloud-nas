# Update a service

> Approval: required.

1. Read the release notes for the target version; note breaking changes in the PR.
2. Back up first: snapshot `/volume1/docker/<name>` (Snapshot app > Take snapshot) and, for databases, a dump:
   `docker exec <db-container> pg_dump -U <user> <db> > /volume1/docker/<name>/pre-update.sql`
3. Change the image tag in `services/<name>/docker-compose.yml`; `make check`.
4. On the NAS: Docker app > Project > `<name>` > **Compose configuration** > edit the tag > **Redeploy**
   (or `docker compose pull && docker compose up -d`).
5. Verify (health, login, a real action). Watch logs for 5 minutes.
6. Update `last_verified` and image in `inventory/services.yaml`, the README, `CHANGELOG.md`.

Rollback: put the old tag back and redeploy; restore the DB dump if the migration broke it.
App Center apps (OKNote, SiYuan): App Center > Updates; no compose edit.
