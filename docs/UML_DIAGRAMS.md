# Flately UML Diagrams

All diagrams have been verified against the actual TypeScript codebase. SVG exports are in [`docs/svg/`](svg/).

---

## 1. Class Diagram

> 20 classes, 7 interfaces, 1 abstract class — showing Strategy, Factory, Template Method, and Adapter patterns.

![Class Diagram](svg/1_class_diagram.svg)

<details>
<summary>View Mermaid source</summary>

```mermaid
classDiagram
    direction TB

    class EmailAuthStrategy {
        <<interface>>
        +execute(credentials) Promise~AuthSession~
    }

    class OAuthAuthorizationStrategy {
        <<interface>>
        +getAuthorizationUrl(source, redirectOrigin) string
        +completeAuthorization(code, state) Promise~object~
        +consumeExchangeCode(code) AuthSession
    }

    class EmailAuthStrategyFactory {
        <<interface>>
        +create(intent) EmailAuthStrategy
    }

    class OAuthAuthorizationStrategyFactory {
        <<interface>>
        +create(provider) OAuthAuthorizationStrategy
    }

    class EligibilityStrategy {
        <<interface>>
        +isEligible(userA, userB) boolean
    }

    class ScoringStrategy {
        <<interface>>
        +calculateScore(prefA, prefB) number
    }

    class RequestStrategy {
        <<interface>>
        +send~T~(request) Promise~T~
    }

    class UpsertByUserIdService {
        <<abstract>>
        #findByUserId(userId) Promise~TResult~
        #updateByUserId(userId, data) Promise~TResult~
        #mapCreateData(userId, data) TCreateData
        #createByUserId(data) Promise~TResult~
        +upsert(userId, data) Promise~TResult~
    }

    class EmailSignUpStrategy {
        +execute(credentials) Promise~AuthSession~
    }

    class EmailSignInStrategy {
        +execute(credentials) Promise~AuthSession~
    }

    class GoogleOAuthStrategy {
        -googleOAuthStates: Map
        -googleExchangeCodes: Map
        +getAuthorizationUrl(source, redirectOrigin) string
        +completeAuthorization(code, state) Promise~object~
        +consumeExchangeCode(code) AuthSession
        -cleanExpiredGoogleOAuthState() void
        -cleanExpiredExchangeCodes() void
        -getGoogleConfig() object
        -createGoogleOAuthState(source, origin) string
        -consumeGoogleOAuthState(state) object
        -createExchangeCode(session) string
        -fetchGoogleUserProfile(code) Promise~object~
    }

    class DefaultEmailAuthStrategyFactory {
        -creators: Record
        +create(intent) EmailAuthStrategy
    }

    class DefaultOAuthAuthorizationStrategyFactory {
        -googleOAuthStates: Map
        -googleExchangeCodes: Map
        +create(provider) OAuthAuthorizationStrategy
    }

    class AuthStrategyFactory {
        -emailFactory: EmailAuthStrategyFactory
        -oauthFactory: OAuthAuthorizationStrategyFactory
        +createEmailStrategy(intent) EmailAuthStrategy
        +createOAuthStrategy(provider) OAuthAuthorizationStrategy
    }

    class DefaultEligibilityStrategy {
        +isEligible(userA, userB) boolean
    }

    class DefaultScoringStrategy {
        -similarityScore(a, b, max) number
        -booleanScore(a, b) number
        +calculateScore(prefA, prefB) number
    }

    class MatchingService {
        -eligibilityStrategy: EligibilityStrategy
        -scoringStrategy: ScoringStrategy
        +findMatchesForUser(userId) Promise~Array~
        +assertOnboardingCompleted(userId) Promise~void~
    }

    class DiscoveryService {
        -dependencies: object
        +getDiscoveryFeed(userId) Promise~Array~
        +swipeUser(fromId, toId, action) Promise~object~
        -generateTags(profile, pref) string[]
    }

    class MatchesService {
        -dependencies: object
        +checkAndCreateMatch(fromId, toId) Promise~MatchCheckResult~
        +getMyMatches(userId) Promise~Array~
        -generateMatchTags(profile, pref) string[]
    }

    class ChatService {
        +getOrCreateConversation(matchId) Promise~Conversation~
        +getMessages(conversationId) Promise~Array~
        +sendMessage(convoId, senderId, content) Promise~Message~
        +validateUserInMatch(matchId, userId) Promise~boolean~
    }

    class ProfileUpsertService {
        #findByUserId(userId) Promise~ProfileRecord~
        #updateByUserId(userId, data) Promise~ProfileRecord~
        #mapCreateData(userId, data) ProfileCreateData
        #createByUserId(data) Promise~ProfileRecord~
    }

    class ProfileService {
        +getProfileByUserId(userId) Promise~Profile~
        +createOrUpdateProfile(userId, data) Promise~Profile~
    }

    class PreferenceUpsertService {
        #findByUserId(userId) Promise~PreferenceRecord~
        #updateByUserId(userId, data) Promise~PreferenceRecord~
        #mapCreateData(userId, data) PreferenceCreateData
        #createByUserId(data) Promise~PreferenceRecord~
    }

    class PreferencesService {
        +getPreferences(userId) Promise~Preference~
        +savePreferences(userId, data) Promise~Preference~
    }

    class UploadsService {
        +getCloudinaryUploadSignature() CloudinaryUploadSignature
        -normalizeFolder(folder) string
        -ensureCloudinaryConfig() object
        -createCloudinarySignature(params, secret) string
    }

    class ApiError {
        +status: number
        +data: unknown
        +url: string
    }

    class FetchRequestStrategy {
        +send~T~(request) Promise~T~
    }

    class HttpClientAdapter {
        -strategy: RequestStrategy
        -baseUrl: string
        +request~T~(config) Promise~T~
    }

    EmailAuthStrategy <|.. EmailSignUpStrategy
    EmailAuthStrategy <|.. EmailSignInStrategy
    OAuthAuthorizationStrategy <|.. GoogleOAuthStrategy
    EmailAuthStrategyFactory <|.. DefaultEmailAuthStrategyFactory
    OAuthAuthorizationStrategyFactory <|.. DefaultOAuthAuthorizationStrategyFactory
    EligibilityStrategy <|.. DefaultEligibilityStrategy
    ScoringStrategy <|.. DefaultScoringStrategy
    RequestStrategy <|.. FetchRequestStrategy

    UpsertByUserIdService <|-- ProfileUpsertService
    UpsertByUserIdService <|-- PreferenceUpsertService
    Error <|-- ApiError

    AuthStrategyFactory o-- EmailAuthStrategyFactory
    AuthStrategyFactory o-- OAuthAuthorizationStrategyFactory
    MatchingService o-- EligibilityStrategy
    MatchingService o-- ScoringStrategy
    HttpClientAdapter o-- RequestStrategy

    DefaultEmailAuthStrategyFactory ..> EmailSignUpStrategy : creates
    DefaultEmailAuthStrategyFactory ..> EmailSignInStrategy : creates
    DefaultOAuthAuthorizationStrategyFactory ..> GoogleOAuthStrategy : creates
    ProfileService ..> ProfileUpsertService : delegates
    PreferencesService ..> PreferenceUpsertService : delegates
    DiscoveryService ..> MatchingService : uses
    DiscoveryService ..> MatchesService : uses
    MatchesService ..> MatchingService : uses
```

</details>

---

## 2. Use Case Diagram

> 5 actors, 15 use cases across 7 system modules.

![Use Case Diagram](svg/2_usecase_diagram.svg)

<details>
<summary>View Mermaid source</summary>

```mermaid
flowchart LR
    Guest([Guest User])
    AuthUser([Authenticated User])
    Google([Google OAuth])
    Cloudinary([Cloudinary CDN])
    SocketClient([Socket.IO Client])

    subgraph Flately["Flately System"]
        direction TB

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

    UC_GoogleStart --> Google
    UC_GoogleCallback --> Google
    UC_Signature --> Cloudinary

    UC_Feed -.->|includes| UC_FindMatches
    UC_MyMatches -.->|includes| UC_FindMatches
    UC_Swipe -.->|extends| UC_CheckMatch
    UC_CheckMatch -.->|extends| UC_OpenChat
```

</details>

---

## 3. Entity-Relationship Diagram (ERD)

> 7 Prisma models with all FK/PK constraints and cardinalities from `schema.prisma`.

![ER Diagram](svg/3_erd_diagram.svg)

<details>
<summary>View Mermaid source</summary>

```mermaid
erDiagram
    USER {
        string id PK
        string email UK
        string passwordHash
        string googleId
        string name
        string picture
        datetime createdAt
        datetime updatedAt
    }

    PROFILE {
        string id PK
        string userId FK
        string name
        int age
        string gender
        string bio
        string city
        boolean hasRoom
        string occupation
        string sleepSchedule
        int noiseLevel
        string guestPolicy
        string smoking
        string pets
        boolean onboardingCompleted
        datetime createdAt
        datetime updatedAt
    }

    PREFERENCE {
        string id PK
        string userId FK
        string genderPreference
        int minBudget
        int maxBudget
        string city
        int cleanliness
        int sleepSchedule
        boolean smoking
        boolean drinking
        boolean pets
        int socialLevel
        int weightCleanliness
        int weightSleep
        int weightHabits
        int weightSocial
        datetime createdAt
        datetime updatedAt
    }

    SWIPE {
        string id PK
        string fromUserId FK
        string toUserId FK
        string action
        datetime createdAt
    }

    MATCH {
        string id PK
        string userAId FK
        string userBId FK
        datetime createdAt
    }

    CONVERSATION {
        string id PK
        string matchId FK
        datetime createdAt
    }

    MESSAGE {
        string id PK
        string conversationId FK
        string senderId FK
        string content
        datetime createdAt
    }

    USER ||--o| PROFILE : "has one"
    USER ||--o| PREFERENCE : "has one"
    USER ||--o{ SWIPE : "sends"
    USER ||--o{ MATCH : "participates"
    MATCH ||--o| CONVERSATION : "has one"
    CONVERSATION ||--o{ MESSAGE : "contains"
    USER ||--o{ MESSAGE : "authors"
```

</details>

---

## 4. Activity Diagram (Discovery & Matching Flow)

> Full user journey from login through discovery, swiping, matching, and real-time chat.

![Activity Diagram](svg/4_activity_diagram.svg)

<details>
<summary>View Mermaid source</summary>

```mermaid
stateDiagram-v2
    [*] --> Login
    Login --> Onboarding: New User
    Login --> DiscoveryFeed: Existing User
    Onboarding --> DiscoveryFeed: onboardingCompleted = true

    state DiscoveryFeed {
        [*] --> FetchCandidates
        FetchCandidates --> RunMatchingEngine
        RunMatchingEngine --> FilterSwiped
        FilterSwiped --> ViewProfile

        ViewProfile --> SwipeRight: Like
        ViewProfile --> SwipeLeft: Skip

        SwipeLeft --> FetchCandidates: Next

        state SwipeRight {
            [*] --> RecordSwipe
            RecordSwipe --> AssertOnboarding
            AssertOnboarding --> CheckMutualMatch
            CheckMutualMatch --> CreateMatch: Mutual Like Found
            CheckMutualMatch --> FetchCandidates: No Match Yet
            CreateMatch --> FetchCandidates
        }
    }

    DiscoveryFeed --> ViewMatches: Go to Matches
    ViewMatches --> OpenChat: Select Match

    state OpenChat {
        [*] --> GetOrCreateConversation
        GetOrCreateConversation --> LoadMessages
        LoadMessages --> JoinSocketRoom
        JoinSocketRoom --> ViewMessages
        ViewMessages --> SendMessage
        SendMessage --> BroadcastToRoom
        BroadcastToRoom --> ViewMessages
    }
```

</details>

---

## 5. Sequence Diagram (Swipe & Match Process)

> Shows the complete POST `/discovery/swipe` flow including onboarding assertion and mutual-match check.

![Sequence Diagram](svg/5_sequence_diagram.svg)

<details>
<summary>View Mermaid source</summary>

```mermaid
sequenceDiagram
    participant U as User Frontend
    participant DC as DiscoveryController
    participant DS as DiscoveryService
    participant MS as MatchingService
    participant MaS as MatchesService
    participant DB as MongoDB

    U->>+DC: POST /discovery/swipe toUserId action like

    DC->>+DS: swipeUser fromUserId toUserId like

    DS->>+MS: assertOnboardingCompleted fromUserId
    MS->>+DB: findUnique Profile and Preference
    DB-->>-MS: records exist
    MS-->>-DS: onboarding verified

    DS->>+DB: upsert Swipe fromUserId toUserId like
    DB-->>-DS: Swipe record

    DS->>+MaS: checkAndCreateMatch fromUserId toUserId

    MaS->>+DB: findUnique reverse Swipe where from equals toUserId to equals fromUserId
    DB-->>-MaS: reverse Swipe record

    alt Reverse swipe exists AND action equals like
        MaS->>MaS: canonicalize IDs userAId less than userBId
        MaS->>+DB: upsert Match userAId userBId
        DB-->>-MaS: Match record
        MaS-->>DS: matched true with match
    else No mutual like
        MaS-->>DS: matched false
    end

    deactivate MaS

    DS-->>-DC: swipe and matched result
    DC-->>-U: HTTP 200 response
```

</details>

---

## Corrections Applied

| Diagram | What was wrong | What was fixed |
|---|---|---|
| **Class** | Had `auth0id` on User, fake `UsersService` class, missing interfaces/abstract/patterns | Rebuilt from actual `class` declarations with all 7 interfaces, Strategy/Factory/Template Method patterns |
| **Use Case** | Only 2 actors, missing Google OAuth, uploads, preferences | 5 actors, 15 use cases, 7 system modules, external services |
| **ERD** | `auth0id` field, missing `passwordHash`/`googleId`/`updatedAt`, invalid `string[]` type | All fields match `schema.prisma`, correct cardinalities |
| **Activity** | Showed Conversation creation on match (wrong) | Conversation is lazily created in chat; added matching engine + socket steps |
| **Sequence** | Missing `assertOnboardingCompleted`, showed Conversation creation in MatchesService | Added onboarding check, removed incorrect Conversation step, added alt block |
