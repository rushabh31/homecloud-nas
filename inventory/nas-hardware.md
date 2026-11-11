# NAS hardware and OS

`VERIFIED 2026-11-11` from UGOS Pro > Control Panel / Storage, unless marked.

| Item | Value |
| --- | --- |
| Model | UGREEN NASync DXP6800 Pro (6 x 3.5" bays, 2 x M.2 NVMe) |
| Device name | HomeCloud |
| CPU | Intel Core i5-1235U (10 cores / 12 threads, Intel Quick Sync / iGPU) |
| RAM | 64 GB (2 x 32 GB) |
| OS | UGOS Pro 1.21.0.0190; update 1.21.1.0016 downloaded, not installed |
| Network | 2 x 1 GbE in use (two LAN addresses; main 192.168.0.119); 10 GbE ports `TO_BE_VERIFIED` |
| Admin UI | http://dxp6800pro-a416.local:9999, https on 9443 |
| Warranty | Until 2029-10-01 |
| UPS | None detected; auto power-on after outage: off |
| Remote access | Documented privately |

## Hardware-specific assumptions (for migration)
- `/volume1` paths and `@home`, `@appstore` layout are UGOS-specific.
- Intel iGPU (`/dev/dri`) is available for Immich/Jellyfin transcoding; another
  host may not have it.
- The VM uses KVM via the UGOS Virtual Machine app (UEFI, virtio disk/NIC).

## Collect / refresh
```bash
ssh <admin>@192.168.0.119   # enable SSH temporarily in Control Panel > Terminal
cat /etc/os-release; lscpu | head -20; free -h; lsblk -o NAME,SIZE,MODEL,ROTA; ip -br a
```
