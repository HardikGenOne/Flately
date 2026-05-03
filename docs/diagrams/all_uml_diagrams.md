# Flately — UML Diagrams (Mermaid)

## 1. Class Diagram

```mermaid
classDiagram
    direction TB

    %% ═══════════════════════════════════════
    %% INTERFACES
    %% ═══════════════════════════════════════

    class EmailAuthStrategy {
        <<interface>>
        +execute(credentials: EmailCredentials) Promise~AuthSession~
    }

    class OAuthAuthorizationStrategy {
        <<interface>>
        +getAuthorizationUrl(source?: string, redirectOrigin?: string) string
        +completeAuthorization(code: string, state: string) Promise~object~
        +consumeExchangeCode(code: string) AuthSession
    }

    class EmailAuthStrategyFactory {
        <<interface>>
        +create(intent: EmailAuthIntent) EmailAuthStrategy
    }

    class OAuthAuthorizationStrategyFactory {
        <<interface>>
        +create(provider: OAuthProvider) OAuthAuthorizationStrategy
    }

    class EligibilityStrategy {
        <<interface>>
        +isEligible(userA: CandidateShape, userB: CandidateShape) boolean
    }

    class ScoringStrategy {
        <<interface>>
        +calculateScore(prefA: PreferenceShape, prefB: PreferenceShape) number
    }

    class RequestStrategy {
        <<interface>>
        +send~T~(request: NormalizedRequest) Promise~T~
    }

    %% ═══════════════════════════════════════
    %% ABSTRACT CLASSES
    %% ═══════════════════════════════════════

    class UpsertByUserIdService~TUpdateData_TCreateData_TResult~ {
        <<abstract>>
        #findByUserId(userId: string) Promise~TResult~*
        #updateByUserId(userId: string, data: TUpdateData) Promise~TResult~*
        #mapCreateData(userId: string, data: TUpdateData) TCreateData*
        #createByUserId(data: TCreateData) Promise~TResult~*
        +upsert(userId: string, data: TUpdateData) Promise~TResult~
    }

    %% ═══════════════════════════════════════
    %% AUTH MODULE CLASSES
    %% ═══════════════════════════════════════

    class EmailSignUpStrategy {
        +execute(credentials: EmailCredentials) Promise~AuthSession~
    }

    class EmailSignInStrategy {
        +execute(credentials: EmailCredentials) Promise~AuthSession~
    }

    class GoogleOAuthStrategy {
        -googleOAuthStates: Map~string_GoogleOAuthStateEntry~
        -googleExchangeCodes: Map~string_GoogleExchangeCodeEntry~
        +getAuthorizationUrl(source?: string, redirectOrigin?: string) string
        +completeAuthorization(code: string, state: string) Promise~object~
        +consumeExchangeCode(code: string) AuthSession
        -cleanExpiredGoogleOAuthState() void
        -cleanExpiredExchangeCodes() void
        -getGoogleConfig() object
        -createGoogleOAuthState(source?: string, redirectOrigin?: string) string
        -consumeGoogleOAuthState(state: string) GoogleOAuthStateEntry
        -createExchangeCode(session: AuthSession) string
        -fetchGoogleUserProfile(code: string) Promise~GoogleUserProfile~
    }

    class DefaultEmailAuthStrategyFactory {
        -creators: Record~EmailAuthIntent_Function~
        +create(intent: EmailAuthIntent) EmailAuthStrategy
    }

    class DefaultOAuthAuthorizationStrategyFactory {
        -googleOAuthStates: Map~string_GoogleOAuthStateEntry~
        -googleExchangeCodes: Map~string_GoogleExchangeCodeEntry~
        +create(provider: OAuthProvider) OAuthAuthorizationStrategy
    }

    class AuthStrategyFactory {
        -emailFactory: EmailAuthStrategyFactory
        -oauthFactory: OAuthAuthorizationStrategyFactory
        +createEmailStrategy(intent: EmailAuthIntent) EmailAuthStrategy
        +createOAuthStrategy(provider: OAuthProvider) OAuthAuthorizationStrategy
    }

    %% ═══════════════════════════════════════
    %% MATCHING MODULE CLASSES
    %% ═══════════════════════════════════════

    class DefaultEligibilityStrategy {
        +isEligible(userA: CandidateShape, userB: CandidateShape) boolean
    }

    class DefaultScoringStrategy {
        -similarityScore(a: number, b: number, max: number) number
        -booleanScore(a: boolean, b: boolean) number
        +calculateScore(prefA: PreferenceShape, prefB: PreferenceShape) number
    }

    class MatchingService {
        -eligibilityStrategy: EligibilityStrategy
        -scoringStrategy: ScoringStrategy
        +findMatchesForUser(userId: string) Promise~Array~
        +assertOnboardingCompleted(userId: string) Promise~void~
    }

    %% ═══════════════════════════════════════
    %% DOMAIN SERVICE CLASSES
    %% ═══════════════════════════════════════

    class DiscoveryService {
        -dependencies: DiscoveryServiceDependencies
        +getDiscoveryFeed(userId: string) Promise~Array~
        +swipeUser(fromUserId: string, toUserId: string, action: string) Promise~object~
        -generateTags(profile: TaggableProfile, preference: TaggablePreference) string[]
    }

    class MatchesService {
        -dependencies: MatchesServiceDependencies
        +checkAndCreateMatch(fromUserId: string, toUserId: string) Promise~MatchCheckResult~
        +getMyMatches(userId: string) Promise~Array~
        -generateMatchTags(profile: object, preference: object) string[]
    }

    class ChatService {
        +getOrCreateConversation(matchId: string) Promise~Conversation~
        +getMessages(conversationId: string) Promise~Message[]~
        +sendMessage(conversationId: string, senderId: string, content: string) Promise~Message~
        +validateUserInMatch(matchId: string, userId: string) Promise~boolean~
    }

    class ProfileUpsertService {
        #findByUserId(userId: string) Promise~ProfileRecord~
        #updateByUserId(userId: string, data: ProfileUpdateData) Promise~ProfileRecord~
        #mapCreateData(userId: string, data: ProfileUpdateData) ProfileCreateData
        #createByUserId(data: ProfileCreateData) Promise~ProfileRecord~
    }

    class ProfileService {
        +getProfileByUserId(userId: string) Promise~Profile~
        +createOrUpdateProfile(userId: string, data: ProfileUpdateData) Promise~Profile~
    }

    class PreferenceUpsertService {
        #findByUserId(userId: string) Promise~PreferenceRecord~
        #updateByUserId(userId: string, data: PreferenceData) Promise~PreferenceRecord~
        #mapCreateData(userId: string, data: PreferenceData) PreferenceCreateData
        #createByUserId(data: PreferenceCreateData) Promise~PreferenceRecord~
    }

    class PreferencesService {
        +getPreferences(userId: string) Promise~Preference~
        +savePreferences(userId: string, data: PreferenceData) Promise~Preference~
    }

    class UploadsService {
        +getCloudinaryUploadSignature() CloudinaryUploadSignature
        -normalizeFolder(folder: string) string
        -ensureCloudinaryConfig() object
        -createCloudinarySignature(parameters: Record, apiSecret: string) string
    }

    %% ═══════════════════════════════════════
    %% FRONTEND CLASSES
    %% ═══════════════════════════════════════

    class ApiError {
        +status: number
        +data: unknown
        +url: string
    }

    class FetchRequestStrategy {
        +send~T~(request: NormalizedRequest) Promise~T~
    }

    class HttpClientAdapter {
        -strategy: RequestStrategy
        -baseUrl: string
        +request~T~(config: ApiRequestConfig) Promise~T~
    }

    %% ═══════════════════════════════════════
    %% RELATIONSHIPS — Realisation (implements)
    %% ═══════════════════════════════════════

    EmailAuthStrategy <|.. EmailSignUpStrategy
    EmailAuthStrategy <|.. EmailSignInStrategy
    OAuthAuthorizationStrategy <|.. GoogleOAuthStrategy
    EmailAuthStrategyFactory <|.. DefaultEmailAuthStrategyFactory
    OAuthAuthorizationStrategyFactory <|.. DefaultOAuthAuthorizationStrategyFactory
    EligibilityStrategy <|.. DefaultEligibilityStrategy
    ScoringStrategy <|.. DefaultScoringStrategy
    RequestStrategy <|.. FetchRequestStrategy

    %% ═══════════════════════════════════════
    %% RELATIONSHIPS — Inheritance (extends)
    %% ═══════════════════════════════════════

    UpsertByUserIdService~TUpdateData_TCreateData_TResult~ <|-- ProfileUpsertService
    UpsertByUserIdService~TUpdateData_TCreateData_TResult~ <|-- PreferenceUpsertService
    Error <|-- ApiError

    %% ═══════════════════════════════════════
    %% RELATIONSHIPS — Aggregation (constructor injection)
    %% ═══════════════════════════════════════

    AuthStrategyFactory o-- EmailAuthStrategyFactory
    AuthStrategyFactory o-- OAuthAuthorizationStrategyFactory
    MatchingService o-- EligibilityStrategy
    MatchingService o-- ScoringStrategy
    HttpClientAdapter o-- RequestStrategy

    %% ═══════════════════════════════════════
    %% RELATIONSHIPS — Dependency
    %% ═══════════════════════════════════════

    DefaultEmailAuthStrategyFactory ..> EmailSignUpStrategy : creates
    DefaultEmailAuthStrategyFactory ..> EmailSignInStrategy : creates
    DefaultOAuthAuthorizationStrategyFactory ..> GoogleOAuthStrategy : creates
    ProfileService ..> ProfileUpsertService : delegates
    PreferencesService ..> PreferenceUpsertService : delegates
    DiscoveryService ..> MatchingService : uses
    DiscoveryService ..> MatchesService : uses
    MatchesService ..> MatchingService : uses
```

---

## 2. Use Case Diagram

> Mermaid has no native use-case diagram type. Modelled as a flowchart with actor and system-boundary semantics.

```mermaid
flowchart LR
    %% ═══ ACTORS ═══
    Guest([Guest User])
    AuthUser([Authenticated User])
    Google([Google OAuth])
    Cloudinary([Cloudinary CDN])
    SocketClient([Socket.IO Client])

    subgraph Flately["Flately System"]

        subgraph AuthModule["Auth Module"]
            UC_Signup(Signup with Email)
            UC_Login(Login with Email)
            UC_GoogleStart(Start Google OAuth)
            UC_GoogleCallback(Google OAuth Callback)
            UC_GoogleExchange(Exchange Google Code)
        end

        subgraph ProfileModule["Profile Module"]
            UC_GetProfile(Get My Profile)
            UC_UpdateProfile(Update My Profile)
        end

        subgraph PreferenceModule["Preference Module"]
            UC_GetPrefs(Get My Preferences)
            UC_SavePrefs(Save Preferences)
        end

        subgraph DiscoveryModule["Discovery Module"]
            UC_Feed(Get Discovery Feed)
            UC_Swipe(Swipe on User)
        end

        subgraph MatchModule["Match Module"]
            UC_MyMatches(Get My Matches)
            UC_CheckMatch(Check and Create Match)
        end

        subgraph ChatModule["Chat Module"]
            UC_OpenChat(Open Conversation)
            UC_SendMsg(Send Message)
            UC_ReceiveMsg(Receive Message)
        end

        subgraph UploadModule["Upload Module"]
            UC_Signature(Get Upload Signature)
        end

        subgraph MatchingEngine["Matching Engine"]
            UC_FindMatches(Find Matches For User)
        end

    end

    %% ═══ ACTOR → USE CASE EDGES ═══
    Guest --> UC_Signup
    Guest --> UC_Login
    Guest --> UC_GoogleStart

    AuthUser --> UC_GetProfile
    AuthUser --> UC_UpdateProfile
    AuthUser --> UC_GetPrefs
    AuthUser --> UC_SavePrefs
    AuthUser --> UC_Feed
    AuthUser --> UC_Swipe
    AuthUser --> UC_MyMatches
    AuthUser --> UC_OpenChat
    AuthUser --> UC_Signature

    SocketClient --> UC_SendMsg
    SocketClient --> UC_ReceiveMsg

    %% ═══ EXTERNAL SYSTEM EDGES ═══
    UC_GoogleStart --> Google
    UC_GoogleCallback --> Google
    UC_Signature --> Cloudinary

    %% ═══ INCLUDE RELATIONSHIPS ═══
    UC_Feed -.->|includes| UC_FindMatches
    UC_MyMatches -.->|includes| UC_FindMatches
    UC_Swipe -.->|extends| UC_CheckMatch
    UC_CheckMatch -.->|extends| UC_OpenChat
```

---

## 3. Entity Relationship Diagram

```mermaid
erDiagram
    User {
        String id PK "ObjectId"
        String email UK "unique"
        String passwordHash "nullable"
        String googleId "nullable"
        String name "nullable"
        String picture "nullable"
        DateTime createdAt
        DateTime updatedAt
    }

    Profile {
        String id PK "ObjectId"
        String userId FK,UK "unique → User.id"
        String name "nullable"
        Int age "nullable"
        String gender "nullable"
        String bio "nullable"
        StringArray photos
        String city "nullable"
        Boolean hasRoom "default: false"
        String occupation "nullable"
        String sleepSchedule "nullable"
        Int noiseLevel "nullable"
        String guestPolicy "nullable"
        String smoking "nullable"
        String pets "nullable"
        Boolean onboardingCompleted "default: false"
        DateTime createdAt
        DateTime updatedAt
    }

    Preference {
        String id PK "ObjectId"
        String userId FK,UK "unique → User.id"
        String genderPreference
        Int minBudget
        Int maxBudget
        String city
        Int cleanliness
        Int sleepSchedule
        Boolean smoking
        Boolean drinking
        Boolean pets
        Int socialLevel
        Int weightCleanliness
        Int weightSleep
        Int weightHabits
        Int weightSocial
        DateTime createdAt
        DateTime updatedAt
    }

    Swipe {
        String id PK "ObjectId"
        String fromUserId FK "→ User.id"
        String toUserId FK "→ User.id"
        String action "like | skip"
        DateTime createdAt
    }

    Match {
        String id PK "ObjectId"
        String userAId FK "→ User.id"
        String userBId FK "→ User.id"
        DateTime createdAt
    }

    Conversation {
        String id PK "ObjectId"
        String matchId FK,UK "unique → Match.id"
        DateTime createdAt
    }

    Message {
        String id PK "ObjectId"
        String conversationId FK "→ Conversation.id"
        String senderId FK "→ User.id"
        String content
        DateTime createdAt
    }

    %% ═══ RELATIONSHIPS ═══
    %% Explicit @relation in schema
    User ||--o| Profile : "has one"
    Conversation ||--o{ Message : "contains"

    %% Implicit via @unique userId FK
    User ||--o| Preference : "has one"

    %% Implicit via @db.ObjectId FK fields
    User ||--o{ Swipe : "sends (fromUserId)"
    User ||--o{ Swipe : "receives (toUserId)"
    User ||--o{ Match : "participates (userAId)"
    User ||--o{ Match : "participates (userBId)"
    Match ||--o| Conversation : "has one"
    User ||--o{ Message : "authors (senderId)"

    %% Compound unique constraints
    %% Swipe: @@unique([fromUserId, toUserId])
    %% Match: @@unique([userAId, userBId])
```

---

## 4. Sequence Diagrams

### 4a. Email Signup → Onboarding → First Discovery

```mermaid
sequenceDiagram
    actor Client
    participant AC as AuthController
    participant ASF as AuthStrategyFactory
    participant ESU as EmailSignUpStrategy
    participant DB as MongoDB

    Client->>+AC: POST /auth/signup {email, password, name}

    AC->>+ASF: createEmailStrategy("signup")
    ASF-->>-AC: EmailSignUpStrategy instance

    AC->>+ESU: execute({email, password, name})
    ESU->>+DB: findUnique(User where email)
    DB-->>-ESU: null
    ESU->>+DB: create(User {email, passwordHash, name})
    DB-->>-ESU: User record
    ESU->>ESU: signAccessToken(user)
    ESU-->>-AC: AuthSession {accessToken, user}

    AC-->>-Client: 201 {accessToken, user}

    Note over Client: Store session, navigate to /app/onboarding

    Client->>+AC: PUT /profiles/me {profile fields, onboardingCompleted: true}
    AC->>+DB: upsert Profile by userId
    DB-->>-AC: Profile record
    AC-->>-Client: 200 Profile

    Client->>+AC: PUT /preferences {weights summing to 100, lifestyle scores}
    AC->>+DB: upsert Preference by userId
    DB-->>-AC: Preference record
    AC-->>-Client: 200 Preference

    Note over Client: Onboarding complete, navigate to /app/discover

    Client->>+AC: GET /discovery/feed
    participant DS as DiscoveryService
    participant MS as MatchingService
    AC->>+DS: getDiscoveryFeed(userId)
    DS->>+DB: findMany(Swipe where fromUserId)
    DB-->>-DS: excluded user IDs
    DS->>+MS: findMatchesForUser(userId)
    MS->>+DB: findUnique(Profile, Preference for viewer)
    DB-->>-MS: viewer data
    MS->>+DB: findMany(all other Profiles + Preferences)
    DB-->>-MS: candidate data

    loop For each candidate
        MS->>MS: isEligible(viewer, candidate)
        alt Eligible
            MS->>MS: calculateScore(viewerPref, candidatePref)
        end
    end

    MS->>MS: sortRankedMatches(results)
    MS-->>-DS: ranked matches [{userId, score}]
    DS->>DS: filter out already-swiped
    DS->>+DB: findMany(Profiles + Preferences for filtered IDs)
    DB-->>-DS: enrichment data
    DS->>DS: enrich with photos, tags, compatibility
    DS-->>-AC: enriched discovery feed
    AC-->>-Client: 200 discovery feed array
```

### 4b. Swipe → Mutual Match Creation

```mermaid
sequenceDiagram
    actor Client
    participant DC as DiscoveryController
    participant DS as DiscoveryService
    participant MS as MatchingService
    participant MaS as MatchesService
    participant DB as MongoDB

    Client->>+DC: POST /discovery/swipe {toUserId, action: "like"}
    DC->>+DS: swipeUser(fromUserId, toUserId, "like")

    DS->>+MS: assertOnboardingCompleted(fromUserId)
    MS->>+DB: findUnique(Profile + Preference)
    DB-->>-MS: records exist, onboarding complete
    MS-->>-DS: void (no error)

    DS->>+DB: upsert Swipe {fromUserId, toUserId, action: "like"}
    DB-->>-DS: Swipe record

    DS->>+MaS: checkAndCreateMatch(fromUserId, toUserId)
    MaS->>+DB: findUnique(Swipe where from=toUser, to=fromUser)
    DB-->>-MaS: reverse swipe

    alt Reverse swipe exists AND action = "like"
        MaS->>MaS: canonicalize IDs (userAId < userBId)
        MaS->>+DB: upsert Match {userAId, userBId}
        DB-->>-MaS: Match record
        MaS-->>DS: {matched: true, match}
    else No mutual like
        MaS-->>DS: {matched: false}
    end

    DS-->>-DC: {swipe, matched}
    DC-->>-Client: 200 {swipe, matched}
```

### 4c. Real-Time Chat via Socket.IO

```mermaid
sequenceDiagram
    actor UserA
    actor UserB
    participant FE_A as Frontend (User A)
    participant FE_B as Frontend (User B)
    participant REST as ChatController
    participant CS as ChatService
    participant IO as Socket.IO Server
    participant DB as MongoDB

    UserA->>+FE_A: Open chat for matchId
    FE_A->>+REST: GET /chat/:matchId
    REST->>+CS: getOrCreateConversation(matchId)
    CS->>+DB: upsert Conversation {matchId}
    DB-->>-CS: Conversation
    CS-->>-REST: Conversation
    REST->>+CS: getMessages(conversationId)
    CS->>+DB: findMany(Message where conversationId, orderBy createdAt asc)
    DB-->>-CS: Message[]
    CS-->>-REST: Message[]
    REST-->>-FE_A: {conversation, messages, otherUser}

    FE_A->>IO: emit("join", conversationId)
    FE_B->>IO: emit("join", conversationId)
    Note over IO: Both users in same Socket.IO room

    UserA->>FE_A: Type and send message
    FE_A->>+IO: emit("sendMessage", {conversationId, senderId, content})
    IO->>+CS: sendMessage(conversationId, senderId, content)
    CS->>+DB: create Message {conversationId, senderId, content}
    DB-->>-CS: Message record
    CS-->>-IO: Message record

    par Broadcast to room
        IO-->>FE_A: emit("message", {id, senderId, content, createdAt})
        IO-->>FE_B: emit("new_message", {id, senderId, content, createdAt})
    end
    deactivate IO

    Note over FE_A,FE_B: Both clients render new message in real-time
```

### 4d. Google OAuth Flow

```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend
    participant AC as AuthController
    participant GOS as GoogleOAuthStrategy
    participant Google as Google OAuth Server
    participant DB as MongoDB

    User->>FE: Click "Sign in with Google"
    FE->>+AC: GET /auth/google?source=app&redirectOrigin=...
    AC->>+GOS: getAuthorizationUrl(source, redirectOrigin)
    GOS->>GOS: createGoogleOAuthState(source, redirectOrigin)
    Note over GOS: Store state in Map with 10min TTL
    GOS-->>-AC: Google authorization URL
    AC-->>-FE: 302 Redirect to Google

    FE->>Google: User authenticates at Google
    Google-->>AC: GET /auth/google/callback?code=...&state=...

    AC->>+GOS: completeAuthorization(code, state)
    GOS->>GOS: consumeGoogleOAuthState(state)

    GOS->>+Google: POST /token (exchange code for access_token)
    Google-->>-GOS: {access_token}

    GOS->>+Google: GET /userinfo (Bearer access_token)
    Google-->>-GOS: {sub, email, name, picture}

    alt User exists by googleId
        GOS->>+DB: update User (name, picture)
        DB-->>-GOS: User
    else User exists by email
        GOS->>+DB: update User (link googleId)
        DB-->>-GOS: User
    else New user
        GOS->>+DB: create User {email, googleId, name, picture}
        DB-->>-GOS: User
    end

    GOS->>GOS: createExchangeCode(session)
    Note over GOS: Store in Map with 2min TTL
    GOS-->>-AC: {exchangeCode, source, redirectOrigin}

    AC-->>FE: 302 Redirect to /auth/callback?code=exchangeCode

    FE->>+AC: POST /auth/google/exchange {code: exchangeCode}
    AC->>+GOS: consumeExchangeCode(code)
    GOS->>GOS: Lookup and delete from Map
    GOS-->>-AC: AuthSession
    AC-->>-FE: 200 {accessToken, user}

    Note over FE: Store session, bootstrap profile, navigate to /app
```
