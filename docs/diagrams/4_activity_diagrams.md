# Activity Diagrams — Flately

## Activity Diagram 1: User Registration & Onboarding Flow

```mermaid
stateDiagram-v2
    [*] --> LandingPage

    LandingPage --> AuthChoice : Click Get Started
    AuthChoice --> GoogleOAuth : Google Login
    AuthChoice --> EmailAuth : Email Login/Signup
    
    GoogleOAuth --> AuthSync : OAuth Callback
    EmailAuth --> AuthSync : Auth Success

    state AuthSync {
        [*] --> CheckUserRecord
        CheckUserRecord --> DispatchSetAuth : User Ready
        DispatchSetAuth --> FetchProfile : GET /profiles/me
    }

    AuthSync --> CheckOnboarding : Profile loaded
    CheckOnboarding --> OnboardingWizard : onboardingCompleted=false
    CheckOnboarding --> Dashboard : onboardingCompleted=true

    state OnboardingWizard {
        [*] --> Step1_Identity
        Step1_Identity --> Step2_Housing : Next
        Step2_Housing --> Step3_Budget : Next
        Step3_Budget --> Step4_Lifestyle : Next
        Step4_Lifestyle --> Step5_Priorities : Next
        Step5_Priorities --> Step6_Review : Next
        Step6_Review --> SubmitOnboarding : Finish
    }

    state SubmitOnboarding {
        [*] --> SaveProfile
        SaveProfile --> SavePreferences : POST /profiles/me
        SavePreferences --> NavigateToDashboard : POST /preferences/me
    }

    OnboardingWizard --> Dashboard
    Dashboard --> [*]
```

## Activity Diagram 2: Discovery Feed & Swipe Flow

```mermaid
stateDiagram-v2
    [*] --> OpenDiscoveryPage

    state OpenDiscoveryPage {
        [*] --> FetchFeed
        FetchFeed --> GetCandidateFeed : GET /discovery/feed
        GetCandidateFeed --> RunMatchingEngine : Process Candidates

        state RunMatchingEngine {
            [*] --> FetchAllOptions
            FetchAllOptions --> EligibilityFilter
            EligibilityFilter --> CheckCity : EligibilityStrategy
            CheckCity --> CheckBudget : Budget overlap
            CheckBudget --> CheckGender : Preferred gender
            CheckGender --> CalculateScore : ScoringStrategy
            CalculateScore --> RankResults : Sort by compatibility
        }

        RunMatchingEngine --> EnrichData : List of {userId, score}
        EnrichData --> GenerateTags : Add profile metadata
        GenerateTags --> ReturnFeed : Final candidates array
    }

    OpenDiscoveryPage --> DisplayQueue : Feed loaded
    DisplayQueue --> ViewProfileDetail : Select candidate

    ViewProfileDetail --> SwipeLike : Click Connect
    ViewProfileDetail --> SwipeSkip : Click Pass

    SwipeSkip --> RecordSkipSwipe : POST /discovery/swipe (dislike)
    RecordSkipSwipe --> RemoveFromQueue
    RemoveFromQueue --> DisplayQueue : Next candidate

    SwipeLike --> RecordLikeSwipe : POST /discovery/swipe (like)
    RecordLikeSwipe --> CheckMutualLike

    state CheckMutualLike {
        [*] --> QueryReverseSwipe
        QueryReverseSwipe --> NoMatch : No reverse like
        QueryReverseSwipe --> MutualMatch : Reverse like found
        MutualMatch --> CreateMatch : Upsert Match record
    }

    CheckMutualLike --> MatchNotification : matched=true
    CheckMutualLike --> RemoveFromQueue : matched=false
    MatchNotification --> RemoveFromQueue

    RemoveFromQueue --> DisplayQueue
    DisplayQueue --> [*] : Queue empty
```

## Activity Diagram 3: Real-Time Chat Flow

```mermaid
stateDiagram-v2
    [*] --> OpenChatPage

    OpenChatPage --> FetchMatches : GET /matches/me
    FetchMatches --> DisplayMatchList : Show matched users

    DisplayMatchList --> SelectMatch : Click on match
    SelectMatch --> LoadConversation : GET /chat/:matchId

    state LoadConversation {
        [*] --> ValidateAccess
        ValidateAccess --> GetOrCreateConvo : Participant check
        GetOrCreateConvo --> FetchMessages : Load message history
        FetchMessages --> FetchProfile : Load other user details
    }

    LoadConversation --> DisplayChat : Messages loaded
    DisplayChat --> JoinSocketRoom : socket.emit join

    state SendMessageFlow {
        [*] --> TypeMessage
        TypeMessage --> OptimisticAppend : Press Send
        OptimisticAppend --> EmitSocketMessage : Local update
        EmitSocketMessage --> ServerPersist : socket.emit send_message
        ServerPersist --> BroadcastMessage : Save to DB
        BroadcastMessage --> Receipt : Other user notified
    }

    DisplayChat --> SendMessageFlow : Interact
    SendMessageFlow --> DisplayChat
    DisplayChat --> [*]
```

