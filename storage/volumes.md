# Volumes and shared folders

VERIFIED 2026-11-11 unless marked.

| Item | Value |
| --- | --- |
| Storage Pool 1 | 1 x 12.7 TB HDD, **Basic (no RAID)** |
| SSD cache | 2 NVMe (1.8 TB + 931 GB) |
| Volume 1 | Btrfs, mounted at `/volume1` |

| Shared folder / path | Used for | Snapshot plan |
| --- | --- | --- |
| `/volume1/docker` | Compose projects and app data | **None** (recommend daily) |
| `/volume1/Documents` | Shared docs, OKNote data | Daily, 30 kept |
| `/volume1/@home/Rushabh` | Home + Photos | Gap: last snapshot about 2026-11-01 |
| `/volume1/@home/user2` | Home + Photos | Daily, 30 kept |
| `/volume1/@home/user3` | Home + Photos | Daily, 31 kept |
| `/volume1/@appstore/*` | App Center app data | None |
| VM disk (HAOS) | Home Assistant VM | None |

Other shared folders: TO_BE_VERIFIED. List them on the NAS:
```sh
ls -1 /volume1 ; df -h /volume1 ; sudo btrfs subvolume list /volume1 | head -50
```

## Rules for new services
- App data goes under `/volume1/docker/<service>/`.
- Never put data in an anonymous Docker volume unless it can be re-downloaded (e.g. ML model cache).
- Add the folder to a snapshot plan when the service is deployed.
