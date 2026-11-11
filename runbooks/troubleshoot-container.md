# Troubleshoot a container

Read-only steps first; restarts need approval for production services.

```sh
docker ps -a --format 'table {{.Names}}\t{{.Status}}\t{{.Image}}'
docker logs --tail 200 <container>
docker inspect <container> --format '{{.State.Status}} {{.State.ExitCode}} {{.State.Error}} restarts={{.RestartCount}}'
docker inspect <container> --format '{{json .State.Health}}' | jq
docker stats --no-stream
df -h /volume1
```

| Symptom | Look at |
| --- | --- |
| Exits right away, code 1 | Logs: bad env var, missing folder, wrong permissions |
| Exit code 137 | Out of memory; `docker stats`, raise limits or stop other apps |
| Restart loop | `RestartCount`; logs from the first failure |
| Healthy but page doesn't load | Port mapping (`docker port <c>`), NAS firewall, wrong IP |
| Permission denied on volume | Ownership; see [storage/permissions.md](../storage/permissions.md) |
| Pull fails `toomanyrequests` | Registry rate limit; wait and redeploy |
| Not running after reboot | Restart policy (`docker inspect -f '{{.HostConfig.RestartPolicy.Name}}' <c>`) |

In UGOS: Docker app > Container > select > **Log** / **Terminal**.
