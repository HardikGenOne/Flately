# Historical Archive Guide

Last updated: 2026-04-12

## Purpose

This document defines how to treat historical documentation in this repository.

Use it to prevent implementation work from following legacy snapshots (for example Auth0-era or JS-era paths) that are no longer part of runtime behavior.

## Authoritative Runtime Docs (Use These First)

- [project-setup.md](./project-setup.md)
- [product-user-flow.md](./product-user-flow.md)
- [frontend-guide.md](./frontend-guide.md)
- [backend-code-reference.md](./backend-code-reference.md)
- [api-reference.md](./api-reference.md)
- [manual-auth-end-to-end-verification.md](./manual-auth-end-to-end-verification.md)
- [architecture.md](./architecture.md)

## Archival Docs (Read as Historical Context Only)

- [../FLATELY_COMPLETE_DOCUMENTATION.md](../FLATELY_COMPLETE_DOCUMENTATION.md)
- [../TYPESCRIPT_MIGRATION_GUIDE.md](../TYPESCRIPT_MIGRATION_GUIDE.md)
- [../PATTERN_AUDIT.md](../PATTERN_AUDIT.md)
- [frontend-rebuild-status-2026-04-05.md](./frontend-rebuild-status-2026-04-05.md)
- [pre-documentation/phase1-env-config-spec.md](./pre-documentation/phase1-env-config-spec.md)
- [pre-documentation/phase1-validation-gates.md](./pre-documentation/phase1-validation-gates.md)
- [pre-documentation/worklog.md](./pre-documentation/worklog.md)

## Legacy-to-Current Mapping

- Runtime auth system:
  - Legacy term: Auth0-based flow
  - Current: JWT + backend-managed Google OAuth + email/password

- Backend auth middleware:
  - Legacy path: backend/src/middlewares/auth0.middleware.ts (or .js)
  - Current path: backend/src/middlewares/jwt.middleware.ts

- Frontend local origin:
  - Legacy examples often show 5173
  - Current default dev origin: http://localhost:5174

## Usage Rules

1. Treat archival docs as implementation history, not execution instructions.
2. If archival content conflicts with runtime docs, follow runtime docs.
3. When referencing historical decisions in PRs, include one runtime doc link and one archival doc link.
4. If a runtime change is made, update runtime docs first; update archival docs only if needed for historical clarity.

## Diagram Review Note

For diagram content verification, prefer source Mermaid files and generated PNG previews for visual checks. SVG files are useful for structural XML inspection but can be noisy for semantic review.
