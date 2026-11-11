# Home Assistant

> Fact labels: see the [README](../../README.md#how-facts-are-labelled).

## Purpose
Home automation. USER-PROVIDED: Home Assistant runs in a VM.

## Deployment
| Item | Value |
| --- | --- |
| Type | KVM virtual machine `HAOS` in the UGOS **Virtual Machine** app (VERIFIED 2026-11-11) |
| State | VM **stopped** on 2026-11-11 (VERIFIED) |
| Disk | 128 GB on Volume 1 (VERIFIED) |
| vCPU / RAM | See [inventory/virtual-machines.md](../../inventory/virtual-machines.md) |
| Web UI | `http://<vm-ip>:8123` (VM IP TO_BE_VERIFIED) |
| Inventory entry | `inventory/services.yaml` key `home-assistant` |

There is no `docker-compose.yml` here on purpose: HAOS is a full OS image, not a
container. A move or rebuild of Home Assistant is being handled separately; that
work will add its own notes to this folder.

## Access from a phone or laptop
| Device | At home | Away from home |
| --- | --- | --- |
| Phone | Install **Home Assistant** Companion app. It finds the server on home Wi-Fi, or enter `http://homeassistant.local:8123` / `http://<vm-ip>:8123` | Home Assistant Cloud (paid, simplest), or a VPN to the home network (UniFi VPN on the Dream Machine Pro, WireGuard or Teleport; not set up yet, TO_BE_VERIFIED), then use the home address, or a Cloudflare hostname such as `ha.example.com` (no Cloudflare Access, since the app can't pass it; HA needs `use_x_forwarded_for` and `trusted_proxies` set) |
| Laptop | Browser: `http://homeassistant.local:8123` | Same options as phone |

In the Companion app, set Settings > Companion app > Server > **Internal URL** (home Wi-Fi) and **External URL** (away), so it switches by itself.

## Discovery commands (run on the NAS over SSH)
```sh
sudo virsh list --all                 # VM name and state
sudo virsh dominfo HAOS               # vCPU, memory, autostart
sudo virsh domiflist HAOS             # network bridge and MAC address
sudo virsh domblklist HAOS            # disk image path
```
Find the VM's IP in UniFi (Client Devices, search the MAC from `domiflist`).

## Backup and restore
- Use Home Assistant's own backups (Settings > System > Backups) and copy them
  off the NAS. The VM disk itself has no backup (VERIFIED: no backup tasks).
- Restore: create a fresh HAOS VM, then restore the backup during onboarding.

## Security notes
Do not port-forward 8123. If remote access is wanted, use Home Assistant Cloud,
a VPN, or a tunnel route with Cloudflare Access.

## Verification
Last verified: 2026-11-11 (UGOS Virtual Machine app, read only).
