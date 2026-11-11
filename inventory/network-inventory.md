# Network inventory

## Devices (infrastructure only)

| Device | Role | Status |
| --- | --- | --- |
| UniFi Dream Machine Pro | Gateway, firewall, DHCP, DNS, UniFi controller | VERIFIED 2026-11-11 (topology) |
| UniFi Switch Lite 8 PoE | Switch; NAS connects here | VERIFIED 2026-11-11 |
| WAP - Upper Level, WAP - Lower Level | Wi-Fi access points | VERIFIED 2026-11-11 |
| ISP | ISP uplink | VERIFIED 2026-11-11 |
| HomeCloud (2 NICs) | NAS | VERIFIED 2026-11-11 |
| homeassistant | Separate Home Assistant host | VERIFIED 2026-11-11 (seen as client) |

## VLANs / networks (UniFi)

| Name | Purpose (assumed from name) | Subnet | NAS on it? |
| --- | --- | --- | --- |
| Default | Main LAN | 192.168.0.0/24 (NAS is 192.168.0.119) | Yes |
| Secure | TO_BE_VERIFIED | TO_BE_VERIFIED | TO_BE_VERIFIED |
| IoT | Smart home devices | TO_BE_VERIFIED | TO_BE_VERIFIED |
| Guest | Guest Wi-Fi | TO_BE_VERIFIED | No (expected) |
| Security Cameras | Cameras | TO_BE_VERIFIED | No (expected) |

VLAN names `VERIFIED 2026-11-11`; subnets, firewall rules, port forwards and DNS
settings `TO_BE_VERIFIED`: collect via [networking/unifi/README.md](../networking/unifi/README.md).

## NAS addresses and ports in use

`VERIFIED 2026-11-11` unless marked.

| Port | Service | Exposure |
| --- | --- | --- |
| 80, 443/tcp | Nginx Proxy Manager (stopped) | LAN / tunnel target |
| 81/tcp | NPM admin UI | LAN only |
| 445/tcp | SMB | LAN only |
| 2283/tcp | Immich | LAN only |
| 3010/tcp | Dashboard (Homepage) | via tunnel, behind Cloudflare Access |
| 6806/tcp | SiYuan | LAN only |
| 8000, 9000/tcp | Portainer | LAN only |
| 8401/tcp | Mattermost (stopped) | via tunnel |
| 9999, 9443/tcp | UGOS admin UI | LAN only, never publish |
| 38080/tcp | OKNote | via tunnel (hostname USER-PROVIDED) |

**Free port rule**: before using a port, check this table and run
`ss -tlnp | grep :<port>` on the NAS.
