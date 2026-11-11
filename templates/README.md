# Templates

| File | Use |
| --- | --- |
| [service-readme.md](service-readme.md) | README for a new `services/<name>/` |
| [docker-compose.yml](docker-compose.yml) | Starting compose file |
| [env.example](env.example) | Starting `.env.example` |
| [deployment-checklist.md](deployment-checklist.md) | Steps to tick while deploying |

`python3 scripts/scaffold-service.py <name>` copies these into `services/<name>/`.
`services/_template/` is the same set laid out as a service folder.
