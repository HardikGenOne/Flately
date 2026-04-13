# Flately - Backend Code Reference (Current Baseline)

Last updated: 2026-04-14

Status:
- This is a current architecture baseline with key snippets.
- This is not a full source dump.
- Source of truth remains backend/src.

---

## 1) Contract Compatibility Snapshot

### REST discovery and connect

| Capability | Canonical | Legacy Alias | Compatibility Status |
|---|---|---|---|
| Discovery feed | `GET /discovery/feed` | `GET /discovery` | Alias kept |
| Swipe/connect action | `POST /discovery/swipe` | `POST /matches/connect/:toUserId` | Alias kept |

### Socket chat transport

| Direction | Canonical Event | Alias Event | Payload |
|---|---|---|---|
| Client -> Server | `joinRoom` | `join` | `conversationId` |
| Client -> Server | `sendMessage` | `send_message` | `{ conversationId, senderId, content }` |
| Server -> Client | `message` | `new_message` | `{ id, senderId, content, createdAt, timestamp }` |

Payload note:
- `createdAt` and `timestamp` are both emitted as ISO datetime strings.

---

## 2) App Wiring (Route Surface)

Key route registration from backend/src/app.ts:

```ts
app.use('/matching', matchingRoutes);
app.use('/profiles', profileRoutes);
app.use('/discovery', discoveryRoutes);
app.use('/users', userRoutes);
app.use('/matches', matchRoutes);
app.use('/chat', chatRoutes);
app.use('/preferences', preferenceRoutes);
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});
```

---

## 3) Controller Chain Middleware (PA-003)

File: backend/src/middlewares/controller-chain.middleware.ts

Purpose:
- Standardize auth preconditions and error mapping across controllers.
- Keep controller logic focused on request/response orchestration.

Role split inside middleware chain:
- `requireAuthenticatedUser(...)` is the auth guard. It checks `req.userId` and returns `401` early when missing.
- `domainErrorToHttp(...)` is the domain-to-HTTP mapper. It translates thrown domain codes (for example `ONBOARDING_REQUIRED`) into route-specific status/body responses.
- `withAuthenticatedController(...)` composes guard -> controller -> error mapper in one reusable chain.

Key pattern:

```ts
export function withAuthenticatedController(
  handler: AuthenticatedController,
  options: ControllerChainOptions = {},
): Array<RequestHandler | ErrorRequestHandler> {
  return [
    requireAuthenticatedUser(options.unauthorizedBody),
    handler as RequestHandler,
    domainErrorToHttp(options),
  ];
}
```

Usage pattern (example):

```ts
router.get(
  '/me',
  checkJwt,
  ...withAuthenticatedController(getMyMatches, {
    fallbackError: { status: 500, body: { message: 'Internal server error' } },
  }),
);
```

---

## 4) Shared Upsert Abstraction (PA-004)

Files:
- backend/src/modules/shared/upsert-by-user-id.service.ts
- backend/src/modules/profiles/profiles.service.ts
- backend/src/modules/preferences/preferences.service.ts

Base abstraction:

```ts
export abstract class UpsertByUserIdService<TUpdateData, TCreateData, TResult> {
  protected abstract findByUserId(userId: string): Promise<TResult | null>;
  protected abstract updateByUserId(userId: string, data: TUpdateData): Promise<TResult>;
  protected abstract mapCreateData(userId: string, data: TUpdateData): TCreateData;
  protected abstract createByUserId(data: TCreateData): Promise<TResult>;

  async upsert(userId: string, data: TUpdateData): Promise<TResult> {
    const existing = await this.findByUserId(userId);
    if (existing) return this.updateByUserId(userId, data);
    return this.createByUserId(this.mapCreateData(userId, data));
  }
}
```

Contract note:
- Endpoint paths and payload shapes remain unchanged.
- This refactor removes duplicated lifecycle logic only.

---

## 5) Matching Service Seams and Deterministic Tie-Order

File: backend/src/modules/matching/matching.service.ts

Current internals:
- Mapper helpers: `mapToCandidateShape`, `mapToPreferenceShape`
- Strategy seams: `EligibilityStrategy`, `ScoringStrategy`
- Ranking helper: `rankEligibleCandidates`
- Stable sorting helper: `sortRankedMatches`

Deterministic tie-order snippet:

```ts
function sortRankedMatches(matches: RankedMatch[]): Array<{ userId: string; score: number }> {
  return matches
    .sort((a, b) => {
      const scoreDiff = b.score - a.score;
      if (scoreDiff !== 0) return scoreDiff;
      return a.insertionOrder - b.insertionOrder;
    })
    .map(({ userId, score }) => ({ userId, score }));
}
```

Contract note:
- External output remains `Array<{ userId, score }>`.

---

## 6) Discovery Service (Canonical Route + Batched Enrichment)

Files:
- backend/src/modules/discovery/discovery.routes.ts
- backend/src/modules/discovery/discovery.controller.ts
- backend/src/modules/discovery/discovery.service.ts

Route compatibility:

```ts
router.get('/', checkJwt, ...withAuthenticatedController(getFeed, options));
router.get('/feed', checkJwt, ...withAuthenticatedController(getFeed, options));
router.post('/swipe', checkJwt, ...withAuthenticatedController(swipe, options));
```

Controller action validation supports compatibility inputs:

```ts
function isSwipeAction(value: unknown): value is 'like' | 'dislike' {
  return value === 'like' || value === 'dislike' || value === 'skip' || value === 'superlike';
}
```

Batched enrichment pattern:

```ts
const filteredUserIds = filtered.map((match) => match.userId);

const [profiles, preferences] = await Promise.all([
  prisma.profile.findMany({
    where: { userId: { in: filteredUserIds } },
    include: { user: true },
  }),
  prisma.preference.findMany({
    where: { userId: { in: filteredUserIds } },
  }),
]);

const profileByUserId = new Map(profiles.map((profile) => [profile.userId, profile]));
const preferenceByUserId = new Map(
  preferences.map((preference) => [preference.userId, preference]),
);
```

Normalization note:
- `superlike -> like`
- `skip -> dislike`

---

## 7) Matches Alias Endpoint

File: backend/src/modules/matches/matches.routes.ts

Alias route:

```ts
router.post(
  '/connect/:toUserId',
  checkJwt,
  ...withAuthenticatedController(connectCompatibility, options),
);
```

Controller behavior:

```ts
const result = await swipeUser(userId, toUserId, 'like');
res.json({ success: true, matched: result.matched });
```

Compatibility note:
- This alias maps legacy connect semantics to canonical swipe service logic.

---

## 8) Socket Canonical and Alias Mapping

File: backend/src/modules/chat/chat.socket.ts

```ts
const chatSocketEvents = {
  joinCanonical: 'joinRoom',
  joinAlias: 'join',
  sendCanonical: 'sendMessage',
  sendAlias: 'send_message',
  messageCanonical: 'message',
  messageAlias: 'new_message',
} as const;

socket.on(chatSocketEvents.joinCanonical, joinConversation);
socket.on(chatSocketEvents.joinAlias, joinConversation);

socket.on(chatSocketEvents.sendCanonical, handleSendMessage);
socket.on(chatSocketEvents.sendAlias, handleSendMessage);
```

Message payload emitted to both events:

```ts
const payload = {
  id: msg.id,
  senderId: msg.senderId,
  content: msg.content,
  createdAt: msg.createdAt.toISOString(),
  timestamp: msg.createdAt.toISOString(),
};

io.to(conversationId).emit('message', payload);
io.to(conversationId).emit('new_message', payload);
```

---

## 9) Auth Module Snapshot (Factory Refactor)

Files:
- backend/src/modules/auth/auth.routes.ts
- backend/src/modules/auth/auth.controller.ts
- backend/src/modules/auth/auth.service.ts

Route surface (unchanged):

```ts
router.post('/signup', signup);
router.post('/login', login);
router.get('/google/start', startGoogleAuth);
router.get('/google/callback', googleCallback);
router.get('/google/exchange', exchangeGoogleCode);
```

Controller shape (updated):
- Function-based handlers are exported directly.
- No `AuthController` class singleton instance.
- Error mapping and redirect orchestration stay in controller module.

Service shape (updated):
- Exported auth functions remain stable:
  - `signUpWithEmail`
  - `signInWithEmail`
  - `getGoogleAuthorizationUrl`
  - `completeGoogleAuthorization`
  - `consumeGoogleExchangeCode`
- Concrete factory classes now centralize strategy creation:
  - `DefaultEmailAuthStrategyFactory`
  - `DefaultOAuthAuthorizationStrategyFactory`
  - `AuthStrategyFactory`

Correctness verdict (current implementation):
- Pattern application is correct for current scope: Strategy + Factory are applied with stable exported function contracts.
- Auth logic remains backward-compatible at route surface while removing auth service/controller singleton wrappers.

Current trade-offs:
- OAuth state and one-time exchange codes are stored in in-memory Maps, which is acceptable for single-instance runtime but not ideal for multi-instance horizontal scaling.
- Factory graph is rebuilt per exported auth call; overhead is low but introduces extra object churn.
- No dedicated `auth.service.test.ts` file currently exists, so confidence relies more on integration behavior than direct auth unit tests.

Compatibility note:
- External endpoint contract is unchanged.
- Internal auth implementation no longer uses service/controller singleton class instances.

---

## 10) In-Progress Review Snapshot (Auth + Class Diagram)

Auth review outcome:
- No blocking regressions were found in the current auth refactor.
- Backend typecheck passed after these auth changes.
- Route surface remains stable (`/signup`, `/login`, `/google/start`, `/google/callback`, `/google/exchange`).

Auth risk notes:
- OAuth state and exchange code stores remain process-local in-memory Maps, which is not multi-instance safe.
- Auth strategy factories are rebuilt per exported call; this is acceptable overhead now but adds object churn.

Class diagram review outcome:
- `docs/diagrams/01-class-diagram.mmd` now models auth as factory-driven (`EmailAuthStrategyFactory`, `OAuthAuthorizationStrategyFactory`, `AuthStrategyFactory`) and removes obsolete `AuthController`/`AuthService` class nodes.
- Auth-to-persistence dependencies were updated to concrete strategy classes (`EmailSignUpStrategy`, `EmailSignInStrategy`, `GoogleOAuthStrategy`) to match source behavior.
- Diagram quality checks from the Mermaid class/quality guidelines were satisfied (explicit direction, labeled relations, architecture-depth coverage).

Follow-up recommendations:
1. Move OAuth state/exchange storage to a shared store before multi-instance deployment.
2. Add dedicated auth unit tests around factory selection and OAuth state/exchange lifecycle.

---

## 11) File Pointers for Further Reading

- backend/src/app.ts
- backend/src/middlewares/controller-chain.middleware.ts
- backend/src/modules/shared/upsert-by-user-id.service.ts
- backend/src/modules/matching/matching.service.ts
- backend/src/modules/discovery/discovery.routes.ts
- backend/src/modules/discovery/discovery.service.ts
- backend/src/modules/matches/matches.routes.ts
- backend/src/modules/matches/matches.controller.ts
- backend/src/modules/chat/chat.socket.ts
- backend/src/types/socket.ts
