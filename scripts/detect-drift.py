#!/usr/bin/env python3
"""Compare a discovery snapshot (from discover-services.sh) with
inventory/services.yaml and print differences. Read-only.

  python3 scripts/detect-drift.py --discovered reports/discovered-latest.json
Exit code 0 = no drift, 2 = drift found, 1 = error.
"""
import argparse, json, sys, os
import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--discovered", required=True)
    ap.add_argument("--inventory", default=os.path.join(ROOT, "inventory/services.yaml"))
    a = ap.parse_args()
    found = {c["name"]: c for c in json.load(open(a.discovered))["containers"]}
    inv = yaml.safe_load(open(a.inventory))["services"]
    expected = {}
    for svc in inv:
        key = svc["name"]
        for c in svc.get("containers") or []:
            expected[c["name"]] = (key, svc, c)

    drift = []
    for name, (key, svc, c) in sorted(expected.items()):
        if name not in found:
            drift.append(f"MISSING   {name} ({key}) is in inventory but not on the NAS")
            continue
        f = found[name]
        norm = lambda i: i.split("@")[0].removeprefix("docker.io/")
        if c.get("image") and norm(c["image"]) != norm(f["image"]):
            drift.append(f"IMAGE     {name}: inventory {c['image']} != NAS {f['image']}")
        want_state = svc.get("state")
        if want_state in ("running", "stopped"):
            got = "running" if f["state"] == "running" else "stopped"
            if got != want_state:
                drift.append(f"STATE     {name}: inventory {want_state} != NAS {f['state']}")
        inv_ports = sorted(str(p).split(":")[0] for p in (c.get("ports") or []))
        nas_ports = sorted(h for p in f["ports"] for h in p["host"].split(",") if h)
        if inv_ports and inv_ports != nas_ports:
            drift.append(f"PORTS     {name}: inventory {inv_ports} != NAS {nas_ports}")
    for name in sorted(set(found) - set(expected)):
        drift.append(f"UNTRACKED {name} ({found[name]['image']}) runs on the NAS but is not in inventory")

    for d in drift:
        print(d)
    print(f"{len(expected)} expected, {len(found)} found, {len(drift)} differences")
    sys.exit(2 if drift else 0)

if __name__ == "__main__":
    main()
