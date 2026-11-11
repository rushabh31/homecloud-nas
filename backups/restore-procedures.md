# Restore procedures

## A file or folder (snapshot)
Snapshot app > choose the shared folder or home folder > pick a snapshot >
Browse > select files > **Restore** (or copy out). Works for photos deleted via Immich after the 30-day trash.

## A photo deleted in Immich (within 30 days)
Immich > Trash > select > Restore.

## A Docker service
1. Stop the project.
2. Restore `/volume1/docker/<service>` from snapshot or backup.
3. Redeploy from `services/<service>/docker-compose.yml` with the `.env` from your password manager.
4. Verify with the service README's checks.

## Immich database
Use the newest dump in `/volume1/docker/immich/library/backups` and follow
https://docs.immich.app/administration/backup-and-restore (stop server, restore dump into a fresh postgres, start).

## Mattermost database
`docker exec -i Mattermost-DB psql -U <user> <db> < dump.sql` into a fresh DB, then start Mattermost.

## Home Assistant
New HAOS VM > onboarding > Restore from backup.

Detailed runbook: [runbooks/restore-service.md](../runbooks/restore-service.md).
