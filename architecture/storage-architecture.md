# Storage architecture

```mermaid
flowchart TB
  HDD[HDD 1 12.7 TB] --> P1[Storage Pool 1 - Basic, no RAID]
  SSD1[NVMe 1.8 TB] & SSD2[NVMe 931 GB] --> C[SSD cache]
  C --> V1
  P1 --> V1[Volume 1 Btrfs]
  V1 --> D[/volume1/docker/]
  V1 --> H[/volume1/@home/user/]
  V1 --> DOC[/volume1/Documents/]
  V1 --> AS[/volume1/@appstore/]
  V1 --> VMD[VM disks]
  V1 --> SNAP[Btrfs snapshots<br/>Documents, user2, user3 daily]
```

- Snapshots are on the same disk: they protect against deletion, not disk failure.
- No backup task exists (VERIFIED 2026-11-11). See [backups/backup-strategy.md](../backups/backup-strategy.md).
- Persistent data rules: [storage/](../storage/volumes.md).
