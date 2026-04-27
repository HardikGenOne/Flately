# Flately UML Diagrams

This document contains all the UML diagrams for the Flately project in Mermaid format.

## 1. Class Diagram (Verified)

![Class Diagram](images/uml/class_diagram.png)

```mermaid
classDiagram
    class User {
        +String id
        +String auth0id
        +String email
        +String name
        +String picture
        +DateTime createdAt
    }

    class Profile {
        +String id
        +String userId
        +String name
        +Int age
        +String gender
        +String bio
        +Array photos
        +String city
        +Boolean hasRoom
        +String occupation
        +String sleepSchedule
        +Int noiseLevel
        +String guestPolicy
        +String smoking
        +String pets
        +Boolean onboardingCompleted
        +DateTime createdAt
        +DateTime updatedAt
    }

    class Preference {
        +String id
        +String userId
        +String genderPreference
        +Int minBudget
        +Int maxBudget
        +String city
        +Int cleanliness
        +Int sleepSchedule
        +Boolean smoking
        +Boolean drinking
        +Boolean pets
        +Int socialLevel
        +Int weightCleanliness
        +Int weightSleep
        +Int weightHabits
        +Int weightSocial
        +DateTime createdAt
        +DateTime updatedAt
    }

    class Swipe {
        +String id
        +String fromUserId
        +String toUserId
        +String action
        +DateTime createdAt
    }

    class Match {
        +String id
        +String userAId
        +String userBId
        +DateTime createdAt
    }

    class Conversation {
        +String id
        +String matchId
        +DateTime createdAt
    }

    class Message {
        +String id
        +String conversationId
        +String senderId
        +String content
        +DateTime createdAt
    }

    class MatchingService {
        +isEligible(userA, userB) boolean
        +similarityScore(a, b) number
        +booleanScore(a, b) number
        +calculateScore(prefA, prefB) number
        +findMatchesForUser(userId) Array
    }

    class DiscoveryService {
        +getDiscoveryFeed(userId) Array
        +swipeUser(fromId, toId, action) SwipeResult
        -generateTags(profile, pref) Array
    }

    class MatchesService {
        +checkAndCreateMatch(fromId, toId) MatchCheckResult
        +getMyMatches(userId) Array
        -generateMatchTags(profile, pref) Array
    }

    class ChatService {
        +getOrCreateConversation(matchId) Conversation
        +getMessages(conversationId) Message[]
        +sendMessage(convoId, senderId, content) Message
        +validateUserInMatch(matchId, userId) boolean
    }

    class ProfilesService {
        +getProfileByUserId(userId) Profile
        +createOrUpdateProfile(userId, data) Profile
    }

    class PreferencesService {
        +getPreferences(userId) Preference
        +savePreferences(userId, data) Preference
        -validateWeights(weights) boolean
    }

    class UsersService {
        +getOrCreateUser(data) User
    }

    class PrismaClient {
        <<Singleton>>
        +user
        +profile
        +preference
        +swipe
        +match
        +conversation
        +message
    }

    User "1" -- "0..1" Profile : has
    User "1" --> "0..1" Preference : sets
    User "1" --> "*" Swipe : performs
    Match "1" --> "0..1" Conversation : owns
    Conversation "1" -- "*" Message : contains

    UsersService --> PrismaClient : queries
    ProfilesService --> PrismaClient : queries
    PreferencesService --> PrismaClient : queries
    MatchingService --> PrismaClient : queries
    DiscoveryService --> PrismaClient : queries
    MatchesService --> PrismaClient : queries
    ChatService --> PrismaClient : queries

    DiscoveryService --> MatchingService : uses findMatchesForUser
    DiscoveryService --> MatchesService : uses checkAndCreateMatch
```

## 2. Use Case Diagram

![Use Case Diagram](images/uml/usecase_diagram.png)

```mermaid
graph TD
    User((Registered User))
    Guest((Guest))

    Guest --> Login(Login / Register)
    
    User --> Onboarding(Complete Onboarding)
    User --> Profile(Manage Profile)
    User --> Discovery(Browse Roommates)
    User --> Swipe(Swipe Like/Skip)
    User --> Match(View Matches)
    User --> Chat(Chat with Matches)

    subgraph "Core Functionality"
    Discovery -.-> Tags(View Compatibility Tags)
    Swipe -.-> MatchCheck(Mutual Match Check)
    MatchCheck --> Notification(Match Notification)
    end
```

## 3. Entity-Relationship Diagram (ERD)

![ER Diagram](images/uml/erd_diagram.png)

```mermaid
erDiagram
    USER ||--|| PROFILE : "has"
    USER ||--|| PREFERENCE : "sets"
    USER ||--o{ SWIPE : "performs"
    USER ||--o{ MATCH : "participates"
    MATCH ||--|| CONVERSATION : "owns"
    CONVERSATION ||--o{ MESSAGE : "contains"
    USER ||--o{ MESSAGE : "sends"

    USER {
        string id PK
        string auth0id UK
        string email UK
        string name
        string picture
        datetime createdAt
    }

    PROFILE {
        string id PK
        string userId FK
        string name
        int age
        string gender
        string bio
        string[] photos
        string city
        boolean hasRoom
        string occupation
        string sleepSchedule
        int noiseLevel
        string guestPolicy
        string smoking
        string pets
        boolean onboardingCompleted
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
```

## 4. Activity Diagram (Discovery & Matching)

![Activity Diagram](images/uml/activity_diagram.png)

```mermaid
stateDiagram-v2
    [*] --> Login
    Login --> Onboarding: New User
    Login --> DiscoveryFeed: Existing User
    Onboarding --> DiscoveryFeed: Done
    
    state DiscoveryFeed {
        [*] --> FetchCandidates
        FetchCandidates --> ViewProfile
        ViewProfile --> SwipeRight: Like
        ViewProfile --> SwipeLeft: Skip
        SwipeLeft --> FetchCandidates: Next
        
        state SwipeRight {
            [*] --> RecordSwipe
            RecordSwipe --> CheckMutualMatch
            CheckMutualMatch --> CreateMatch: It's a Match!
            CheckMutualMatch --> FetchCandidates: No match yet
            CreateMatch --> NotifyUser
            NotifyUser --> FetchCandidates
        }
    }
    
    DiscoveryFeed --> Chat: Go to Matches
    Chat --> ViewMessages
    ViewMessages --> SendMessage
    SendMessage --> ViewMessages
```

## 5. Sequence Diagram (Matching Process)

![Sequence Diagram](images/uml/sequence_diagram.png)

```mermaid
sequenceDiagram
    participant U as User (Frontend)
    participant D as DiscoveryController
    participant DS as DiscoveryService
    participant MS as MatchingService
    participant MT as MatchesService
    participant DB as Prisma (Database)

    U->>D: Swipe Right (toUserId)
    D->>DS: swipeUser(fromId, toId, 'like')
    DS->>DB: Record Swipe (upsert)
    DS->>MT: checkAndCreateMatch(fromId, toId)
    MT->>DB: Check if toUserId also liked fromId
    DB-->>MT: Mutual Like Found
    MT->>DB: Create Match Record
    MT->>DB: Create Conversation
    MT-->>DS: { matched: true, matchId: '...' }
    DS-->>D: { swipe, matched: true }
    D-->>U: HTTP 200 (Matched!)
```
