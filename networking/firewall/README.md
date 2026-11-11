# Firewall and exposure

## Current state
| Layer | State | Label |
| --- | --- | --- |
| Router port forwards | Expected none | TO_BE_VERIFIED |
| UniFi inter-VLAN rules | TO_BE_VERIFIED | |
| NAS firewall (UGOS) | Documented privately | |
| NAS DoS protection | Documented privately | |
| Remote shell services | Documented privately | |
| SSH on NAS | Off | VERIFIED 2026-11-11 |
| Vendor remote-access relay | Documented privately | |
| Public entry | Cloudflare Tunnel only | VERIFIED (design) |

## Recommended (needs owner approval, production-impacting)
1. Disable any remote shell service that is not needed (Control Panel > Terminal).
2. Turn on the UGOS firewall with allow rules for 192.168.0.0/24 to the ports in
   [inventory/network-inventory.md](../../inventory/network-inventory.md), deny the rest.
3. UniFi: block IoT/Guest/Cameras -> Default, allow Home Assistant -> IoT.
4. Keep zero port forwards.
5. Put Cloudflare Access on every public hostname that is not a phone-app API.

## Check exposure from outside
From a phone on mobile data, or any outside host:
```sh
nmap -Pn -p 1-1024,2283,8000,8401,9000,9443,9999,38080 <your-public-ip>   # expect all filtered/closed
```
