#!/usr/bin/env python3
"""Write a proposed inventory update from a discovery snapshot.

Never edits inventory/services.yaml in place. It writes
reports/services.proposed.yaml with:
  - image / state / ports refreshed for containers already in inventory
  - untracked containers added under `_untracked` for a human to sort
Review the diff, then copy over by hand:
  python3 scripts/sync-inventory.py --discovered reports/discovered-latest.json
  diff -u inventory/services.yaml reports/services.proposed.yaml
"""
import argparse, json, os, datetime
import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--discovered", required=True)
    ap.add_argument("--out", default=os.path.join(ROOT, "reports/services.proposed.yaml"))
    a = ap.parse_args()
    snap = json.load(open(a.discovered))
    found = {c["name"]: c for c in snap["containers"]}
    inv = yaml.safe_load(open(os.path.join(ROOT, "inventory/services.yaml")))
    today = datetime.date.today().isoformat()
    seen = set()
    for svc in inv["services"]:
        cs = svc.get("containers") or []
        for c in cs:
            f = found.get(c["name"])
            if not f:
                continue
            seen.add(c["name"])
            c["image"] = f["image"]
            c["ports"] = [f"{p['host']}:{p['container'].split('/')[0]}" for p in f["ports"] if p["host"]]
        if cs and all(c["name"] in found for c in cs):
            states = {found[c["name"]]["state"] for c in cs}
            svc["state"] = "running" if states == {"running"} else "stopped" if "running" not in states else "partial"
            svc["last_verified"] = today
    untracked = {n: {"image": f["image"], "state": f["state"], "compose_project": f["compose_project"]}
                 for n, f in found.items() if n not in seen}
    if untracked:
        inv["_untracked"] = untracked
    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    with open(a.out, "w") as fh:
        fh.write(f"# PROPOSED from {os.path.basename(a.discovered)} on {today}. Review before copying.\n")
        yaml.safe_dump(inv, fh, sort_keys=False)
    print(f"wrote {a.out} ({len(untracked)} untracked containers)")

if __name__ == "__main__":
    main()
