# UniFi (Dream Machine Pro)

USER-PROVIDED: the network runs on a UniFi Dream Machine Pro.

## Known (VERIFIED 2026-11-11, from the UniFi topology view)
- Gateway: Dream Machine Pro, uplink ISP.
- Switch Lite 8 PoE (the NAS is wired here); APs "WAP - Upper Level" and "WAP - Lower Level".
- Networks: Default, Secure, IoT, Guest, Security Cameras.
- NAS: `HomeCloud`, 192.168.0.119 on Default.

## To collect (TO_BE_VERIFIED)
Fill in the table, then flip the label to `VERIFIED <date>`.

| Network | VLAN ID | Subnet | Gateway | DHCP range | Isolation | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Default | | 192.168.0.0/24 (inferred from NAS IP) | | | | |
| Secure | | | | | | |
| IoT | | | | | | |
| Guest | | | | | | |
| Security Cameras | | | | | | |

Also record:
- DHCP reservation for the NAS (192.168.0.119) and for the Home Assistant VM: present? `TO_BE_VERIFIED`
- Port forwards: Settings > Firewall & Security > Port Forwarding. Expected: **none**.
- Wi-Fi SSIDs and which network each maps to.
- UniFi OS / Network app versions.

## Where to find it
- Networks: UniFi Network > Settings > Networks (each row shows VLAN ID, subnet, DHCP).
- Reservations: Client Devices > HomeCloud > Settings > Fixed IP.
- Firewall: Settings > Security / Firewall rules (zone-based on newer firmware).
- Backup: Settings > Control Plane > Backups (download one and keep it off the UDM; never commit it, it contains secrets).

Optional discovery over SSH to the UDM (read only):
```sh
ssh root@<udm-ip> 'ip -br addr; ip route'
```
