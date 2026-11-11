# Domain routing

```mermaid
sequenceDiagram
  participant B as Browser
  participant CF as Cloudflare edge
  participant T as cloudflared (NAS)
  participant N as Nginx Proxy Manager
  participant A as App container
  B->>CF: HTTPS oknote.example.com (TLS ends here)
  CF->>CF: Optional Cloudflare Access login
  CF->>T: Request over the tunnel (encrypted, outbound-initiated)
  alt Pattern A: direct route
    T->>A: HTTP 192.168.0.119:38080
  else Pattern B: via NPM
    T->>N: HTTP 192.168.0.119:80 (Host header kept)
    N->>A: HTTP 192.168.0.119:<port>
  end
  A-->>B: Response back the same way
```

| Hop | Protocol | TLS? |
| --- | --- | --- |
| Browser -> Cloudflare | HTTPS | Yes, Cloudflare edge certificate |
| Cloudflare -> cloudflared | Tunnel (QUIC/HTTP2) | Yes, tunnel encryption |
| cloudflared -> NPM / app | HTTP on LAN | No (stays inside the NAS/LAN) |
| NPM -> app | HTTP on LAN | No |

Live (VERIFIED 2026-11-11): every `example.com` hostname uses Pattern A (tunnel straight to
the app port). The old `example.net` hostnames for oknote, portainer, mattermost and siyuan
still use Pattern B through NPM until they are removed.
Full guide: [domains/](../domains/README.md).
