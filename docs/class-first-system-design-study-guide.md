# Flately Canonical System Design + SOLID Dossier

## 1. Document Contract

This is the single source-of-truth study document for the current Flately codebase implementation.

This file is intentionally long and evidence-driven because oral exam questions can target:

1. Which classes were created and why.
2. Which design patterns are actually implemented.
3. Which requested patterns are not implemented.
4. Where SOLID is applied in concrete files.
5. What trade-offs were made.

No claim in this document should be interpreted as architecture intent unless it is visible in source code.

## 2. Step-by-Step Context Gathering Method Used

To avoid hallucination, context was gathered in the following order:

1. Loaded all mandatory pattern workflow instructions and pattern skills.
2. Enumerated backend and frontend module files.
3. Read all relevant service/controller/route/transport/middleware files directly.
4. Verified class declarations, singleton wrappers, strategy/template types, and socket events from source.
5. Cross-checked with tests where behavior contracts are asserted.

## 3. System Composition Roots (How the App Is Wired)

### 3.1 Backend runtime composition

- `backend/src/server.ts`:
  - Creates HTTP server from Express app.
  - Creates Socket.IO server.
  - Registers chat socket handlers via `registerChatSocket(io)`.
- `backend/src/app.ts`:
  - Applies security middleware (`helmet`, `cors`, `rateLimit`, `express.json`).
  - Mounts module routers: `/auth`, `/uploads`, `/matching`, `/profiles`, `/discovery`, `/users`, `/matches`, `/chat`, `/preferences`.

### 3.2 Frontend runtime composition

- `frontend/src/main.tsx`:
  - Wraps app with Redux `Provider`, `AuthProvider`, and `AuthBootstrap`.
  - Mounts RouterProvider.
- `frontend/src/app/router.tsx`:
  - Declares all routes including `/auth/callback` -> `GoogleAuthCallbackPage`.
  - Wraps app routes with `ProtectedRoute` as needed.

### 3.3 Canonical class diagram (source-backed)

Canonical source file: `docs/diagrams/01-class-diagram.mmd`

```mermaid
classDiagram
  direction LR

  class AuthController
  class AuthService
  class EmailAuthStrategy {
    <<interface>>
    +execute(credentials)
  }
  class EmailSignUpStrategy
  class EmailSignInStrategy
  class OAuthAuthorizationStrategy {
    <<interface>>
    +getAuthorizationUrl(source, redirectOrigin)
    +completeAuthorization(code, state)
    +consumeExchangeCode(code)
  }
  class GoogleOAuthStrategy
  class DiscoveryController
  class DiscoveryService
  class MatchesController
  class MatchesService
  class MatchingController
  class MatchingService
  class ProfilesController
  class ProfileService
  class PreferencesController
  class PreferencesService
  class ChatController
  class ChatService
  class UploadsController
  class UploadsService
  class UsersController
  class UsersService

  class UpsertByUserIdService {
    <<abstract>>
    +upsert(userId, data)
  }
  class ProfileUpsertService
  class PreferenceUpsertService

  class EligibilityStrategy {
    <<interface>>
    +isEligible(userA, userB)
  }
  class ScoringStrategy {
    <<interface>>
    +calculateScore(prefA, prefB)
  }
  class DefaultEligibilityStrategy
  class DefaultScoringStrategy

  class RequestStrategy {
    <<interface>>
    +send(request)
  }
  class FetchRequestStrategy
  class HttpClientAdapter
  class ApiError

  class AuthTransport
  class DiscoveryTransport
  class MatchesTransport
  class ProfileTransport
  class PreferencesTransport
  class ChatTransport
  class CloudinaryService

  class AuthContinuationStrategy {
    <<interface>>
    +canHandle(context)
    +resolvePath(context)
  }
  class QuestionnaireSourceStrategy
  class SignupDefaultStrategy
  class DefaultAppStrategy

  class PrismaClient {
    <<external>>
  }

  AuthController ..> AuthService : uses auth APIs
  EmailSignUpStrategy ..|> EmailAuthStrategy : implements
  EmailSignInStrategy ..|> EmailAuthStrategy : implements
  GoogleOAuthStrategy ..|> OAuthAuthorizationStrategy : implements
  AuthService o-- EmailAuthStrategy : factory product
  AuthService o-- OAuthAuthorizationStrategy : factory product
  DiscoveryController ..> DiscoveryService : feed and swipe
  MatchesController ..> MatchesService : list matches
  MatchesController ..> DiscoveryService : connect via like
  MatchingController ..> MatchingService : rank endpoint
  ProfilesController ..> ProfileService : profile CRUD
  PreferencesController ..> PreferencesService : preference CRUD
  ChatController ..> ChatService : conversation flow
  UploadsController ..> UploadsService : signature endpoint
  UsersController ..> UsersService : profile bootstrap

  DiscoveryService ..> MatchingService : onboarding and ranking
  DiscoveryService ..> MatchesService : reciprocal match check
  MatchesService ..> MatchingService : compatibility map

  ProfileService *-- ProfileUpsertService : owns
  PreferencesService *-- PreferenceUpsertService : owns
  ProfileUpsertService --|> UpsertByUserIdService : extends template
  PreferenceUpsertService --|> UpsertByUserIdService : extends template

  DefaultEligibilityStrategy ..|> EligibilityStrategy : implements
  DefaultScoringStrategy ..|> ScoringStrategy : implements
  MatchingService o-- EligibilityStrategy : injected policy
  MatchingService o-- ScoringStrategy : injected policy

  FetchRequestStrategy ..|> RequestStrategy : implements
  HttpClientAdapter o-- RequestStrategy : injected transport
  AuthTransport ..> HttpClientAdapter : auth calls
  DiscoveryTransport ..> HttpClientAdapter : discovery calls
  MatchesTransport ..> HttpClientAdapter : matches calls
  ProfileTransport ..> HttpClientAdapter : profile calls
  PreferencesTransport ..> HttpClientAdapter : preference calls
  ChatTransport ..> HttpClientAdapter : chat calls
  CloudinaryService ..> HttpClientAdapter : signed upload config
  HttpClientAdapter ..> ApiError : raises on failures

  QuestionnaireSourceStrategy ..|> AuthContinuationStrategy : implements
  SignupDefaultStrategy ..|> AuthContinuationStrategy : implements
  DefaultAppStrategy ..|> AuthContinuationStrategy : implements

  AuthService ..> PrismaClient : user and oauth persistence
  DiscoveryService ..> PrismaClient : swipes and profile join
  MatchesService ..> PrismaClient : match and conversation join
  MatchingService ..> PrismaClient : profile and preference reads
  ProfileUpsertService ..> PrismaClient : profile upsert
  PreferenceUpsertService ..> PrismaClient : preference upsert
  ChatService ..> PrismaClient : conversation and message persistence
  UsersService ..> PrismaClient : get-or-create user
```

## 4. Class-First Contract Implemented

Every refactored area uses this compatibility-safe shape:

1. `export class X... { ... }` contains the logic.
2. A module singleton is instantiated: `const x = new X...()`.
3. Existing named exports remain and delegate to singleton methods.

This preserves import compatibility for routes and UI code.

## 5. Complete Class Inventory (What Exists Today)

## 5.1 Backend classes

### Auth

- `AuthController` in `backend/src/modules/auth/auth.controller.ts`
- `AuthService` in `backend/src/modules/auth/auth.service.ts`
- `EmailAuthStrategy` (interface) in `backend/src/modules/auth/auth.service.ts`
- `EmailSignUpStrategy` in `backend/src/modules/auth/auth.service.ts`
- `EmailSignInStrategy` in `backend/src/modules/auth/auth.service.ts`
- `OAuthAuthorizationStrategy` (interface) in `backend/src/modules/auth/auth.service.ts`
- `GoogleOAuthStrategy` in `backend/src/modules/auth/auth.service.ts`

### Discovery

- `DiscoveryController` in `backend/src/modules/discovery/discovery.controller.ts`
- `DiscoveryService` in `backend/src/modules/discovery/discovery.service.ts`

### Matches + Matching

- `MatchesController` in `backend/src/modules/matches/matches.controller.ts`
- `MatchesService` in `backend/src/modules/matches/matches.service.ts`
- `MatchingController` in `backend/src/modules/matching/matching.controller.ts`
- `MatchingService` in `backend/src/modules/matching/matching.service.ts`
- `DefaultEligibilityStrategy` in `backend/src/modules/matching/matching.service.ts`
- `DefaultScoringStrategy` in `backend/src/modules/matching/matching.service.ts`

### Profiles + Preferences + Shared Template

- `ProfilesController` in `backend/src/modules/profiles/profiles.controller.ts`
- `ProfileService` in `backend/src/modules/profiles/profiles.service.ts`
- `ProfileUpsertService` in `backend/src/modules/profiles/profiles.service.ts`
- `PreferencesController` in `backend/src/modules/preferences/preferences.controller.ts`
- `PreferencesService` in `backend/src/modules/preferences/preferences.service.ts`
- `PreferenceUpsertService` in `backend/src/modules/preferences/preferences.service.ts`
- `UpsertByUserIdService` (abstract) in `backend/src/modules/shared/upsert-by-user-id.service.ts`

### Chat, Uploads, Users

- `ChatController` in `backend/src/modules/chat/chat.controller.ts`
- `ChatService` in `backend/src/modules/chat/chat.service.ts`
- `UploadsController` in `backend/src/modules/uploads/uploads.controller.ts`
- `UploadsService` in `backend/src/modules/uploads/uploads.service.ts`
- `UsersController` in `backend/src/modules/users.controllers.ts`
- `UsersService` in `backend/src/modules/users.service.ts`

## 5.2 Frontend classes

### Transport + API

- `AuthTransport` in `frontend/src/services/auth.transport.ts`
- `DiscoveryTransport` in `frontend/src/services/discovery.transport.ts`
- `MatchesTransport` in `frontend/src/services/matches.transport.ts`
- `ProfileTransport` in `frontend/src/services/profile.transport.ts`
- `PreferencesTransport` in `frontend/src/services/preferences.transport.ts`
- `ChatTransport` in `frontend/src/services/chat.transport.ts`
- `CloudinaryService` in `frontend/src/services/cloudinary.ts`
- `ApiError` in `frontend/src/services/api.ts`
- `FetchRequestStrategy` in `frontend/src/services/api.ts`
- `HttpClientAdapter` in `frontend/src/services/api.ts`

### Frontend strategy classes

- `QuestionnaireSourceStrategy` in `frontend/src/features/auth/authContinuationResolver.ts`
- `SignupDefaultStrategy` in `frontend/src/features/auth/authContinuationResolver.ts`
- `DefaultAppStrategy` in `frontend/src/features/auth/authContinuationResolver.ts`

## 6. Pattern Analysis (Requested Patterns)

Below is the exact status for the patterns you specifically listed.

## 6.1 Creational: Singleton

Status: Implemented extensively.

Evidence pattern used:

1. Module-level class instance.
2. Exported wrapper functions delegate to that instance.

Backend examples:

- `const authController = new AuthController()` + wrappers in `backend/src/modules/auth/auth.controller.ts`
- `const authService = new AuthService()` + wrappers in `backend/src/modules/auth/auth.service.ts`
- Same shape repeated in:
  - `backend/src/modules/discovery/discovery.service.ts`
  - `backend/src/modules/matches/matches.service.ts`
  - `backend/src/modules/matching/matching.service.ts`
  - `backend/src/modules/profiles/profiles.service.ts`
  - `backend/src/modules/preferences/preferences.service.ts`
  - `backend/src/modules/chat/chat.service.ts`
  - `backend/src/modules/uploads/uploads.service.ts`
  - `backend/src/modules/users.service.ts`

Frontend examples:

- `const authTransport = new AuthTransport()` in `frontend/src/services/auth.transport.ts`
- `const matchesTransport = new MatchesTransport()` in `frontend/src/services/matches.transport.ts`
- `const discoveryTransport = new DiscoveryTransport()` in `frontend/src/services/discovery.transport.ts`
- `const chatTransport = new ChatTransport()` in `frontend/src/services/chat.transport.ts`
- `const cloudinaryService = new CloudinaryService()` in `frontend/src/services/cloudinary.ts`
- `export const apiClient = new HttpClientAdapter(...)` in `frontend/src/services/api.ts`
- `getChatSocket()` lazy singleton socket in `frontend/src/features/chat/chat.socket.ts`

Trade-offs:

- Pros: stable imports, low ceremony, migration-safe.
- Cons: implicit global state, harder isolated testing, weaker lifecycle control compared to explicit DI container wiring.

## 6.2 Creational: Factory

Status: Implemented in auth via GoF-style Factory Method on `AuthService`.

Concrete evidence:

- `AuthService.createEmailAuthStrategy(intent)` returns `EmailSignUpStrategy` or `EmailSignInStrategy` through the `EmailAuthStrategy` interface in `backend/src/modules/auth/auth.service.ts`.
- `AuthService.createOAuthAuthorizationStrategy(provider)` returns `GoogleOAuthStrategy` through the `OAuthAuthorizationStrategy` interface in `backend/src/modules/auth/auth.service.ts`.

Why this is Factory Method:

- Product creation/selection is centralized in creator methods.
- Callers (`signUpWithEmail`, `signInWithEmail`, `getGoogleAuthorizationUrl`, `completeGoogleAuthorization`, `consumeGoogleExchangeCode`) operate against product interfaces, not concrete classes.

Remaining gap:

- This is not yet an `AbstractFactory` for multiple OAuth providers; the current provider family is `google` only.

## 6.3 Structural: Composite

Status: Not explicitly implemented in application domain code.

Reason:

- Current core domain flows (auth, matching, discovery, chat, profile, preferences) are not modeled as tree-composition structures requiring uniform leaf/composite treatment.

Important exam-safe answer:

- React itself uses composite component trees, but this repository does not define its own GoF Composite abstraction for domain objects.

## 6.4 Structural: Adapter

Status: Implemented strongly in frontend networking.

Primary evidence:

1. `RequestStrategy` contract in `frontend/src/services/api.ts`.
2. `FetchRequestStrategy` adapts browser `fetch` into app request behavior.
3. `HttpClientAdapter` adapts strategy + auth/error behavior into `apiRequest` interface.
4. Transport classes adapt domain operations to endpoint contracts.

Examples:

- `AuthTransport.exchangeGoogleAuthCode` -> `/auth/google/exchange`
- `DiscoveryTransport.swipeDiscoveryUser` -> `/discovery/swipe`
- `MatchesTransport.connectWithUser` -> `/matches/connect/:toUserId`
- `ProfileTransport.saveMyProfile` -> `/profiles/me`

Test-backed evidence:

- Endpoint contract assertions in `frontend/src/services/transports.test.ts`.

## 6.5 Behavioural: Observer

Status: Implemented.

Server-side observer/pub-sub:

- `backend/src/modules/chat/chat.socket.ts`
  - Subscribes with `socket.on(...)`.
  - Publishes with `io.to(...).emit(...)`.

Client-side observer semantics:

- `frontend/src/features/chat/chat.socket.ts` socket event reception.
- Redux state subscriptions via selectors in:
  - `frontend/src/features/auth/AuthProvider.tsx`
  - `frontend/src/app/ProtectedRoute.tsx`

Interpretation:

- Chat realtime flow is direct publish-subscribe observer behavior.

## 6.6 Behavioural: Strategy

Status: Implemented in multiple places.

Backend algorithm strategy:

- `EligibilityStrategy` + `DefaultEligibilityStrategy` in `backend/src/modules/matching/matching.service.ts`
- `ScoringStrategy` + `DefaultScoringStrategy` in `backend/src/modules/matching/matching.service.ts`
- Injected into `MatchingService` constructor.

Frontend request strategy:

- `RequestStrategy` + `FetchRequestStrategy` in `frontend/src/services/api.ts`
- Used by `HttpClientAdapter`.

Frontend auth continuation strategy:

- `AuthContinuationStrategy` in `frontend/src/features/auth/authContinuationResolver.ts`
- Concrete strategies:
  - `QuestionnaireSourceStrategy`
  - `SignupDefaultStrategy`
  - `DefaultAppStrategy`

## 6.7 Behavioural: Template Method

Status: Implemented clearly.

Template base class:

- `UpsertByUserIdService` in `backend/src/modules/shared/upsert-by-user-id.service.ts`
  - Defines invariant algorithm in `upsert(...)`.
  - Delegates variable steps to abstract methods.

Concrete implementations:

- `ProfileUpsertService` in `backend/src/modules/profiles/profiles.service.ts`
- `PreferenceUpsertService` in `backend/src/modules/preferences/preferences.service.ts`

Test evidence:

- `backend/src/modules/shared/upsert-by-user-id.service.test.ts`

## 7. Additional Patterns Actually Present (Beyond Requested List)

## 7.1 Proxy (real structural proxy)

Status: Implemented.

Evidence:

- `backend/src/config/prisma.ts` exports `prisma` as `new Proxy({} as PrismaClient, ...)`.
- Proxy lazily instantiates real `PrismaClient` on first property access.

Why this matters:

- This is a concrete, textbook proxy wrapper controlling access and initialization timing.

## 7.2 Facade (service/controller/transport facades)

Status: Implemented as architectural style.

Evidence:

- Controllers expose simplified HTTP entry points while hiding service internals.
- Services aggregate lower-level persistence and policy operations.
- Frontend transports expose domain methods instead of raw fetch calls.

Examples:

- `AuthController` orchestrates request parsing, error mapping, and auth service delegation.
- `DiscoveryService` orchestrates swipes, matching lookup, and enrichment.
- `CloudinaryService` orchestrates signed/unsigned upload flows.

## 8. SOLID Principle Mapping (Where Applied and Trade-offs)

## 8.1 S: Single Responsibility Principle

Strongly applied:

- Controller/Service split per module:
  - `backend/src/modules/*/*.controller.ts`
  - `backend/src/modules/*/*.service.ts`
- Transport layer separation from React components:
  - `frontend/src/services/*.transport.ts`

Applied examples:

- `ChatService` focuses on conversation/message persistence in `backend/src/modules/chat/chat.service.ts`.
- `UploadsService` focuses on signature creation in `backend/src/modules/uploads/uploads.service.ts`.

Trade-off areas:

- `AuthService` in `backend/src/modules/auth/auth.service.ts` now delegates credential and OAuth flows through strategy products, but still owns orchestration and factory selection.
- `MatchesService.getMyMatches` in `backend/src/modules/matches/matches.service.ts` combines query, enrichment, compatibility join, and tag generation.
- `DiscoveryService` in `backend/src/modules/discovery/discovery.service.ts` handles both feed composition and swipe mutation.

## 8.2 O: Open/Closed Principle

Strongly applied:

- Matching strategies are open for extension without modifying `MatchingService` core flow.
- Template method allows new upsert variants without changing base algorithm.

Trade-off areas:

- Error mapping switch in `AuthController.getErrorStatus` (`backend/src/modules/auth/auth.controller.ts`) must be edited for new domain error codes.
- Hardcoded tag generation logic in:
  - `DiscoveryService.generateTags` (`backend/src/modules/discovery/discovery.service.ts`)
  - `MatchesService.generateMatchTags` (`backend/src/modules/matches/matches.service.ts`)

## 8.3 L: Liskov Substitution Principle

Applied:

- `ProfileUpsertService` and `PreferenceUpsertService` substitute safely for `UpsertByUserIdService` contract.
- Strategy implementations satisfy their interface contracts in matching and auth continuation.

Evidence files:

- `backend/src/modules/shared/upsert-by-user-id.service.ts`
- `backend/src/modules/profiles/profiles.service.ts`
- `backend/src/modules/preferences/preferences.service.ts`
- `backend/src/modules/matching/matching.service.ts`
- `frontend/src/features/auth/authContinuationResolver.ts`

## 8.4 I: Interface Segregation Principle

Applied:

- Small focused interfaces:
  - `EligibilityStrategy`
  - `ScoringStrategy`
  - `RequestStrategy`
  - `AuthContinuationStrategy`

Evidence files:

- `backend/src/modules/matching/matching.service.ts`
- `frontend/src/services/api.ts`
- `frontend/src/features/auth/authContinuationResolver.ts`

Trade-off:

- `DiscoveryServiceDependencies` bundles three dependencies in one object; still workable, but not maximally granular.

## 8.5 D: Dependency Inversion Principle

Applied:

- Strategy injection into `MatchingService`.
- Request strategy injection into `HttpClientAdapter`.
- Dependency injection bags in `DiscoveryService` and `MatchesService`.

Evidence files:

- `backend/src/modules/matching/matching.service.ts`
- `backend/src/modules/discovery/discovery.service.ts`
- `backend/src/modules/matches/matches.service.ts`
- `frontend/src/services/api.ts`

Trade-off areas:

- Most services still depend directly on concrete Prisma client import (`import prisma from ...`).
- Controllers depend on concrete service wrapper exports.

This is pragmatic DIP, not pure DIP.

## 9. File-by-File Pattern Map

### 9.1 Backend module map

- `backend/src/modules/auth/auth.controller.ts`:
  - Class facade, singleton wrapper, error mapping strategy via switch, OAuth callback orchestration.
- `backend/src/modules/auth/auth.service.ts`:
  - Class singleton using Factory Method (`createEmailAuthStrategy`, `createOAuthAuthorizationStrategy`) with concrete strategy products.
- `backend/src/modules/discovery/discovery.controller.ts`:
  - Class facade, input normalization (`superlike`/`skip`).
- `backend/src/modules/discovery/discovery.service.ts`:
  - Class singleton, dependency injection bag, feed enrichment, tag generation.
- `backend/src/modules/matches/matches.controller.ts`:
  - Class facade with connect operation using discovery swipe.
- `backend/src/modules/matches/matches.service.ts`:
  - Class singleton, match creation + enrichment.
- `backend/src/modules/matching/matching.service.ts`:
  - Strategy interfaces + implementations + service injection.
- `backend/src/modules/profiles/profiles.service.ts`:
  - Template method concrete subclass + service facade.
- `backend/src/modules/preferences/preferences.service.ts`:
  - Template method concrete subclass + validation.
- `backend/src/modules/shared/upsert-by-user-id.service.ts`:
  - Template method base abstraction.
- `backend/src/modules/chat/chat.socket.ts`:
  - Observer/pub-sub event wiring.
- `backend/src/config/prisma.ts`:
  - Lazy singleton + Proxy pattern.

### 9.2 Frontend module map

- `frontend/src/services/api.ts`:
  - Adapter + strategy + client facade.
- `frontend/src/services/*.transport.ts`:
  - Class-based adapters from domain calls to REST endpoints.
- `frontend/src/services/cloudinary.ts`:
  - Class singleton with signed/unsigned fallback orchestration.
- `frontend/src/features/auth/authContinuationResolver.ts`:
  - Strategy chain for post-auth routing.
- `frontend/src/features/chat/chat.socket.ts`:
  - Singleton socket accessor.
- `frontend/src/features/auth/AuthProvider.tsx`:
  - Observer-style state reaction with effects and store dispatch.

## 10. Compatibility Wrapper Evidence

Representative backend shape:

```ts
const service = new SomeService()

export async function legacyFunction(args) {
  return service.legacyFunction(args)
}
```

Representative frontend shape:

```ts
const transport = new SomeTransport()

export function legacyApiCall(args) {
  return transport.legacyApiCall(args)
}
```

Routes still call wrapper exports, not direct class instances:

- `backend/src/modules/auth/auth.routes.ts`
- `backend/src/modules/discovery/discovery.routes.ts`
- `backend/src/modules/matches/matches.routes.ts`
- `backend/src/modules/matching/matching.routes.ts`
- `backend/src/modules/profiles/profiles.routes.ts`
- `backend/src/modules/preferences/preferences.routes.ts`
- `backend/src/modules/uploads/uploads.routes.ts`
- `backend/src/modules/chat/chat.routes.ts`
- `backend/src/modules/users.routes.ts`

## 11. Test Evidence Anchoring Implemented Behavior

Pattern-behavior-backed tests include:

- Template behavior:
  - `backend/src/modules/shared/upsert-by-user-id.service.test.ts`
- Strategy and matching behavior:
  - `backend/src/modules/matching/matching.service.test.ts`
- Discovery orchestration behavior:
  - `backend/src/modules/discovery/discovery.service.test.ts`
- Match enrichment behavior:
  - `backend/src/modules/matches/matches.service.test.ts`
- Preference validation behavior:
  - `backend/src/modules/preferences/preferences.service.test.ts`
- Frontend adapter endpoint contracts:
  - `frontend/src/services/transports.test.ts`

## 12. Teacher Viva Quick Answers (Direct)

### Q1: Which system design classes did you create/apply?

Answer:

- Controller classes per module.
- Service classes per module.
- Transport classes per frontend domain.
- Strategy classes in matching, auth, and auth continuation.
- Template base + concrete upsert subclasses.

### Q2: Where is Singleton applied?

Answer:

- Module singletons in nearly all service/controller/transport files.
- Lazy singleton chat socket in frontend.
- Lazy singleton Prisma client in backend config.

### Q3: Where is Factory applied?

Answer:

- Auth uses GoF-style Factory Method in `backend/src/modules/auth/auth.service.ts`.
- `createEmailAuthStrategy(intent)` returns `EmailSignUpStrategy` or `EmailSignInStrategy` via `EmailAuthStrategy`.
- `createOAuthAuthorizationStrategy(provider)` returns `GoogleOAuthStrategy` via `OAuthAuthorizationStrategy`.
- Simple factory function style also exists in `getPrismaClient` and `withAuthenticatedController`.

### Q4: Where is Composite applied?

Answer:

- No explicit custom Composite in domain code.

### Q5: Where is Adapter applied?

Answer:

- `frontend/src/services/api.ts` and all `*.transport.ts` files.

### Q6: Where is Observer applied?

Answer:

- Socket pub-sub in `backend/src/modules/chat/chat.socket.ts`.
- Client socket + Redux subscription behavior in frontend auth/chat flows.

### Q7: Where is Strategy applied?

Answer:

- Matching eligibility/scoring strategies.
- API request strategy.
- Auth continuation strategies.

### Q8: Where is Template applied?

Answer:

- `UpsertByUserIdService` base + profile/preferences subclasses.

### Q9: Where is SOLID applied most clearly?

Answer:

- S: module controller/service split.
- O/L: strategy and template extension points.
- I: focused interfaces in matching/api/auth continuation.
- D: constructor-injected strategy/dependency bags.

### Q10: What are current architecture trade-offs?

Answer:

- Strong compatibility and low migration risk.
- Weaker pure DIP due direct Prisma imports and singleton globals.
- Some multi-responsibility service methods remain for pragmatic delivery speed.

## 13. Honest Gap Register

1. No multi-provider Abstract Factory yet (current OAuth family is Google only).
2. No custom Composite domain abstraction yet.
3. DIP is partial, not strict, because persistence is concrete-coupled to Prisma.
4. Some services remain large and can be decomposed further.

## 14. Suggested Next Refactor Steps (If Needed Later)

1. Extract auth provider factory if adding more OAuth providers.
2. Split large service methods (especially discovery/matches/auth) into collaborators.
3. Introduce repository interfaces for stronger DIP.
4. Convert tag generation to explicit strategy objects for better OCP compliance.

## 15. Final Summary

Implemented with strong evidence:

- Singleton
- Factory Method (auth)
- Adapter
- Observer
- Strategy
- Template Method
- Proxy (additional)
- Facade-style layering (additional)

Not explicitly implemented in domain code:

- Composite

This is the current, source-verified status of the Flately architecture.
