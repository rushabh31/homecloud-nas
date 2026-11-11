# Architecture overview

A single UGREEN NAS hosts storage, Docker services and one VM. A UniFi Dream
Machine Pro runs the home network. Selected web apps are published at
`*.example.com` through a Cloudflare Tunnel; nothing is port-forwarded.

```mermaid
flowchart TB
  subgraph Internet
    User((Family / guests))
    CFE[Cloudflare edge<br/>DNS, TLS, Access]
  end
  ISP[ISP] --- UDM
  subgraph Home[Home network]
    UDM[UniFi Dream Machine Pro<br/>VLANs: Default, Secure, IoT,<br/>Guest, Security Cameras]
    SW[Switch Lite 8 PoE]
    AP[2 x UniFi APs]
    UDM --- SW --- NAS
    UDM --- AP
    subgraph NAS[HomeCloud 192.168.0.119]
      CFD[cloudflare-tunnel]
      NPM[nginx-proxy-manager<br/>stopped]
      IM[immich :2283]
      OK[oknote :38080]
      SY[siyuan :6806]
      PT[portainer :9000]
      MM[mattermost :8401<br/>stopped]
      VM[HAOS VM<br/>stopped]
      VOL[(Volume 1 Btrfs 12.7 TB<br/>single HDD + SSD cache)]
    end
  end
  User --> CFE
  CFD -- outbound QUIC/HTTP2 --> CFE
  CFE -. requests via tunnel .-> CFD
  CFD --> OK
  CFD --> MM
  CFD -.optional.-> NPM
```

Key properties:
- **Single point of failure**: one HDD, no RAID, no backups (see [backups/](../backups/)).
- **Outbound-only exposure**: Cloudflare Tunnel; TLS ends at Cloudflare.
- **LAN-only admin**: UGOS, Portainer, NPM admin, Immich (for now).

Details: [network](network-architecture.md), [docker](docker-architecture.md),
[domain routing](domain-routing.md), [storage](storage-architecture.md).
