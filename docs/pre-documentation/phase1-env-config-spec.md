# Phase 1 Environment Config Spec

> STATUS: Historical artifact. Phase 1 completed.
> Current source of truth: [../project-setup.md](../project-setup.md), [../frontend-guide.md](../frontend-guide.md), [../architecture.md](../architecture.md).
> Archive boundary guide: [../historical-archive.md](../historical-archive.md).

Date: 2026-04-04
Scope: PA-006 only (completed)

## Objective

Define one frontend environment configuration contract for API, socket, and Auth0 wiring so runtime settings are environment-driven and not hardcoded in source.

## Completed State

- API base URL is runtime-config driven (`runtimeConfig.apiBaseUrl`).
- Socket URL is runtime-config driven (`runtimeConfig.socketUrl`).
- Auth0 domain/client/audience are runtime-config driven.
- Frontend setup now documents `.env.example` variables for local and deployment environments.

## Required Frontend Environment Variables

- `VITE_API_BASE_URL`
- `VITE_SOCKET_URL`
- `VITE_AUTH0_DOMAIN`
- `VITE_AUTH0_CLIENT_ID`
- `VITE_AUTH0_AUDIENCE`

## Contract Rules (Retained)

- No transport or Auth0 host/audience literals in frontend runtime wiring.
- Development, staging, and production are switchable by environment values only.
- Variable names remain stable for CI/CD and local setup.

## Completion Summary

- Environment variable contract is published in canonical docs.
- RuntimeConfig now acts as the single frontend config boundary.
