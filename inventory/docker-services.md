# Docker services inventory

`VERIFIED 2026-11-11` from UGOS Docker > Container / Project / Network.
Machine-readable copy: [services.yaml](services.yaml).

| Container | Service folder | Image:tag | Compose project | State | Ports (host:ctr) | Network | Auto-restart |
| --- | --- | --- | --- | --- | --- | --- | --- |
| immich_server | [immich](../services/immich/) | ghcr.io/immich-app/immich-server:v3 | immich | Running | 2283:2283 | immich_default | always (compose) |
| immich_machine_learning | immich | ghcr.io/immich-app/immich-machine-learning:v3 | immich | Running | - | immich_default | always |
| immich_redis | immich | valkey/valkey:9 (digest pinned) | immich | Running | - | immich_default | always |
| immich_postgres | immich | ghcr.io/immich-app/postgres:14-vectorchord0.4.3-pgvectors0.2.0 | immich | Running | - | immich_default | always |
| cloudflare-tunnel | [cloudflare-tunnel](../services/cloudflare-tunnel/) | cloudflare/cloudflared:latest | cloudflared | Running | - | cloudflared_default | **Disabled** |
| Nginx-Proxy-Manager | [nginx-proxy-manager](../services/nginx-proxy-manager/) | jc21/nginx-proxy-manager:latest | npm | Stopped (exited 2026-11-05) | 80, 81, 443 | npm_default | TO_BE_VERIFIED |
| Portainer | [portainer](../services/portainer/) | portainer/portainer-ce:latest | portainer | Running | 9000, 8000 | portainer_default | TO_BE_VERIFIED |
| Mattermost | [mattermost](../services/mattermost/) | mattermost/mattermost-team-edition:latest | mattermost | Stopped | 8401:8065 | mattermost_default | **Disabled** |
| Mattermost-DB | mattermost | postgres:18 | mattermost | Stopped | - | mattermost_default | **Disabled** |
| oknote | [oknote](../services/oknote/) | oknote/oknote:3.2.7 | oknote | Running | 38080 | bridge | TO_BE_VERIFIED |
| siyuan-app-1 | [siyuan](../services/siyuan/) | ugreen/siyuan:v3.8.4 | siyuan | Running | 6806 | bridge | TO_BE_VERIFIED |
| dashboard | [dashboard](../services/dashboard/) | ghcr.io/gethomepage/homepage:v2.7.0 | dashboard | Running | 3010:3000 | dashboard_default | unless-stopped |
| dashboard-config | dashboard | busybox:1.37.0 | dashboard | Exited 0 (runs once per deploy) | - | dashboard_default | no |

UGOS flagged newer images for: cloudflare-tunnel, Portainer, Mattermost, Mattermost-DB.

Projects visible in the UGREEN Docker *Project* list: immich, siyuan, portainer, oknote.
`cloudflared`, `npm` and `mattermost` exist as compose projects but were created
elsewhere (likely Portainer or CLI); manage them from Portainer or recreate them as
UGREEN Projects from the compose files here.

## Refresh
On the NAS: `bash scripts/discover-services.sh > reports/discovered-latest.json`, then
`python3 scripts/detect-drift.py --discovered reports/discovered-latest.json`.
