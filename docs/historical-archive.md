# Historical Archive Guide

Last updated: 2026-05-03

## Purpose

This document defines how to treat historical documentation in this repository.

Use it to prevent implementation work from following legacy snapshots (for example Auth0-era or JS-era paths) that are no longer part of runtime behavior.

## Authoritative Runtime Docs (Use These First)

- [project-setup.md](./project-setup.md) — Environment setup and dev server
- [product-user-flow.md](./product-user-flow.md) — User journey and feature map
- [frontend-guide.md](./frontend-guide.md) — Frontend architecture and routing
- [backend-code-reference.md](./backend-code-reference.md) — Backend module reference
- [api-reference.md](./api-reference.md) — REST and Socket.IO API contracts
- [manual-auth-end-to-end-verification.md](./manual-auth-end-to-end-verification.md) — Auth flow testing
- [architecture.md](./architecture.md) — System architecture overview
- [UML_DIAGRAMS.md](./UML_DIAGRAMS.md) — All UML diagrams with PNG previews
- [database-schema.md](./database-schema.md) — Prisma schema documentation
- [matching-algorithm.md](./matching-algorithm.md) — Matching engine logic
- [future-plan.md](./future-plan.md) — Roadmap and planned features

## Archival Docs (Read as Historical Context Only)

- [pre-documentation/worklog.md](./pre-documentation/worklog.md) — Original build log
- [pre-documentation/phase1-env-config-spec.md](./pre-documentation/phase1-env-config-spec.md)
- [pre-documentation/phase1-validation-gates.md](./pre-documentation/phase1-validation-gates.md)

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

## Diagram Assets

- **Rendered PNGs**: `docs/svg/*.png` — viewable in any browser, editor, or GitHub
- **Mermaid sources**: `docs/svg/*.mmd` — editable source for regeneration
- **Regenerate**: `npx -y @mermaid-js/mermaid-cli -i <file>.mmd -o <file>.png -b white -s 2`
