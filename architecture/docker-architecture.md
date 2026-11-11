# Docker architecture

- Engine and Compose come with the UGOS **Docker** app. Projects are compose stacks
  whose folder is the "storage path" (`/volume1/docker/<service>`).
- Each project gets its own bridge network (`<project>_default`). App Center apps
  (OKNote, SiYuan) use the default `bridge`.
- **Cross-project traffic goes through the NAS LAN IP** (`192.168.0.119:<port>`),
  e.g. cloudflared -> OKNote. No shared Docker network exists today.
- Option for later: a shared external network `proxy` joined by cloudflared, NPM
  and apps, so routes can use container names instead of LAN IP:port.

```mermaid
flowchart LR
  subgraph cloudflared_default
    CFD[cloudflare-tunnel]
  end
  subgraph npm_default
    NPM[Nginx-Proxy-Manager]
  end
  subgraph immich_default
    IS[immich_server] --- IP[(postgres)] & IR[(redis)] & IML[ML]
  end
  subgraph mattermost_default
    MM[Mattermost] --- MMDB[(postgres 18)]
  end
  subgraph bridge
    OK[oknote] 
    SY[siyuan]
  end
  CFD -- 192.168.0.119:38080 --> OK
  CFD -- 192.168.0.119:8401 --> MM
  NPM -. 192.168.0.119:port .-> IS
```

Conventions for new services: [AGENTS.md section 3](../AGENTS.md#3-conventions-for-any-new-or-changed-service).
