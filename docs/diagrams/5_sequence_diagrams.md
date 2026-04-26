# Sequence Diagrams — Flately

## Sequence Diagram 1: Authentication & User Sync (Google OAuth)

```mermaid
sequenceDiagram
    participant B as Browser
    participant G as Google OAuth
    participant AS as Auth Controller
    participant ST as Auth Strategy Factory
    participant GS as Google OAuth Strategy
    participant DB as Prisma / MongoDB

    B->>G: Authorize (Email/Profile scope)
    G-->>B: Redirect with Code + State
    B->>AS: GET /auth/google/callback?code=...
    AS->>ST: createOAuthStrategy("google")
    ST->>GS: completeAuthorization(code, state)
    
    GS->>G: Exchange Code for Token
    G-->>GS: Tokens + Profile (sub, email, name, pic)
    
    GS->>DB: prisma.user.findFirst({ googleId: profile.sub })
    alt User exists
        GS->>DB: prisma.user.update({ data: { name, picture } })
    else New user
        GS->>DB: prisma.user.create({ data: { email, googleId, ... } })
    end
    
    GS-->>AS: Auth Session (JWT)
    AS-->>B: HttpOnly Cookie / JSON Response
```

## Sequence Diagram 2: Discovery Feed Loading (Matching Engine)

```mermaid
sequenceDiagram
    participant FE as DiscoveryPage
    participant DC as Discovery Controller
    participant DS as Discovery Service
    participant MS as Matching Service
    participant ES as Eligibility Strategy
    participant SS as Scoring Strategy
    participant DB as Prisma / MongoDB

    FE->>DC: GET /discovery/feed (Bearer JWT)
    DC->>DS: getDiscoveryFeed(userId)

    DS->>MS: findMatchesForUser(userId)
    MS->>DB: prisma.profile.findUnique({ userId })
    MS->>DB: prisma.preference.findUnique({ userId })
    DB-->>MS: User Context

    MS->>DB: prisma.profile.findMany({ where: { not: userId } })
    MS->>DB: prisma.preference.findMany()
    DB-->>MS: Candidate Pool

    loop For each candidate
        MS->>ES: isEligible(userA, userB)
        ES-->>MS: true/false
        
        alt Eligible
            MS->>SS: calculateScore(prefA, prefB)
            SS-->>MS: weightedScore
        end
    end

    MS-->>DS: Ranked list of {userId, score}
    
    loop Enrichment
        DS->>DB: prisma.profile.findUnique(...)
        DS->>DS: generateTags(profile, preference)
    end

    DS-->>DC: Enriched Feed Array
    DC-->>FE: 200 JSON(feed)
```

## Sequence Diagram 3: Swipe Connect → Match Creation

```mermaid
sequenceDiagram
    participant FE as DiscoveryPage
    participant DC as Discovery Controller
    participant DS as Discovery Service
    participant MTS as Matches Service
    participant DB as Prisma / MongoDB

    FE->>DC: POST /discovery/swipe { toUserId, action: "like" }
    DC->>DS: swipeUser(userId, toUserId, "like")

    DS->>DB: prisma.swipe.upsert({ fromUserId, toUserId, action: "like" })
    DB-->>DS: Swipe Recorded

    DS->>MTS: checkAndCreateMatch(fromUserId, toUserId)
    MTS->>DB: prisma.swipe.findUnique({ fromUserId: toUserId, toUserId: fromUserId })

    alt Reverse like exists
        DB-->>MTS: reverseSwipe ("like")
        MTS->>DB: prisma.match.upsert({ userAId, userBId })
        MTS-->>DS: { matched: true, match }
        DS-->>DC: { success: true, matched: true }
        DC-->>FE: 200 JSON ({ matched: true })
    else No match
        DB-->>MTS: null
        MTS-->>DS: { matched: false }
        DS-->>DC: { success: true, matched: false }
        DC-->>FE: 200 JSON ({ matched: false })
    end
```

## Sequence Diagram 4: Real-Time Chat (Socket.IO)

```mermaid
sequenceDiagram
    participant A as User A (Browser)
    participant CC as Chat Controller
    participant CS as Chat Service
    participant DB as Prisma / MongoDB
    participant SIO as Socket.IO Server
    participant B as User B (Browser)

    A->>CC: GET /chat/:matchId
    CC->>CS: getOrCreateConversation(matchId)
    CS->>DB: prisma.conversation.upsert(...)
    DB-->>CS: Conversation Record

    CC->>CS: getMessages(conversationId)
    CS->>DB: prisma.message.findMany(...)
    DB-->>CS: History Array
    
    CC-->>A: { conversation, messages, otherUser }

    A-->>SIO: socket.emit("join", conversationId)
    B-->>SIO: socket.emit("join", conversationId)

    A->>SIO: socket.emit("send_message", { content })
    SIO->>CS: sendMessage(conversationId, senderId, content)
    CS->>DB: prisma.message.create(...)
    DB-->>CS: Message Persisted
    
    CS-->>SIO: Message Object
    SIO->>A: io.to(convo).emit("new_message")
    SIO->>B: io.to(convo).emit("new_message")
```

