# Sequence Diagrams — Flately

## Sequence Diagram 1: Authentication & User Sync

```mermaid
sequenceDiagram
    participant B as Browser
    participant A0 as Auth0 Hosted Login
    participant AS as AuthSync Component
    participant RX as Redux Store
    participant AX as Axios API Client
    participant UC as UsersController
    participant US as UsersService
    participant DB as Prisma / MongoDB

    B->>A0: loginWithRedirect()
    A0-->>B: Redirect with access_token
    B->>AS: useEffect triggers (isAuthenticated=true)
    AS->>RX: dispatch(setAuth(user))
    AS->>AX: apiRequest("/users/me", {}, getAccessTokenSilently)
    AX->>AX: getAccessTokenSilently() → JWT
    AX->>UC: GET /users/me (Bearer JWT)
    UC->>UC: checkJwt → validate RS256 against JWKS
    UC->>UC: attachUserId → req.userId = payload.sub
    UC->>US: getOrCreateUser({auth0Id, email, name, picture})
    US->>DB: prisma.user.findUnique({where: {auth0id}})
    alt User exists
        DB-->>US: User record
    else New user
        US->>DB: prisma.user.create({auth0id, email, name, picture})
        DB-->>US: New User record
    end
    US-->>UC: User
    UC-->>AX: 200 JSON(User)
    AX-->>AS: User data
```

## Sequence Diagram 2: Discovery Feed Loading

```mermaid
sequenceDiagram
    participant FE as DiscoveryPage
    participant AX as Axios Client
    participant DC as DiscoveryController
    participant DS as DiscoveryService
    participant MS as MatchingService
    participant DB as Prisma / MongoDB

    FE->>AX: GET /discovery/feed (Bearer JWT)
    AX->>DC: getFeed(req, res)
    DC->>DS: getDiscoveryFeed(userId)

    DS->>DB: prisma.swipe.findMany({where: {fromUserId: userId}})
    DB-->>DS: Existing swipes → excludedUserIds[]

    DS->>MS: findMatchesForUser(userId)
    MS->>DB: prisma.profile.findUnique({where: {userId}})
    MS->>DB: prisma.preference.findUnique({where: {userId}})
    DB-->>MS: User's profile + preference

    MS->>DB: prisma.profile.findMany({where: {userId: {not: userId}}})
    MS->>DB: prisma.preference.findMany()
    DB-->>MS: All candidate profiles + preferences

    loop For each candidate
        MS->>MS: isEligible(userA, userB) — city, budget, gender check
        alt Eligible
            MS->>MS: calculateScore(prefA, prefB) — weighted similarity
            MS->>MS: Push {userId, score} to results
        end
    end

    MS-->>DS: Sorted results [{userId, score}]
    DS->>DS: Filter out excludedUserIds

    loop For each filtered candidate
        DS->>DB: prisma.profile.findUnique({include: {user: true}})
        DS->>DB: prisma.preference.findUnique()
        DS->>DS: generateTags(profile, preference) — max 4 tags
    end

    DS-->>DC: Enriched feed array
    DC-->>AX: 200 JSON(feed)
    AX-->>FE: Display queue + profile details
```

## Sequence Diagram 3: Swipe Like → Mutual Match

```mermaid
sequenceDiagram
    participant FE as DiscoveryPage
    participant AX as Axios Client
    participant DC as DiscoveryController
    participant DS as DiscoveryService
    participant MTS as MatchesService
    participant DB as Prisma / MongoDB

    FE->>AX: POST /discovery/swipe {toUserId, action: "like"}
    AX->>DC: swipe(req, res)
    DC->>DC: Validate action (like|dislike|skip|superlike)
    DC->>DS: swipeUser(userId, toUserId, "like")

    DS->>DS: Normalize: "superlike"→"like", "skip"→"dislike"

    DS->>DB: prisma.swipe.upsert({fromUserId, toUserId, action: "like"})
    DB-->>DS: Swipe record

    DS->>MTS: checkAndCreateMatch(fromUserId, toUserId)
    MTS->>DB: prisma.swipe.findUnique({fromUserId: toUserId, toUserId: fromUserId})

    alt Reverse like exists
        DB-->>MTS: reverseSwipe (action="like")
        MTS->>MTS: Sort IDs: userAId = min(from, to), userBId = max(from, to)
        MTS->>DB: prisma.match.upsert({userAId, userBId})
        DB-->>MTS: Match record
        MTS-->>DS: {matched: true, match}
        DS-->>DC: {swipe, matched: true}
        DC-->>AX: 200 {success: true}
        AX-->>FE: Show "It's a Match!" notification
    else No reverse like
        DB-->>MTS: null or action≠"like"
        MTS-->>DS: {matched: false}
        DS-->>DC: {swipe, matched: false}
        DC-->>AX: 200 {success: true}
        AX-->>FE: Remove from queue, show next
    end
```

## Sequence Diagram 4: Real-Time Chat (Socket.IO)

```mermaid
sequenceDiagram
    participant A as User A (Browser)
    participant AX as Axios Client
    participant CC as ChatController
    participant CS as ChatService
    participant DB as Prisma / MongoDB
    participant SIO as Socket.IO Server
    participant B as User B (Browser)

    A->>AX: GET /chat/:matchId (Bearer JWT)
    AX->>CC: Openchat(req, res)
    CC->>CS: validateUserInMatch(matchId, userId)
    CS->>DB: prisma.match.findUnique({id: matchId})
    DB-->>CS: Match {userAId, userBId}
    CS-->>CC: true (user is participant)

    CC->>CS: getOrCreateConversation(matchId)
    CS->>DB: prisma.conversation.upsert({matchId})
    DB-->>CS: Conversation

    CC->>CS: getMessages(conversationId)
    CS->>DB: prisma.message.findMany({orderBy: createdAt asc})
    DB-->>CS: Message[]

    CC->>DB: prisma.profile.findUnique({userId: otherUserId})
    DB-->>CC: Other user's profile
    CC-->>AX: {conversation, messages, otherUser}
    AX-->>A: Render chat UI

    A->>SIO: socket.emit("join", conversationId)
    SIO->>SIO: socket.join(conversationId)

    B->>SIO: socket.emit("join", conversationId)
    SIO->>SIO: socket.join(conversationId)

    A->>A: Type message, optimistic UI append
    A->>SIO: socket.emit("send_message", {conversationId, senderId, content})
    SIO->>CS: sendMessage(conversationId, senderId, content)
    CS->>DB: prisma.message.create({conversationId, senderId, content})
    DB-->>CS: New Message
    CS-->>SIO: Message object
    SIO->>A: io.to(conversationId).emit("new_message", {id, senderId, content, timestamp})
    SIO->>B: io.to(conversationId).emit("new_message", {id, senderId, content, timestamp})
    B->>B: Append message to UI
```
