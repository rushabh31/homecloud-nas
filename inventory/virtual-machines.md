# Virtual machines

`VERIFIED 2026-11-11` (UGOS Virtual Machine app).

| VM | OS | State | CPU / RAM | Disk | Network | Boot | Auto start |
| --- | --- | --- | --- | --- | --- | --- | --- |
| HAOS | Home Assistant OS (linux) | **Not running** | 2 cores / 2 GB | 128 GB virtio on Volume 1 | virtio on `bridge0` (LAN) | UEFI | Not enabled |

Notes:
- UniFi also shows a separate LAN client named `homeassistant`, so Home Assistant
  currently appears to run on another device. Moving it into this VM is in progress
  (owner request, 2026-11-11). Update this file when done.
- HAOS needs `bridge0` (not NAT) so it can discover devices on the LAN.
- Back up HA from inside HA (Settings > System > Backups) and keep copies off the VM.

Refresh: Virtual Machine app > select VM > Config info.
