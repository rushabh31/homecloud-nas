# Scripts

All scripts are **read-only** toward the NAS. None restarts, stops or edits a service.

| Script | Runs where | Does |
| --- | --- | --- |
| `discover-services.sh` | NAS (SSH, sudo) | Sanitized `docker inspect` snapshot to JSON: env var *names* only, no command args |
| `detect-drift.py` | anywhere | Compares a snapshot with `inventory/services.yaml` (exit 2 on drift) |
| `sync-inventory.py` | anywhere | Writes `reports/services.proposed.yaml` for review; never edits inventory |
| `validate-compose.sh` | anywhere | `docker compose config -q` for each service (YAML parse fallback) |
| `check_docs.py` | anywhere / CI | Required files, broken links, inventory vs folders, `${VAR}` vs `.env.example`, secret scan |
| `scaffold-service.py` | anywhere | New `services/<name>/` from templates + inventory stub |

`make check` runs `validate-compose.sh` and `check_docs.py`.

## Drift workflow
```sh
# on the NAS (needs SSH enabled; turn it off afterwards)
sudo bash scripts/discover-services.sh > reports/discovered-latest.json
python3 scripts/detect-drift.py --discovered reports/discovered-latest.json
python3 scripts/sync-inventory.py --discovered reports/discovered-latest.json
diff -u inventory/services.yaml reports/services.proposed.yaml
```
`reports/` is git-ignored: snapshots stay local. Review before committing anything derived from them.

## Scheduling on the NAS (optional, needs owner approval)
UGOS Control Panel > Task Scheduler (if present on your firmware, TO_BE_VERIFIED) or root cron:
```
0 6 * * 1  cd /volume1/docker/home-nas-infrastructure && bash scripts/discover-services.sh > reports/discovered-latest.json && python3 scripts/detect-drift.py --discovered reports/discovered-latest.json > reports/drift.txt
```
Automatic commits from the NAS are **not** set up: they would need a GitHub deploy key on the NAS. Review `reports/drift.txt` and commit by hand.

## Requirements
`bash`, `jq` (discovery), `python3` with `PyYAML` (`pip install pyyaml`), optionally Docker for full compose validation.
