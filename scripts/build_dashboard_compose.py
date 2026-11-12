import re, sys, os
PRELUDE = sys.argv[2] if len(sys.argv) > 2 else 'window.PHC_LAT = 0.00; window.PHC_LON = 0.00; window.PHC_PLACE = "Local weather"; /* set to your own town, two decimals is enough */'
d = sys.argv[1]
src = open(os.path.join(d, 'docker-compose.yml')).read()
def block(name):
    m = re.search(r"cat > /app/config/%s <<'PHC_EOF'\n(.*?)\n        PHC_EOF\n" % re.escape(name), src, re.S)
    return [l[8:] if l.startswith('        ') else l for l in m.group(1).split('\n')]
def ind(lines, n=8):
    return '\n'.join((' ' * n + l) if l.strip() else '' for l in lines)
css = open(os.path.join(d, 'config/custom.css')).read().rstrip('\n').split('\n')
js = open(os.path.join(d, 'config/custom.js')).read().rstrip('\n').split('\n')
parts = []
for fname in ['settings.yaml', 'widgets.yaml', 'services.yaml']:
    parts.append("cat > /app/config/%s <<'PHC_EOF'\n%s\nPHC_EOF" % (fname, '\n'.join(block(fname))))
parts.append("printf '[]\\n' > /app/config/bookmarks.yaml\nprintf '{}\\n' > /app/config/docker.yaml")
parts.append("cat > /app/config/custom.css <<'PHC_EOF'\n%s\nPHC_EOF" % '\n'.join(css))
import gzip, base64, textwrap
raw = '\n'.join(js).encode() + b'\n'
b64 = base64.b64encode(gzip.compress(raw, 9, mtime=0)).decode()
parts.append("cat > /app/config/custom.js <<'PHC_EOF'\n" + PRELUDE + "\nPHC_EOF")
parts.append("# The rest of custom.js (the animated village) is stored gzip+base64 to stay under the 128 KB start-command limit.")
parts.append("# Edit services/dashboard/config/custom.js in the repo and rebuild this file with scripts/build_dashboard_compose.py.")
parts.append("node -e \"let b='';process.stdin.on('data',d=>b+=d).on('end',()=>require('fs').appendFileSync('/app/config/custom.js',require('zlib').gunzipSync(Buffer.from(b,'base64'))))\" <<'PHC_EOF'\n%s\nPHC_EOF" % '\n'.join(textwrap.wrap(b64, 100)))
script = ['set -e', 'mkdir -p /app/config'] + '\n'.join(parts).split('\n') + ['echo "dashboard config written"', 'exec docker-entrypoint.sh node server.js']
header = src[:src.index('services:')]
header = re.sub(r"# This file is the single source of truth.*?No secrets in this file\.\n", 
"""# This file is the single source of truth for the dashboard. On every start the
# container first writes the Homepage config files (tiles, widgets, look and
# the animated nature background) from the text below, then starts Homepage.
# To change a tile: UGOS Docker app > Project > dashboard > Compose
# configuration, edit the YAML below, Redeploy. No secrets in this file.
""", header, flags=re.S)
out = header + """services:
  dashboard:
    container_name: dashboard
    image: ghcr.io/gethomepage/homepage:v2.7.0
    restart: unless-stopped
    ports:
      - '3010:3000'
    environment:
      TZ: America/New_York
      HOMEPAGE_ALLOWED_HOSTS: %s
    volumes:
      - /volume1/docker/dashboard/config:/app/config
    entrypoint:
      - sh
      - -c
      - |
%s
""" % (re.search(r"HOMEPAGE_ALLOWED_HOSTS: (.*)", src).group(1), ind(script))
assert '$' not in out
print(out, end='')
