# Flately Future Plan

Last updated: 2026-04-14

Scope reviewed: backend/src, frontend/src, backend/prisma/schema.prisma, production build/start path

## 1) Confirmed Bug Backlog (Prioritized)

| ID | Severity | Issue | Evidence | Planned Action |
| --- | --- | --- | --- | --- |
| FP-001 | Critical | Socket CORS is open to any origin | backend/src/server.ts (`origin: '*'`) vs backend/src/app.ts strict allowlist | Reuse REST allowlist in Socket.IO CORS and block non-allowlisted origins |
| FP-002 | Critical | Socket chat events are unauthenticated and trust client senderId | backend/src/modules/chat/chat.socket.ts, backend/src/modules/chat/chat.service.ts | Add socket JWT handshake middleware, derive senderId from token, enforce room membership checks |
| FP-003 | Critical | Production backend startup fails after build | Runtime smoke check: `node dist/server.js` throws `ERR_MODULE_NOT_FOUND` for `dist/app` | Choose one module strategy: full ESM with `.js` imports or full CJS build/runtime compatibility |
| FP-004 | High | Matching service loads all preference rows | backend/src/modules/matching/matching.service.ts candidate preference query uses unfiltered `findMany()` | Filter preference query to candidate user IDs only |
| FP-005 | High | Missing explicit relational ownership/cascade rules in schema | backend/prisma/schema.prisma models with raw ObjectId links but limited explicit relation ownership semantics | Add explicit relation fields and onDelete behavior; run migration with integrity checks |
| FP-006 | High | Socket send handler lacks error boundary | backend/src/modules/chat/chat.socket.ts `handleSendMessage` has no try/catch | Wrap handler, emit send-failed event payload on errors |
| FP-007 | Medium | Access token stored in localStorage | frontend/src/features/auth/auth.storage.ts | Move to HttpOnly cookie session model; add CSP hardening |
| FP-008 | Medium | Unauthorized auto-logout trigger is one-shot per provider mount | frontend/src/services/api.ts and frontend/src/features/auth/AuthProvider.tsx | Add explicit reset on successful auth/session set or remove global one-shot behavior |

### Notes for FP-001

- Why it matters: REST and Socket security boundaries are currently inconsistent.
- Acceptance: non-allowlisted origin cannot establish socket connection.

### Notes for FP-002

- Why it matters: sender spoofing and unauthorized room activity are possible when identity is client-supplied.
- Acceptance: spoofed senderId and unauthorized room actions are rejected.

### Notes for FP-003

- Why it matters: release artifact cannot run in production mode.
- Acceptance: `npm run build` and `npm run start:prod` both succeed from clean dist.

## 2) System Design Improvements (Apply Now vs Future)

## Apply now (high ROI, low migration risk)

| ID | Pattern/Principle | Target | Expected Benefit |
| --- | --- | --- | --- |
| SD-001 | Policy-based middleware + Adapter boundary | backend/src/server.ts, backend/src/modules/chat/chat.socket.ts | Consistent auth/authz across REST and WebSocket |
| SD-002 | Repository-style query boundary + projection discipline | backend/src/modules/matching/matching.service.ts, backend/src/modules/discovery/discovery.service.ts | Lower DB load and predictable scaling |
| SD-003 | Exception Translator + typed domain error taxonomy | backend/src/middlewares/controller-chain.middleware.ts and services/controllers | Stable API error contracts and better observability |
| SD-004 | Explicit runtime module contract (ESM or CJS) | backend/package.json, backend/tsconfig.json, backend/src imports | Reliable production packaging/startup |

## Near-term (medium migration effort)

| ID | Pattern/Principle | Target | Expected Benefit |
| --- | --- | --- | --- |
| SD-005 | Aggregate ownership and invariant enforcement | backend/prisma/schema.prisma + migrations | Prevent orphan records and ambiguous ownership behavior |
| SD-006 | Secure session boundary + token lifecycle management | frontend auth storage + backend auth middleware/controllers | Stronger browser security posture |
| SD-007 | Transactional outbox/event relay | backend/src/modules/chat | Reliable message/event propagation and replay support |

## Longer-term (architectural evolution)

| ID | Pattern/Principle | Target | Expected Benefit |
| --- | --- | --- | --- |
| SD-008 | Explicit state machine for swipe -> match -> conversation lifecycle | backend/src/modules/discovery, matches, chat | Stronger domain invariants and safer feature growth |
| SD-009 | CQRS-lite read model for discovery feed | matching/discovery pipeline | Lower latency and simpler high-scale ranking reads |

## 3) Execution Plan

## Phase 1 (this sprint)

1. Fix FP-001, FP-002, FP-003, FP-004, FP-006.
2. Add regression tests for socket auth/send and matching preference-query behavior.
3. Validate with:
   - backend: `npm run build`, `npm run start:prod`, `npm run test`
   - frontend: targeted auth and chat flow verification

## Phase 2 (next sprint)

1. Implement FP-005 and FP-008.
2. Start SD-003 and SD-005 rollout with migration and compatibility checks.
3. Add migration and rollback notes in docs.

## Phase 3 (hardening)

1. Implement FP-007 and SD-006.
2. Design SD-007 and SD-008 RFCs before implementation.

## 4) Success Metrics

## Security

- Socket connections and events are fully authenticated and authorized.
- No wildcard socket origins in production configuration.

## Reliability

- Production backend startup works from clean build artifacts.
- Chat send failures are visible and recoverable by clients.

## Performance

- Matching query load scales with candidate set size, not full preference table size.

## Data integrity

- Referential ownership is explicit and migration-verified.

## Maintainability

- Runtime module strategy is consistent.
- Domain error contracts are typed and standardized.
