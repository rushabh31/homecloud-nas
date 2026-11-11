# Dependencies

```mermaid
flowchart TD
  CF[Cloudflare zone example.com] --> T[cloudflare-tunnel]
  T --> NPM[nginx-proxy-manager<br/>optional hop]
  T --> MM[mattermost]
  T --> OK[oknote]
  NPM -.-> MM
  NPM -.-> OK
  MM --> MMDB[(Mattermost-DB postgres:18)]
  IS[immich_server] --> IP[(immich_postgres)]
  IS --> IR[(immich_redis)]
  IS --> IML[immich_machine_learning]
  IS --> PH[/volume1/@home/*/Photos/]
  OK --> DOC[/volume1/Documents/]
  PORT[portainer] --> SOCK[/var/run/docker.sock/]
```

| Service | Needs | Needed by |
| --- | --- | --- |
| cloudflare-tunnel | Cloudflare account + tunnel token, internet | every public hostname |
| nginx-proxy-manager | (none) | public hostnames routed through it (TO_BE_VERIFIED) |
| immich | its postgres, redis, ML containers; family Photos folders | family phones/browsers |
| mattermost | Mattermost-DB; tunnel for public access | team users |
| oknote | /volume1/Documents; tunnel for oknote.example.com | notes users |
| portainer | Docker socket | admins |
| home-assistant | LAN bridge (bridge0), IoT VLAN reachability (TO_BE_VERIFIED) | smart home |

Start order after a rebuild: storage -> cloudflare-tunnel -> nginx-proxy-manager
(if used) -> databases -> apps. Compose `depends_on` handles order inside a project.
