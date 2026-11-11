#!/usr/bin/env bash
# Read-only discovery of Docker services on the NAS.
# Writes a SANITIZED JSON snapshot: env var NAMES only (never values),
# no command/entrypoint args, no labels values that look secret.
#
# Usage (on the NAS, over SSH):
#   sudo bash scripts/discover-services.sh > reports/discovered-$(date +%F).json
#   cp reports/discovered-$(date +%F).json reports/discovered-latest.json
# Requires: docker, jq (UGOS ships jq; otherwise use the Docker app terminal).
# Changes nothing on the system.
set -euo pipefail

command -v docker >/dev/null || { echo "docker not found" >&2; exit 1; }
command -v jq >/dev/null || { echo "jq not found" >&2; exit 1; }

ids=$(docker ps -aq)
if [ -z "$ids" ]; then echo '{"containers":[]}'; exit 0; fi

# shellcheck disable=SC2086
docker inspect $ids | jq --arg host "$(hostname)" --arg at "$(date -u +%FT%TZ)" '
{
  generated_at: $at,
  host: $host,
  containers: [ .[] | {
    name: (.Name | ltrimstr("/")),
    image: .Config.Image,
    state: .State.Status,
    restart_policy: .HostConfig.RestartPolicy.Name,
    compose_project: (.Config.Labels["com.docker.compose.project"] // null),
    compose_service: (.Config.Labels["com.docker.compose.service"] // null),
    compose_workdir: (.Config.Labels["com.docker.compose.project.working_dir"] // null),
    ports: [ (.HostConfig.PortBindings // {}) | to_entries[] |
             {container: .key, host: ([.value[]?.HostPort] | join(","))} ],
    networks: ((.NetworkSettings.Networks // {}) | keys),
    mounts: [ .Mounts[] | {type: .Type, source: (.Source // .Name), target: .Destination, rw: .RW} ],
    env_names: [ (.Config.Env // [])[] | split("=")[0] ] | sort
  } ] | sort_by(.name)
}'
