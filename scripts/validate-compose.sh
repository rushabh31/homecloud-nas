#!/usr/bin/env bash
# Validate every services/*/docker-compose.yml.
# Uses `docker compose config -q` when Docker is available (dummy env values
# from .env.example), otherwise falls back to a YAML parse.
set -uo pipefail
cd "$(dirname "$0")/.."
fail=0
for f in services/*/docker-compose.yml templates/docker-compose.yml; do
  [ -f "$f" ] || continue
  dir=$(dirname "$f")
  case "$f" in templates/*|services/_template/*) yaml_only=1 ;; *) yaml_only=0 ;; esac
  if [ "$yaml_only" = 0 ] && command -v docker >/dev/null && docker compose version >/dev/null 2>&1; then
    envfile=$(mktemp)
    [ -f "$dir/.env.example" ] && grep -E '^[A-Za-z_][A-Za-z0-9_]*=' "$dir/.env.example" > "$envfile"
    if docker compose --env-file "$envfile" -f "$f" config -q 2>/tmp/compose-err.$$; then
      echo "ok    $f"
    else
      echo "FAIL  $f"; sed 's/^/      /' /tmp/compose-err.$$; fail=1
    fi
    rm -f "$envfile" /tmp/compose-err.$$
  else
    if python3 -c "import sys,yaml; d=yaml.safe_load(open(sys.argv[1])); assert 'services' in d" "$f" 2>/dev/null; then
      echo "ok    $f (yaml only)"
    else
      echo "FAIL  $f (yaml)"; fail=1
    fi
  fi
done
exit $fail
