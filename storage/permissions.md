# Permissions

## NAS users (VERIFIED 2026-11-11)
| User | Role |
| --- | --- |
| Rushabh | Administrator |
| user2 | Standard |
| user3 | Standard |

UIDs/GIDs: TO_BE_VERIFIED. Get them with `id Rushabh; id user2; id user3`.

## Container users
| Service | Runs as | Data ownership needed |
| --- | --- | --- |
| Mattermost | UID 2000 (image default) | `chown -R 2000:2000 /volume1/docker/mattermost/{config,data,logs,plugins,client,indexes}` |
| Immich server | root (image default) | none; files it writes into Photos folders will be owned by root (TO_BE_VERIFIED) |
| Postgres images | UID 999 inside | managed by the image on first start |
| Others | root (image default) | none |

## Rules
- Do not `chmod -R 777` shared folders.
- Prefer `PUID`/`PGID` env vars where an image supports them, set to the owning NAS user.
- Check before and after changes: `ls -ln <path> | head`.
