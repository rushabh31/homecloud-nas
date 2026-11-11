# Network architecture

```mermaid
flowchart LR
  WAN[ISP WAN] --> UDM[Dream Machine Pro]
  UDM -->|Default VLAN| SW[Switch Lite 8 PoE]
  SW --> NAS1[HomeCloud NIC1 192.168.0.119]
  SW --> NAS2[HomeCloud NIC2 TO_BE_VERIFIED]
  UDM --> APU[WAP Upper]
  UDM --> APL[WAP Lower]
  APU & APL --> SSID1[Main SSID - Default/Secure]
  APU & APL --> SSID2[IoT SSID]
  APU & APL --> SSID3[Cam SSID]
  APU & APL --> SSID4[Guest SSID]
```

| Topic | State | Where documented |
| --- | --- | --- |
| VLAN names | VERIFIED 2026-11-11 | [inventory/network-inventory.md](../inventory/network-inventory.md) |
| Subnets, DHCP ranges, reservations | TO_BE_VERIFIED | [networking/unifi](../networking/unifi/README.md) |
| Inter-VLAN firewall rules | TO_BE_VERIFIED | [networking/firewall](../networking/firewall/README.md) |
| Port forwards | TO_BE_VERIFIED (expected none) | [networking/firewall](../networking/firewall/README.md) |
| DNS (UDM, local records) | TO_BE_VERIFIED | [networking/dns](../networking/dns/README.md) |
| NAS firewall | Documented privately | [networking/firewall](../networking/firewall/README.md) |

Design intent (recommended):
- NAS on Default (or Secure); IoT and cameras isolated; Home Assistant allowed to
  reach IoT; Guest isolated from everything.
- DHCP reservation for the NAS at 192.168.0.119 (tunnel routes depend on it).
