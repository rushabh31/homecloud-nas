# Storage inventory

`VERIFIED 2026-11-11` (UGOS Storage, Files, Snapshot apps).

| Item | Value |
| --- | --- |
| Storage Pool 1 | **Basic (no redundancy)**, Hard Drive 1 only, 12.7 TB |
| Volume 1 | Btrfs, 12.7 TB, about 210 GB used before Immich |
| SSD cache | M.2 SSD 1 (1.8 TB) + M.2 SSD 2 (931.5 GB), cache for Volume 1 |
| Drive health | All Normal, 39-44 C; SMART quick weekly, full monthly |
| Empty bays | 5 of 6 |

## Key folders

| UI name | Host path | Contents |
| --- | --- | --- |
| Shared folder/docker | /volume1/docker | Docker project folders (compose + data) |
| Shared folder/Documents | /volume1/Documents | Shared documents; OKNote data |
| User folder/Rushabh, user2, user3 | /volume1/@home/<user> | Home folders incl. `Photos` |
| (system) | /volume1/@appstore/<app-id> | App Center app data (OKNote, SiYuan) |
| VM disk | Volume 1 (Virtual Machine app) | HAOS 128 GB virtio disk |

## Family photos (indexed by Immich, read-write)

| Owner | Path | Size |
| --- | --- | --- |
| Rushabh | /volume1/@home/Rushabh/Photos | 75 GB, 13,902 files |
| user2 | /volume1/@home/user2/Photos | 23.5 GB, 7,666 files |
| user3 | /volume1/@home/user3/Photos | 68 GB, about 9,300 files |

See [storage/](../storage/) for mounts, permissions and migration.
