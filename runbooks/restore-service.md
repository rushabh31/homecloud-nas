# Restore a service

> Approval: required.

1. Stop the project (Docker app > Project > Stop).
2. Move the broken data aside: `sudo mv /volume1/docker/<name> /volume1/docker/<name>.broken-$(date +%F)`.
3. Restore the folder from snapshot (Snapshot app > docker > snapshot > Restore) or from backup.
4. Get `.env` values from the password manager; check `services/<name>/.env.example` for names.
5. Redeploy with `services/<name>/docker-compose.yml`.
6. Databases: if restoring from a dump instead of a folder snapshot, start only the DB, load the dump, then start the app.
   Immich: https://docs.immich.app/administration/backup-and-restore
7. Verify, then delete the `.broken-*` folder after approval.
8. `CHANGELOG.md` entry with what was restored and from when.
