# Remove a service

> Approval: required. Destructive steps (deleting data) need a separate explicit yes.

1. Check dependents in [inventory/dependencies.md](../inventory/dependencies.md) and public routes in [domains/domain-inventory.md](../domains/domain-inventory.md).
2. Remove the public route first (Cloudflare tunnel hostname / NPM proxy host) and its DNS record.
3. Docker app > Project > `<name>` > **Stop**. Leave it stopped for a few days if unsure.
4. Back up `/volume1/docker/<name>` (snapshot or copy).
5. Docker app > Project > **Delete** (keeps the folder unless you tick data deletion).
6. Only with explicit approval: delete `/volume1/docker/<name>`.
7. Docs: move `services/<name>/` to `services/_archive/<name>/`, remove the entry from `inventory/*`, `domains/domain-inventory.md`, add a `CHANGELOG.md` entry.
