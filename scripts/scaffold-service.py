#!/usr/bin/env python3
"""Create services/<name>/ from templates/ and add a stub to inventory.

  python3 scripts/scaffold-service.py <name> [--port 8080]
Refuses to overwrite an existing folder.
"""
import argparse, os, re, shutil, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("name")
    ap.add_argument("--port", default="<nas-port>")
    a = ap.parse_args()
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]*", a.name):
        sys.exit("name must be lowercase letters, digits, hyphens")
    dst = os.path.join(ROOT, "services", a.name)
    if os.path.exists(dst):
        sys.exit(f"{dst} already exists")
    os.makedirs(os.path.join(dst, "config"))
    t = os.path.join(ROOT, "templates")
    for src, out in [("service-readme.md", "README.md"), ("docker-compose.yml", "docker-compose.yml"),
                     ("env.example", ".env.example")]:
        text = open(os.path.join(t, src)).read().replace("<name>", a.name).replace("<nas-port>", str(a.port))
        open(os.path.join(dst, out), "w").write(text)
    open(os.path.join(dst, "config", ".gitkeep"), "w").close()
    inv = os.path.join(ROOT, "inventory/services.yaml")
    with open(inv, "a") as fh:
        fh.write(f"""  - name: {a.name}
    kind: docker-compose
    deploy_method: ugos-docker-project
    project_dir: /volume1/docker/{a.name}
    state: planned
    containers:
      - name: {a.name}
        image: TO_BE_VERIFIED
        ports: ["{a.port}"]
    last_verified: null
    status_of_facts: EXAMPLE
""")
    print(f"created services/{a.name}/ and an inventory stub; fill both, then `make check`")

if __name__ == "__main__":
    main()
