# Design Pattern Application Report

## 1. Executive Summary

### Pattern Audit Report

| Field | Value |
|---|---|
| Project | Flately |
| Date | 2026-04-04 |
| Auditor | GitHub Copilot (GPT-5.3-Codex) |
| Stack | TypeScript full-stack: Express + Prisma + Socket.IO backend, React + Redux + Auth0 frontend |

### System Summary

Backend routes are modular and mounted in one app entrypoint with Socket.IO on the same server: [backend/src/app.ts#L36](backend/src/app.ts#L36), [backend/src/app.ts#L41](backend/src/app.ts#L41), [backend/src/server.ts#L15](backend/src/server.ts#L15). Core complexity is concentrated in matching, discovery, and chat orchestration: [backend/src/modules/matching/matching.service.ts#L69](backend/src/modules/matching/matching.service.ts#L69), [backend/src/modules/discovery/discovery.service.ts#L33](backend/src/modules/discovery/discovery.service.ts#L33), [backend/src/modules/chat/chat.controller.ts#L22](backend/src/modules/chat/chat.controller.ts#L22).

Frontend pages call transport endpoints/events directly and already show contract drift: [frontend/frontend/src/features/discovery/DiscoveryPage.tsx#L22](frontend/frontend/src/features/discovery/DiscoveryPage.tsx#L22), [frontend/frontend/src/features/discovery/DiscoveryPage.tsx#L30](frontend/frontend/src/features/discovery/DiscoveryPage.tsx#L30), [backend/src/modules/discovery/discovery.routes.ts#L7](backend/src/modules/discovery/discovery.routes.ts#L7), [backend/src/modules/matches/matches.routes.ts#L7](backend/src/modules/matches/matches.routes.ts#L7).

## 2. Current Architecture Snapshot

| Layer | Snapshot | Evidence |
|---|---|---|
| Backend routing | Route modules with auth middleware per endpoint | [backend/src/modules/profiles/profiles.routes.ts#L7](backend/src/modules/profiles/profiles.routes.ts#L7), [backend/src/modules/preferences/preferences.routes.ts#L8](backend/src/modules/preferences/preferences.routes.ts#L8) |
| Backend services | Direct Prisma with repeated create-or-update flow | [backend/src/modules/profiles/profiles.service.ts#L12](backend/src/modules/profiles/profiles.service.ts#L12), [backend/src/modules/preferences/preferences.service.ts#L51](backend/src/modules/preferences/preferences.service.ts#L51), [backend/src/modules/users.service.ts#L10](backend/src/modules/users.service.ts#L10) |
| Matching domain | Eligibility, scoring, type coercion, ranking in one service | [backend/src/modules/matching/matching.service.ts#L85](backend/src/modules/matching/matching.service.ts#L85), [backend/src/modules/matching/matching.service.ts#L92](backend/src/modules/matching/matching.service.ts#L92), [backend/src/modules/matching/matching.service.ts#L106](backend/src/modules/matching/matching.service.ts#L106) |
| Socket contract | Duplicate camelCase and snake_case event names | [backend/src/types/socket.ts#L9](backend/src/types/socket.ts#L9), [backend/src/types/socket.ts#L12](backend/src/types/socket.ts#L12) |
| Frontend config | Hardcoded host/audience values | [frontend/frontend/src/services/api.ts#L24](frontend/frontend/src/services/api.ts#L24), [frontend/frontend/src/features/chat/socket.ts#L4](frontend/frontend/src/features/chat/socket.ts#L4), [frontend/frontend/src/main.tsx#L24](frontend/frontend/src/main.tsx#L24) |

## 3. Critical Hotspots (Ranked)

| Rank | ID | Hotspot | Business Impact | Technical Risk | Refactor Class | Evidence |
|---|---|---|---|---|---|---|
| 1 | PA-001 | Contract drift across REST and sockets | Broken discovery/connect/chat paths | High | Quick win | [frontend/frontend/src/features/discovery/DiscoveryPage.tsx#L22](frontend/frontend/src/features/discovery/DiscoveryPage.tsx#L22), [backend/src/modules/discovery/discovery.routes.ts#L7](backend/src/modules/discovery/discovery.routes.ts#L7), [frontend/frontend/src/features/discovery/DiscoveryPage.tsx#L30](frontend/frontend/src/features/discovery/DiscoveryPage.tsx#L30), [backend/src/modules/matches/matches.routes.ts#L7](backend/src/modules/matches/matches.routes.ts#L7) |
| 2 | PA-002 | Matching service mixes concerns and unsafe casts | Wrong ranking and brittle changes | High | Deep refactor | [backend/src/modules/matching/matching.service.ts#L92](backend/src/modules/matching/matching.service.ts#L92), [backend/src/modules/matching/matching.service.ts#L106](backend/src/modules/matching/matching.service.ts#L106), [backend/src/modules/matching/matching.service.ts#L85](backend/src/modules/matching/matching.service.ts#L85) |
| 3 | PA-003 | Repeated auth/error checks in controllers | Inconsistent API responses | Medium-High | Medium refactor | [backend/src/modules/profiles/profiles.controller.ts#L7](backend/src/modules/profiles/profiles.controller.ts#L7), [backend/src/modules/preferences/preferences.controller.ts#L7](backend/src/modules/preferences/preferences.controller.ts#L7), [backend/src/modules/matches/matches.controller.ts#L7](backend/src/modules/matches/matches.controller.ts#L7) |
| 4 | PA-004 | Duplicate create-or-update lifecycle | Service drift and duplicated fixes | Medium | Medium refactor | [backend/src/modules/profiles/profiles.service.ts#L12](backend/src/modules/profiles/profiles.service.ts#L12), [backend/src/modules/preferences/preferences.service.ts#L51](backend/src/modules/preferences/preferences.service.ts#L51) |
| 5 | PA-005 | Per-record enrichment query pattern | Latency growth with volume | Medium | Medium refactor | [backend/src/modules/discovery/discovery.service.ts#L33](backend/src/modules/discovery/discovery.service.ts#L33), [backend/src/modules/matches/matches.service.ts#L65](backend/src/modules/matches/matches.service.ts#L65) |
| 6 | PA-006 | Hardcoded environment config | Deploy-time regression risk | Medium | Quick win | [frontend/frontend/src/services/api.ts#L24](frontend/frontend/src/services/api.ts#L24), [frontend/frontend/src/features/chat/socket.ts#L4](frontend/frontend/src/features/chat/socket.ts#L4), [frontend/frontend/src/main.tsx#L24](frontend/frontend/src/main.tsx#L24) |

### SOLID Violations table

| Principle | Evidence | Before | After |
|---|---|---|---|
| SRP | [backend/src/modules/matching/matching.service.ts#L69](backend/src/modules/matching/matching.service.ts#L69) | Retrieval + rules + scoring in one unit | Separate orchestrator and strategies |
| OCP | [backend/src/modules/discovery/discovery.controller.ts#L5](backend/src/modules/discovery/discovery.controller.ts#L5) | New action types require branch edits | Add pluggable action handling |
| LSP | [backend/src/modules/matching/matching.service.ts#L92](backend/src/modules/matching/matching.service.ts#L92) | Unsafe casts mask incompatible shapes | Explicit DTO interfaces |
| ISP | [backend/src/types/socket.ts#L9](backend/src/types/socket.ts#L9), [backend/src/types/socket.ts#L12](backend/src/types/socket.ts#L12) | Duplicate client event contracts | One canonical event interface |
| DIP | [frontend/frontend/src/features/chat/ChatPage.tsx#L80](frontend/frontend/src/features/chat/ChatPage.tsx#L80) | UI depends on concrete endpoints | UI depends on facade abstractions |

## 4. Pattern Recommendations by Hotspot

- Hotspot: PA-001 Contract drift between frontend calls and backend routes/events
- Symptoms:
  - Discovery call path mismatch: [frontend/frontend/src/features/discovery/DiscoveryPage.tsx#L22](frontend/frontend/src/features/discovery/DiscoveryPage.tsx#L22), [backend/src/modules/discovery/discovery.routes.ts#L7](backend/src/modules/discovery/discovery.routes.ts#L7)
  - Connect call points to missing route: [frontend/frontend/src/features/discovery/DiscoveryPage.tsx#L30](frontend/frontend/src/features/discovery/DiscoveryPage.tsx#L30), [backend/src/modules/matches/matches.routes.ts#L7](backend/src/modules/matches/matches.routes.ts#L7)
  - Mixed socket naming vocabulary: [backend/src/types/socket.ts#L9](backend/src/types/socket.ts#L9), [backend/src/types/socket.ts#L12](backend/src/types/socket.ts#L12)
- Candidate Patterns Considered: Facade, Adapter
- Selected Pattern: Facade for feature API boundary, Adapter for event naming translation
- Why This Pattern Wins: Centralizes contract mapping and isolates transport churn from pages
- SOLID Impact (Before -> After): SRP improves in pages; OCP improves for new contract versions; DIP improves by moving endpoint literals behind interfaces
- Trade-offs and Risks: More indirection and versioning overhead. What NOT to do: avoid one mega-facade for the whole app.
- Implementation Notes: Create DiscoveryFacade, MatchesFacade, ChatFacade and a SocketEventAdapter
- Estimated Effort: 1-2 days

- Hotspot: PA-002 Matching engine mixed responsibilities and unsafe casts
- Symptoms:
  - Unsafe casts used in core matching path: [backend/src/modules/matching/matching.service.ts#L92](backend/src/modules/matching/matching.service.ts#L92), [backend/src/modules/matching/matching.service.ts#L106](backend/src/modules/matching/matching.service.ts#L106)
  - Linear lookup in loop: [backend/src/modules/matching/matching.service.ts#L85](backend/src/modules/matching/matching.service.ts#L85)
  - Stringly-typed error coupling: [backend/src/modules/matching/matching.service.ts#L73](backend/src/modules/matching/matching.service.ts#L73), [backend/src/modules/matching/matching.controller.ts#L16](backend/src/modules/matching/matching.controller.ts#L16)
- Candidate Patterns Considered: Strategy, Template Method
- Selected Pattern: Strategy for eligibility and scoring rules
- Why This Pattern Wins: Makes rule evolution independent and testable without changing orchestration
- SOLID Impact (Before -> After): SRP and OCP improve strongly; LSP improves through explicit strategy interfaces
- Trade-offs and Risks: More classes and test matrix growth. What NOT to do: avoid replacing one long function with one long strategy selector.
- Implementation Notes: Introduce CandidateMapper, EligibilityStrategy, ScoringStrategy, MatchRankingService
- Estimated Effort: 3-5 days

- Hotspot: PA-003 Repeated auth and error logic in controllers
- Symptoms:
  - Unauthorized checks repeated across modules: [backend/src/modules/profiles/profiles.controller.ts#L7](backend/src/modules/profiles/profiles.controller.ts#L7), [backend/src/modules/preferences/preferences.controller.ts#L7](backend/src/modules/preferences/preferences.controller.ts#L7), [backend/src/modules/discovery/discovery.controller.ts#L12](backend/src/modules/discovery/discovery.controller.ts#L12)
  - Inconsistent error body styles: [backend/src/modules/users.controllers.ts#L10](backend/src/modules/users.controllers.ts#L10), [backend/src/modules/preferences/preferences.controller.ts#L32](backend/src/modules/preferences/preferences.controller.ts#L32)
- Candidate Patterns Considered: Chain of Responsibility, Template Method
- Selected Pattern: Chain of Responsibility using explicit middleware stages
- Why This Pattern Wins: Fits Express execution model and removes duplicated precondition/error code
- SOLID Impact (Before -> After): SRP and ISP improve in controllers; OCP improves for adding cross-cutting behaviors
- Trade-offs and Risks: Middleware ordering errors can introduce subtle bugs. What NOT to do: do not bury business decisions in generic middleware.
- Implementation Notes: Add requireAuthenticatedUser and domainErrorToHttp middleware, then simplify controllers
- Estimated Effort: 2-3 days

- Hotspot: PA-004 Duplicate create-or-update lifecycle in services
- Symptoms:
  - Profile create-or-update branch: [backend/src/modules/profiles/profiles.service.ts#L12](backend/src/modules/profiles/profiles.service.ts#L12)
  - Preference create-or-update branch: [backend/src/modules/preferences/preferences.service.ts#L51](backend/src/modules/preferences/preferences.service.ts#L51)
  - User get-or-create branch: [backend/src/modules/users.service.ts#L10](backend/src/modules/users.service.ts#L10)
- Candidate Patterns Considered: Template Method, Factory Method
- Selected Pattern: Template Method with mapping hooks (Factory Method style extension points)
- Why This Pattern Wins: Reuses the stable lifecycle while keeping entity-specific mapping isolated
- SOLID Impact (Before -> After): SRP improves by extracting lifecycle orchestration; OCP improves for adding new entity flows
- Trade-offs and Risks: Over-inheritance can reduce clarity. What NOT to do: do not move all Prisma logic into one base class.
- Implementation Notes: Introduce abstract UpsertByUserIdService and keep model mapping in concrete services
- Estimated Effort: 2-3 days

- Hotspot: PA-005 Feed and match enrichment query fan-out
- Symptoms:
  - Discovery enriches profiles/preferences inside Promise.all loop: [backend/src/modules/discovery/discovery.service.ts#L33](backend/src/modules/discovery/discovery.service.ts#L33), [backend/src/modules/discovery/discovery.service.ts#L35](backend/src/modules/discovery/discovery.service.ts#L35)
  - Matches does per-record profile/preference/conversation lookup: [backend/src/modules/matches/matches.service.ts#L65](backend/src/modules/matches/matches.service.ts#L65), [backend/src/modules/matches/matches.service.ts#L68](backend/src/modules/matches/matches.service.ts#L68), [backend/src/modules/matches/matches.service.ts#L77](backend/src/modules/matches/matches.service.ts#L77)
  - Tag generation duplicated across modules: [backend/src/modules/discovery/discovery.service.ts#L68](backend/src/modules/discovery/discovery.service.ts#L68), [backend/src/modules/matches/matches.service.ts#L45](backend/src/modules/matches/matches.service.ts#L45)
- Candidate Patterns Considered: Facade, Builder
- Selected Pattern: Facade for feed assembly with Builder for response DTO construction
- Why This Pattern Wins: Enables batched loading and one shared output composition path
- SOLID Impact (Before -> After): SRP and DIP improve by separating query orchestration from presentation assembly
- Trade-offs and Risks: More abstraction and potential memory overhead. What NOT to do: do not centralize all business rules in one giant facade.
- Implementation Notes: Add MatchFeedFacade, TagBuilder, and query-count tests
- Estimated Effort: 3-4 days

- Hotspot: PA-006 Hardcoded environment wiring in frontend
- Symptoms:
  - API host hardcoded: [frontend/frontend/src/services/api.ts#L24](frontend/frontend/src/services/api.ts#L24)
  - Socket host hardcoded: [frontend/frontend/src/features/chat/socket.ts#L4](frontend/frontend/src/features/chat/socket.ts#L4)
  - Auth audience hardcoded: [frontend/frontend/src/main.tsx#L24](frontend/frontend/src/main.tsx#L24)
- Candidate Patterns Considered: Abstract Factory, Singleton
- Selected Pattern: Abstract Factory for environment-specific client families
- Why This Pattern Wins: Keeps ApiClient, SocketClient, and Auth settings consistent per environment
- SOLID Impact (Before -> After): DIP and OCP improve by removing concrete environment dependencies from feature code
- Trade-offs and Risks: Added bootstrap complexity. What NOT to do: do not introduce mutable global singleton config.
- Implementation Notes: Create EnvironmentClientFactory in composition root and inject into facades
- Estimated Effort: 1-2 days

## 5. Refactor Roadmap (Phase 1/2/3)

### Recommended Execution Order

1. Phase 1
   - Implement PA-001 and PA-006
   - Add compatibility adapters for old/new endpoint and event names
   - Checkpoint: Discovery, matches, and chat happy paths are green

2. Phase 2
   - Implement PA-003 and PA-004
   - Standardize auth preconditions and domain error mapping
   - Checkpoint: 401/403/5xx payloads are consistent across controllers

3. Phase 3
   - Implement PA-002 and PA-005
   - Replace unsafe casts and split matching into strategies
   - Checkpoint: ranking regression suite and performance budgets pass

## 6. Validation Plan (tests, observability, regression gates)

1. Contract tests
   - REST contract parity tests between frontend facades and backend routes
   - Socket contract tests for canonical event names and payload schemas

2. Unit tests
   - Eligibility and scoring strategy test matrix
   - Template upsert lifecycle tests for create/update branches

3. Integration tests
   - Discovery feed -> swipe -> match -> chat open path
   - Unauthorized and forbidden path consistency checks

4. Observability and performance gates
   - Query-count assertions for discovery and matches feeds
   - p95 latency budget checks on feed endpoints
   - Typed error taxonomy replacing string checks such as [backend/src/modules/preferences/preferences.service.ts#L46](backend/src/modules/preferences/preferences.service.ts#L46) and [backend/src/modules/matching/matching.service.ts#L73](backend/src/modules/matching/matching.service.ts#L73)

## 7. Team Execution Checklist

### Scope Menu for Implementation IDs

| ID | Scope | Primary Files | Pattern | Size |
|---|---|---|---|---|
| PA-001 | Contract boundary alignment | [frontend/frontend/src/features/discovery/DiscoveryPage.tsx#L22](frontend/frontend/src/features/discovery/DiscoveryPage.tsx#L22), [backend/src/modules/discovery/discovery.routes.ts#L7](backend/src/modules/discovery/discovery.routes.ts#L7), [backend/src/types/socket.ts#L9](backend/src/types/socket.ts#L9) | Facade + Adapter | Quick |
| PA-002 | Matching core | [backend/src/modules/matching/matching.service.ts#L69](backend/src/modules/matching/matching.service.ts#L69) | Strategy | Deep |
| PA-003 | Controller cross-cutting concerns | [backend/src/modules/profiles/profiles.controller.ts#L7](backend/src/modules/profiles/profiles.controller.ts#L7), [backend/src/modules/preferences/preferences.controller.ts#L7](backend/src/modules/preferences/preferences.controller.ts#L7) | Chain of Responsibility | Medium |
| PA-004 | Persistence lifecycle reuse | [backend/src/modules/profiles/profiles.service.ts#L12](backend/src/modules/profiles/profiles.service.ts#L12), [backend/src/modules/preferences/preferences.service.ts#L51](backend/src/modules/preferences/preferences.service.ts#L51) | Template Method | Medium |
| PA-005 | Feed assembly and enrichment | [backend/src/modules/discovery/discovery.service.ts#L33](backend/src/modules/discovery/discovery.service.ts#L33), [backend/src/modules/matches/matches.service.ts#L65](backend/src/modules/matches/matches.service.ts#L65) | Facade + Builder | Medium |
| PA-006 | Environment client wiring | [frontend/frontend/src/services/api.ts#L24](frontend/frontend/src/services/api.ts#L24), [frontend/frontend/src/features/chat/socket.ts#L4](frontend/frontend/src/features/chat/socket.ts#L4), [frontend/frontend/src/main.tsx#L24](frontend/frontend/src/main.tsx#L24) | Abstract Factory | Quick |

Checklist:
- Assign owner and reviewer per ID
- Define rollback switch before merge for each phase
- Keep compatibility adapters time-boxed and tracked
- Gate merge on typecheck, lint, and tests

## 8. Open Questions and Assumptions

Open questions:
1. Should discovery canonical path remain /discovery/feed or also support /discovery for compatibility?
2. Can socket events be standardized to one naming style, or must both stay supported?
3. Should the current fixed compatibility score in matches stay static: [backend/src/modules/matches/matches.service.ts#L106](backend/src/modules/matches/matches.service.ts#L106)?
4. Is permissive Socket.IO CORS intentional outside local dev: [backend/src/server.ts#L11](backend/src/server.ts#L11)?

Assumptions:
1. External behavior must remain backward-compatible during rollout.
2. Prisma schema is the persistence source of truth.
3. Incremental migration is preferred over a single cutover.

### Patterns Evaluated But NOT Recommended

| Pattern | Why Not Recommended |
|---|---|
| Singleton | Acceptable for lazy Prisma client boundary only; broad singleton use would increase hidden global state: [backend/src/config/prisma.ts#L3](backend/src/config/prisma.ts#L3), [backend/src/config/prisma.ts#L15](backend/src/config/prisma.ts#L15) |
| Visitor | Not a fit because the domain is not a stable object hierarchy with frequent operation additions |
| Composite | No core tree abstraction requiring uniform leaf/composite traversal |
| Flyweight | Current risk is contract and query behavior, not memory footprint |
| Bridge | Current change axis is rules/contracts rather than parallel inheritance hierarchies |

### Glossary

| Term | Meaning |
|---|---|
| Contract drift | Frontend and backend disagree on endpoint/event semantics |
| Compatibility adapter | Temporary translator for old/new contracts during migration |
| Strategy family | Interchangeable algorithms under one interface |
| Assembly facade | Use-case orchestration layer for loading and shaping response data |
| Upsert lifecycle template | Shared create/update algorithm with entity-specific hooks |
