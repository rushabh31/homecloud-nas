# AGENTS.md: rules for AI agents working on this home lab

You are working on a family's home infrastructure. Mistakes can lose family
photos or lock people out. Read this whole file before any task.

## 0. The mandatory workflow

```
Read repo -> Inspect the real system -> Plan -> Get approval -> Change
          -> Validate -> Update docs -> Commit
```

1. **Read** the relevant files here first: this file, the service's
   `services/<name>/README.md`, [inventory/services.yaml](inventory/services.yaml),
   and the matching runbook.
2. **Inspect** the real system before trusting the repo. Check each fact's label
   (`VERIFIED <date>`, `USER-PROVIDED`, `TO_BE_VERIFIED`, `EXAMPLE`). Anything not
   `VERIFIED` recently must be re-checked. Use [scripts/discover-services.sh](scripts/discover-services.sh)
   and [scripts/detect-drift.py](scripts/detect-drift.py) when you have NAS shell access.
3. **Plan** the smallest reversible change. Write the plan down for the owner.
4. **Approval**: see section 4. When in doubt, ask.
5. **Change**, then **validate** on the real system (container healthy, URL loads).
6. **Update docs in the same task**: service README, compose file, `.env.example`,
   `inventory/services.yaml`, inventory tables, domain inventory, diagrams, CHANGELOG.
7. **Validate the repo**: `python3 scripts/check_docs.py` and
   `bash scripts/validate-compose.sh`. Then **commit** with a clear message.

> **No infrastructure change is complete until its documentation has been
> updated, validated and committed to this private repository.** If you cannot
> commit (no Git access), say so plainly and list the pending files. Never claim
> the repo is in sync when it is not.

This applies to everything: UGOS UI deployments, App Center apps, Portainer
stacks, compose files, VMs, Cloudflare routes, NPM hosts, UniFi changes.

## 1. Architecture in one minute

- **NAS**: UGREEN DXP6800 Pro, name `HomeCloud`, UGOS Pro, LAN IP `192.168.0.119`
  (second NIC also on the LAN). Admin UI `http://192.168.0.119:9999` / HTTPS `:9443`.
- **Storage**: `/volume1` (Btrfs, one 12.7 TB HDD, no RAID, 2 NVMe SSDs as cache).
  UI "Shared folder/X" = `/volume1/X`; UI "User folder/<u>" = `/volume1/@home/<u>`;
  App Center data = `/volume1/@appstore/<app-id>`.
- **Docker**: UGREEN Docker app. One *Project* (compose stack) per service, storage
  path `/volume1/docker/<service>`. Portainer also present.
- **VM**: UGOS Virtual Machine app (KVM), one VM `HAOS` (Home Assistant OS).
- **Network**: UniFi Dream Machine Pro -> Switch Lite 8 PoE -> NAS; VLANs Default,
  Guest, IoT, Secure, Security Cameras; ISP ISP. Subnets/firewall `TO_BE_VERIFIED`.
- **Public access**: `example.com` on Cloudflare -> Cloudflare Tunnel
  (`cloudflare-tunnel` container, token-based, outbound only) -> app directly or
  -> Nginx Proxy Manager -> app. **No router port forwards** (`TO_BE_VERIFIED` in UniFi).
- **People**: NAS users `Rushabh` (admin), `user2`, `user3`.

## 2. Where things are

| Need | File |
| --- | --- |
| All services, ports, state (machine-readable) | [inventory/services.yaml](inventory/services.yaml) |
| Human service list | [inventory/docker-services.md](inventory/docker-services.md) |
| Which service needs which | [inventory/dependencies.md](inventory/dependencies.md) |
| Ports already taken | [inventory/network-inventory.md](inventory/network-inventory.md) |
| Domains and routes | [inventory/domains.md](inventory/domains.md), [domains/domain-inventory.md](domains/domain-inventory.md) |
| Compose for a service | `services/<name>/docker-compose.yml` (+ `.env.example`) |
| How to publish a subdomain | [domains/add-new-subdomain.md](domains/add-new-subdomain.md) |
| How to deploy a service | [runbooks/deploy-new-service.md](runbooks/deploy-new-service.md) |
| Troubleshooting | [runbooks/](runbooks/) `troubleshoot-*.md`, [domains/troubleshooting.md](domains/troubleshooting.md) |
| Backups and rebuild | [backups/](backups/), [runbooks/rebuild-entire-nas.md](runbooks/rebuild-entire-nas.md) |

Dependencies: read `depends_on` and `routing` in `inventory/services.yaml`, then
the service README "Dependencies" section.

## 3. Conventions for any new or changed service

- Folder: `/volume1/docker/<service>`; compose and data live together.
- Pin image versions (no `:latest` for new services); `restart: unless-stopped`;
  healthcheck where the image supports it; named project network.
- Secrets only via `${VARS}` and a `.env` on the NAS; `.env.example` in git.
- Family folders (`/volume1/@home/*`, `/volume1/Documents`) mount `:ro` unless
  the owner explicitly asks for write access (Immich has write access by owner request).
- Pick a free port from [inventory/network-inventory.md](inventory/network-inventory.md).
- Publish through the tunnel only; never port-forward; never publish UGOS (9999/9443),
  Portainer, NPM admin (81) or Home Assistant without Cloudflare Access.
- Scaffold docs with `python3 scripts/scaffold-service.py <name>`.

## 4. Safe vs approval-required

**Safe without asking** (read-only or repo-only):
- Reading the repo, UGOS UI, container logs, `docker ps/inspect` (sanitised).
- Running discovery and drift scripts (they only read).
- Editing documentation and opening a PR / committing doc-only changes.

**Needs the owner's explicit approval first**:
- Creating, starting, stopping, restarting, updating, redeploying or removing any
  container, project, VM or App Center app.
- Changing mounts, ports, networks, env vars, or permissions on any folder.
- Any delete of data, snapshots, volumes, images in use, or files under `/volume1`.
- Any Cloudflare change (DNS, tunnel routes, Access policies, SSL mode).
- Any NPM proxy host / certificate change.
- Any UniFi change (firewall, VLAN, port forward, DHCP, DNS).
- UGOS settings, updates, users, passwords, 2FA, firewall.
- Anything that could interrupt a running service, even briefly.

**Never**:
- Commit or print secrets (passwords, tokens, keys, tunnel credentials, the
  value of any env var whose name contains PASS, TOKEN, SECRET, KEY, CRED, DSN, DATASOURCE).
- Expose NAS management interfaces to the internet.
- "Fix" drift by changing production automatically. Report it; the owner decides.

## 5. Secrets handling

- Real values live in: `/volume1/docker/<service>/.env` on the NAS (mode 600),
  the UGOS compose editor, and the owner's password manager.
- `docker inspect` leaks env vars, labels and command lines. Always use
  `scripts/discover-services.sh`, which drops env values and redacts commands.
- If a secret is ever committed: tell the owner, rotate the secret, then purge
  history (`git filter-repo`). Rotating comes first.

## 6. Keeping docs accurate

- After any change: update `last_verified` in `inventory/services.yaml` and the
  `VERIFIED <date>` label in the service README.
- Monthly (or after any change on the NAS): run discovery + drift on the NAS and
  commit the sanitised report to `reports/` (see [scripts/README.md](scripts/README.md)).
- Add an entry to [CHANGELOG.md](CHANGELOG.md) for every change.
- When removing a service: move its folder to `services/_archive/<name>/`,
  set `state: removed` in the inventory, update diagrams and CHANGELOG.

## 7. Validation commands

```bash
python3 scripts/check_docs.py          # structure, links, inventory, secret scan
bash scripts/validate-compose.sh       # compose syntax (docker compose config)
python3 scripts/detect-drift.py --discovered reports/discovered-latest.json  # needs NAS output
```

Repo validation proves the files are consistent; only discovery on the NAS proves
they match reality. Say which one you ran.
