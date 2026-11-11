# Data migration

## Add a second disk and mirror (recommended next step)
1. Insert a drive at least 12.7 TB.
2. Storage Manager > Storage Pool 1 > Change RAID type > **RAID 1** (Basic -> RAID 1 is supported online on UGOS; TO_BE_VERIFIED on this model/firmware).
3. Let the rebuild finish before other changes.

## Move a service's data to a new path
1. Stop the project.
2. `sudo rsync -aHAX --info=progress2 /old/path/ /new/path/`
3. Update the bind mount in `services/<name>/docker-compose.yml` and on the NAS.
4. Start, verify, then remove the old copy after a few days.
5. Update `storage/bind-mounts.md` and the service README.

## Move everything to a new NAS
See [runbooks/rebuild-entire-nas.md](../runbooks/rebuild-entire-nas.md).
