# Runbooks

Step-by-step procedures. Each one says whether it needs owner approval.

| Runbook | Approval needed? |
| --- | --- |
| [deploy-new-service.md](deploy-new-service.md) | Yes (adds a running service) |
| [update-service.md](update-service.md) | Yes |
| [remove-service.md](remove-service.md) | Yes (destructive) |
| [add-new-domain.md](add-new-domain.md) | Yes (public exposure) |
| [troubleshoot-container.md](troubleshoot-container.md) | No for reading; yes for restarts |
| [troubleshoot-network.md](troubleshoot-network.md) | No for reading |
| [troubleshoot-ssl.md](troubleshoot-ssl.md) | No for reading |
| [restore-service.md](restore-service.md) | Yes |
| [rebuild-entire-nas.md](rebuild-entire-nas.md) | Yes |

Every runbook ends with: update docs + inventory + CHANGELOG in the same commit, `make check`.
