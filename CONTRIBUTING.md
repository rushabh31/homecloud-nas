# Contributing (humans and agents)

1. Follow the workflow in [AGENTS.md](AGENTS.md#0-the-mandatory-workflow).
2. One logical change per commit. Message format:
   `<area>: <what changed>` e.g. `immich: pin server to v3.4.1`, `domains: add photos.example.com`.
3. Substantial changes (new service, routing change, storage change) go through a
   pull request using the template; doc-only fixes may go straight to `main`.
4. Before committing run:
   ```bash
   python3 scripts/check_docs.py && bash scripts/validate-compose.sh
   ```
5. Every change gets a line in [CHANGELOG.md](CHANGELOG.md) under the date.
6. Labels: mark every new fact `VERIFIED <date>`, `USER-PROVIDED`, `TO_BE_VERIFIED`
   or `EXAMPLE`.
7. Never commit secrets, `.env` files, raw `docker inspect` output, database files,
   certificates or VM disks.

## Rolling back

Configuration: `git revert <commit>` then redeploy the service from the reverted
compose file (with approval). Data: restore from backups ([backups/restore-procedures.md](backups/restore-procedures.md)).
