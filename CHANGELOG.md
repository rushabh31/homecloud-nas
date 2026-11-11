# Changelog

Newest first. Infrastructure changes and documentation baselines.

## 2026-11-11
- **Baseline**: repository created from a read-only review of the NAS (UGOS UI),
  Immich API and UniFi topology page. No shell access used.
- **immich**: deployed as UGREEN Docker project `immich` (v3 images) at
  `/volume1/docker/immich`; port 2283. First deploy failed on a ghcr.io pull
  rate limit, redeploy succeeded.
- **immich**: Immich accounts created by the owner (3 users). External libraries
  added for Rushabh, user2 and user3 Photos folders; scanned (about 31,000 files).
- **immich**: photo folder mounts changed from read-only to read-write at the
  owner's request (edits/deletes in Immich change real files; 30-day trash).
- **repo**: knowledge base structure added: architecture, per-service folders,
  networking, domains, storage, backups, runbooks, templates, discovery/drift/
  validation scripts and GitHub checks. No NAS service was changed.
