# NPM config

`/volume1/docker/npm/config.json` is mounted as `/app/config/production.json`.
Its real contents are TO_BE_VERIFIED and may contain database credentials, so it
is **not** in git. `production.json.example` shows the documented shape for an
external MySQL/MariaDB database (EXAMPLE, from the NPM docs). On a fresh install
you can drop the mount and use the built-in SQLite database instead.

Check what the NAS uses (prints keys only, no values):

```sh
sudo python3 -c "import json;d=json.load(open('/volume1/docker/npm/config.json'));print({k:list(v) if isinstance(v,dict) else type(v).__name__ for k,v in d.items()})"
```
