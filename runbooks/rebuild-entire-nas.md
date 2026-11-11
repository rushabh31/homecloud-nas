# Rebuild the entire NAS

> Approval: required throughout. Assumes a backup exists (it does not today; see [backups/](../backups/README.md)).

## 1. Hardware and OS
1. Install UGOS Pro, create admin, update firmware.
2. Storage Manager: create the pool (RAID 1 if two disks), Volume 1 Btrfs, SSD cache.
3. Users: recreate NAS users (same names, so `/volume1/@home/<user>` paths match the compose files).
4. Network: same LAN IP `192.168.0.119` via UniFi DHCP reservation.
5. Security: 2FA, firewall, Telnet off, SSH off when not in use.

## 2. Data
Restore shared folders, home folders and `/volume1/docker` from backup.

## 3. Services (in dependency order, see [inventory/dependencies.md](../inventory/dependencies.md))
1. Install the Docker app.
2. `cloudflare-tunnel` with the saved token.
3. Databases come up with their projects: Immich, Mattermost.
4. Apps: [immich](../services/immich/README.md), [mattermost](../services/mattermost/README.md), [portainer](../services/portainer/README.md).
5. App Center: OKNote, SiYuan (restore their `@appstore` folders after install).
6. NPM if Pattern B is used.
7. Virtual Machine app: recreate HAOS, restore an HA backup.

## 4. Check
- Every row in `inventory/services.yaml` running as recorded.
- Every hostname in [domains/domain-inventory.md](../domains/domain-inventory.md) loads from outside.
- Run `scripts/discover-services.sh` and `scripts/detect-drift.py`; fix or document every difference.
- Snapshot plans and backup tasks recreated.
