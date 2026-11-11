#!/usr/bin/env python3
"""Repository checks: required files, internal links, inventory consistency,
secret scan. Run `python3 scripts/check_docs.py` (or `make check`). No network."""
import os, re, sys, glob
import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
errors, warnings = [], []

REQUIRED = [
    "README.md", "AGENTS.md", "CONTRIBUTING.md", "CHANGELOG.md", ".gitignore",
    "inventory/services.yaml", "architecture/overview.md", "domains/domain-inventory.md",
    "domains/add-new-subdomain.md", "backups/backup-strategy.md",
    "runbooks/deploy-new-service.md", "templates/service-readme.md",
]
for f in REQUIRED:
    if not os.path.exists(f):
        errors.append(f"missing required file: {f}")

md_files = [f for f in glob.glob("**/*.md", recursive=True) if not f.startswith(("reports/", ".git/"))]

# 1. internal links
link_re = re.compile(r"\]\(([^)\s]+)\)")
for f in md_files:
    if f.startswith(("templates/", "services/_template/")):
        continue  # template links are relative to where the file gets copied
    text = open(f, encoding="utf-8").read()
    text = re.sub(r"```.*?```", "", text, flags=re.S)
    for target in link_re.findall(text):
        if re.match(r"^(https?:|mailto:|#)", target):
            continue
        path = target.split("#")[0]
        if not path:
            continue
        full = os.path.normpath(os.path.join(os.path.dirname(f), path))
        if not os.path.exists(full):
            errors.append(f"{f}: broken link -> {target}")

# 2. inventory <-> services folders
inv = yaml.safe_load(open("inventory/services.yaml"))
inv_keys = {s["name"] for s in (inv.get("services") or [])}
folders = {os.path.basename(p) for p in glob.glob("services/*") if os.path.isdir(p)
           and not os.path.basename(p).startswith("_")}
for k in sorted(inv_keys - folders):
    errors.append(f"inventory/services.yaml has '{k}' but services/{k}/ is missing")
for k in sorted(folders - inv_keys):
    errors.append(f"services/{k}/ exists but is not in inventory/services.yaml")
for k in sorted(folders):
    if not os.path.exists(f"services/{k}/README.md"):
        errors.append(f"services/{k}/README.md missing")
    comp = f"services/{k}/docker-compose.yml"
    if os.path.exists(comp):
        text = open(comp).read()
        for var in sorted(set(re.findall(r"\$\{([A-Z0-9_]+)", text))):
            ex = f"services/{k}/.env.example"
            if not os.path.exists(ex) or not re.search(rf"^{var}=", open(ex).read(), re.M):
                errors.append(f"{comp} uses ${{{var}}} but it is not in {ex}")

# 3. secret scan (all tracked-looking text files)
SECRET_PATTERNS = [
    (r"-----BEGIN [A-Z ]*PRIVATE KEY-----", "private key"),
    (r"\beyJ[A-Za-z0-9_-]{30,}", "JWT / Cloudflare tunnel token"),
    (r"\bghp_[A-Za-z0-9]{30,}|\bgithub_pat_[A-Za-z0-9_]{30,}", "GitHub token"),
    (r"\bAKIA[0-9A-Z]{16}\b", "AWS key"),
    (r"\bxox[baprs]-[A-Za-z0-9-]{10,}", "Slack token"),
    (r"(?i)(password|passwd|secret|token|api[_-]?key)\s*[:=]\s*['\"]?(?!\$\{|ChangeMe|ChangeThis|<|\*|&|$)[^\s'\"#]{8,}", "credential assignment"),
    (r"postgres(?:ql)?://[^:\s]+:(?!\$\{)[^@\s]{4,}@", "DB URL with password"),
]
skip_dirs = (".git/", "reports/")
for f in glob.glob("**/*", recursive=True) + glob.glob("**/.*", recursive=True):
    if os.path.isdir(f) or f.startswith(skip_dirs) or f.endswith((".png", ".jpg", ".zip")):
        continue
    if f == "scripts/check_docs.py":
        continue
    try:
        text = open(f, encoding="utf-8").read()
    except (UnicodeDecodeError, OSError):
        continue
    for pat, label in SECRET_PATTERNS:
        for m in re.finditer(pat, text):
            line = text.count("\n", 0, m.start()) + 1
            errors.append(f"{f}:{line}: possible {label}")
    if os.path.basename(f) == ".env":
        errors.append(f"{f}: real .env file must not be committed")

# 4. soft checks
for f in md_files:
    if re.fullmatch(r"services/[a-z0-9-]+/README\.md", f):
        if "Last verified" not in open(f).read():
            warnings.append(f"{f}: no 'Last verified' line")

for w in warnings:
    print("warn ", w)
for e in errors:
    print("ERROR", e)
print(f"{len(md_files)} markdown files checked, {len(errors)} errors, {len(warnings)} warnings")
sys.exit(1 if errors else 0)
