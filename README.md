# Flately

![Flately Logo](docs/assets/logo.png)

![Flately animated heading](https://readme-typing-svg.demolab.com?font=Sora&weight=700&size=26&duration=2500&pause=900&color=0F4C5C&center=true&vCenter=true&width=980&lines=Flately+%E2%80%94+Roommate+Matching+Platform;Smart+Roommate+Discovery+with+Real-time+Chat;Built+with+TypeScript+from+Frontend+to+Backend)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=for-the-badge&logo=react&logoColor=111827)](https://react.dev/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8.3-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)

Flately helps users find compatible roommates through guided onboarding, weighted preference matching, and real-time messaging.

---

## Product Summary

Flately solves a practical housing pain point: roommate decisions are high-risk and usually made with low-quality context.

Our app improves this by combining:

1. Structured user and lifestyle profiling
2. Preference-weighted match scoring
3. Mutual-interest conversion into direct chat

---

## Hero User Journey

```mermaid
flowchart LR
  Landing[Landing] --> Start[Questionnaire]
  Start --> Auth{Auth Choice}
  Auth --> Signup[Signup]
  Auth --> Login[Login]
  Auth --> Google[Google OAuth]

  Signup --> Onboarding[Onboarding]
  Login --> App[App Home]
  Google --> Callback[Callback]
  Callback --> App

  Onboarding --> App
  App --> Discover[Discover]
  Discover --> Matches[Matches]
  Matches --> Chat[Chat]
  App --> Profile[Profile]
```

Route mapping:

- Landing: `/`
- Questionnaire: `/start`
- Signup: `/signup`
- Login: `/login`
- Callback: `/auth/callback`
- Onboarding: `/app/onboarding`
- App Home: `/app`
- Discover: `/app/discover`
- Matches: `/app/matches`
- Chat: `/app/chat/:matchId?`
- Profile: `/app/profile`

---

## Architecture Diagram

```mermaid
%%{init: {'theme':'base','themeVariables': {
  'primaryColor':'#EDF7F6',
  'primaryTextColor':'#0F4C5C',
  'primaryBorderColor':'#0F4C5C',
  'lineColor':'#0F4C5C',
  'secondaryColor':'#F7F5EF',
  'tertiaryColor':'#FFFFFF'
}}}%%
flowchart LR
  subgraph FE[Frontend Layer]
    UI[React 19 + Vite 7]
    Store[Redux Toolkit]
    Guards[Auth Bootstrap + Route Guards]
    SocketClient[Socket.IO Client]
    UI --> Store --> Guards --> SocketClient
  end

  subgraph BE[Backend Layer]
    API[Express 5 API]
    JWT[JWT Middleware Chain]
    Domain[Domain Modules\nAuth, Profiles, Preferences, Discovery, Matches, Chat, Uploads]
    Realtime[Socket.IO Gateway]
    API --> JWT --> Domain
    Realtime --> Domain
  end

  subgraph DATA[Data + Services]
    DB[(MongoDB Atlas via Prisma)]
    OAuth[Google OAuth]
    Media[Cloudinary Signed Uploads]
  end

  FE -->|REST + Bearer JWT| API
  FE -->|WebSocket| Realtime
  Domain --> DB
  Domain --> OAuth
  Domain --> Media
```

---

## Tech Stack (Exact Versions)

### Frontend

| Technology | Version |
| --- | --- |
| React | 19.2.3 |
| Vite | 7.2.4 |
| TypeScript | 5.9.3 |
| Redux Toolkit | 2.11.2 |
| React Router DOM | 6.30.3 |
| Socket.IO Client | 4.8.3 |
| TailwindCSS | 4.1.18 |
| Framer Motion | 12.29.2 |
| React Hook Form | 7.71.1 |
| Zod | 4.3.5 |
| Playwright | 1.59.1 |

### Backend

| Technology | Version |
| --- | --- |
| Express | 5.2.1 |
| TypeScript | 5.9.3 |
| Prisma + Prisma Client | 6.19.2 |
| Socket.IO | 4.8.3 |
| jsonwebtoken | 9.0.3 |
| Zod | 3.23.8 |
| Helmet | 8.1.0 |
| express-rate-limit | 8.2.1 |
| tsx | 4.19.2 |
| Vitest | 2.1.8 |

---

## Diagram Library

All current UML and ERD diagrams are linked here.

| Diagram | SVG | PDF | Focus |
| --- | --- | --- | --- |
| 01 Class Diagram | [SVG](docs/svg/01-class-diagram.svg) | [PDF](docs/pdf/01-class-diagram.pdf) | Static architecture structure |
| 02 Object Diagram | [SVG](docs/svg/02-object-diagram.svg) | [PDF](docs/pdf/02-object-diagram.pdf) | Runtime object snapshot |
| 03 Use Case Diagram | [SVG](docs/svg/03-use-case-diagram.svg) | [PDF](docs/pdf/03-use-case-diagram.pdf) | Actor-system goals |
| 04 Activity Diagram | [SVG](docs/svg/04-activity-diagram.svg) | [PDF](docs/pdf/04-activity-diagram.pdf) | Process and guard flow |
| 05 Sequence Diagram | [SVG](docs/svg/05-sequence-diagram.svg) | [PDF](docs/pdf/05-sequence-diagram.pdf) | End-to-end interaction timing |
| 06 ERD Diagram | [SVG](docs/svg/06-erd-diagram.svg) | [PDF](docs/pdf/06-erd-diagram.pdf) | Data model and relationships |

### Highlighted (full-width)

Click any section below to expand diagram previews.

<!-- markdownlint-disable MD033 -->
<details>
<summary>Class Diagram (click to expand)</summary>

![Class Diagram](docs/svg/01-class-diagram.svg)

</details>

<details>
<summary>Object Diagram (click to expand)</summary>

![Object Diagram](docs/svg/02-object-diagram.svg)

</details>

<details>
<summary>Use Case Diagram (click to expand)</summary>

![Use Case Diagram](docs/svg/03-use-case-diagram.svg)

</details>

<details>
<summary>Activity Diagram (click to expand)</summary>

![Activity Diagram](docs/svg/04-activity-diagram.svg)

</details>

<details>
<summary>Sequence Diagram (click to expand)</summary>

![Sequence Diagram](docs/svg/05-sequence-diagram.svg)

</details>

<details>
<summary>ERD Diagram (click to expand)</summary>

![ERD Diagram](docs/svg/06-erd-diagram.svg)

</details>
<!-- markdownlint-enable MD033 -->

---

## Product Features Delivered

1. Authentication
   - Email/password signup and login
   - Backend-managed Google OAuth
   - JWT-protected app access

2. Onboarding + Profile Intelligence
   - Structured profile capture
   - Preference capture with weighted dimensions
   - Onboarding gate enforcement before discovery and matching

3. Discovery and Matching
   - Candidate feed retrieval
   - Swipe actions with mutual-like match creation logic

4. Real-time Chat
   - Match-scoped conversations
   - Socket.IO-based message delivery
   - Conversation and message persistence

5. Engineering Quality
   - Manual fetch transport with Adapter + Strategy architecture
   - Typed full-stack contracts and validation layers
   - Architecture and verification docs for reproducible delivery

---

## Local Setup (Demo Ready)

### Prerequisites

- Node.js >= 18
- npm >= 9
- MongoDB Atlas (or local Mongo)
- Google OAuth credentials
- Cloudinary credentials

### Run Backend

```bash
cd backend
npm install
npx prisma generate
npm run dev
```

Backend: [http://localhost:4000](http://localhost:4000)

### Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: [http://localhost:5174](http://localhost:5174)

### Health Check

```bash
curl http://localhost:4000/health
```

Expected response:

```json
{ "status": "ok" }
```

---

## Verification Snapshot

- Backend typecheck: pass
- Backend tests: pass
- Backend build: pass
- Frontend typecheck: pass
- Frontend tests: pass
- Frontend build: pass
- Manual auth and route-state verification: complete

Reference: [docs/manual-auth-end-to-end-verification.md](docs/manual-auth-end-to-end-verification.md)

---

## Documentation Index

- Setup: [docs/project-setup.md](docs/project-setup.md)
- Product flow: [docs/product-user-flow.md](docs/product-user-flow.md)
- Architecture: [docs/architecture.md](docs/architecture.md)
- API contract: [docs/api-reference.md](docs/api-reference.md)
- Database schema: [docs/database-schema.md](docs/database-schema.md)
- Frontend reference: [docs/frontend-guide.md](docs/frontend-guide.md)
- Backend reference: [docs/backend-code-reference.md](docs/backend-code-reference.md)
- Historical boundary: [docs/historical-archive.md](docs/historical-archive.md)

---

## Pitch Using This README Only

1. Open Product Summary to frame the problem.
2. Use Hero User Journey to explain conversion flow.
3. Present Architecture Diagram for technical depth.
4. Show Diagram Library to prove system rigor.
5. Close with Verification Snapshot for execution credibility.

Brand colors used in this README:

- #0F4C5C
- #0A3742
- #EDF7F6
- #F7F5EF
