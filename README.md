# Flately

<div align="center">
  <a href="https://frontend-roan-one-suwo5dr71s.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/🚀_Live_Preview-View_Application-0F4C5C?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Preview"/>
  </a>
  <a href="https://www.overleaf.com/read/vmcwbjywptnd#2012eb" target="_blank">
    <img src="https://img.shields.io/badge/📄_Architecture-Overleaf_Report-47A248?style=for-the-badge&logo=overleaf&logoColor=white" alt="Overleaf Report"/>
  </a>
  <a href="https://drive.google.com/file/d/1UGyUvb7UpbkWTcGGqjuzGQ480eA0b9Iz/view?usp=sharing" target="_blank">
    <img src="https://img.shields.io/badge/📊_Project_Report-Google_Drive_PDF-EA4335?style=for-the-badge&logo=googledrive&logoColor=white" alt="PDF Report"/>
  </a>
</div>

![Flately Logo](docs/assets/logo.png)

![Flately animated heading](https://readme-typing-svg.demolab.com?font=Sora&weight=700&size=26&duration=2500&pause=900&color=0F4C5C&center=true&vCenter=true&width=980&lines=Flately+%E2%80%94+Roommate+Matching+Platform;Smart+Roommate+Discovery+with+Real-time+Chat;Built+with+TypeScript+from+Frontend+to+Backend)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=for-the-badge&logo=react&logoColor=111827)](https://react.dev/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8.3-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)

Flately helps users find compatible roommates through guided onboarding, weighted preference matching, and real-time messaging.

---

## The Team

The success of Flately is attributed to a highly coordinated and specialized team:

- **Mitul Bhatia**: Team Lead — Coordinated the entire project lifecycle and managed cross-module integrations.
- **Hardik Maheshwari**: Deployment & User Flow Lead — Spearheaded the deployment architecture and orchestrated the complete user journey.
- **Ajeesh Amreet**: Recommendation & Chat Engineer — Architected the core matching engine and implemented the live Socket.IO-based chat features.
- **Akshat Chauhan**: Database Lead — Designed the Entity-Relationship models and managed the MongoDB Atlas integration.
- **Suryansh Singh**: Strategic Lead, UI & Documentation Manager — Designed the minimalist UI, managed all structural diagrams, authored the core architectural reports, and guided strategic direction.

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

## 📊 UML Diagrams

All UML diagrams are verified against the actual TypeScript codebase. Each diagram has a Mermaid source (`.mmd`) and a rendered PNG.

> 📋 **Full Documentation**: [UML_DIAGRAMS.md](docs/UML_DIAGRAMS.md) | 🗺️ **Planning**: [Future Plan](docs/future-plan.md)

### Diagram Overview

| # | Diagram | What It Shows | Source | Image |
|---|---------|---------------|--------|-------|
| 1 | **Class Diagram** | 20 classes, 7 interfaces, Strategy/Factory/Template Method patterns | [.mmd](docs/svg/1_class_diagram.mmd) | [.png](docs/svg/1_class_diagram.png) |
| 2 | **Use Case Diagram** | 5 actors, 15 use cases across 7 system modules | [.mmd](docs/svg/2_usecase_diagram.mmd) | [.png](docs/svg/2_usecase_diagram.png) |
| 3 | **ERD** | 7 Prisma/MongoDB models with all FK/PK constraints | [.mmd](docs/svg/3_erd_diagram.mmd) | [.png](docs/svg/3_erd_diagram.png) |
| 4 | **Activity Diagram** | Full user journey: login → discovery → match → chat | [.mmd](docs/svg/4_activity_diagram.mmd) | [.png](docs/svg/4_activity_diagram.png) |
| 5 | **Sequence Diagram** | Swipe → onboarding check → mutual match creation | [.mmd](docs/svg/5_sequence_diagram.mmd) | [.png](docs/svg/5_sequence_diagram.png) |

---

### 🖼️ Visual Previews

#### 📐 1. Class Diagram — Architecture & Design Patterns

Shows all TypeScript classes, interfaces, abstract classes, and their relationships.

**Key Patterns**: Strategy, Factory, Template Method, Adapter, Singleton, Observer

![Class Diagram](./docs/svg/1_class_diagram.png)

[📄 View Mermaid Source](docs/svg/1_class_diagram.mmd)

---

#### 🎯 2. Use Case Diagram — Actor-System Interactions

Maps external actors to 15 system operations across 7 modules.

**Actors**: Guest User, Authenticated User, Google OAuth, Cloudinary CDN, Socket.IO Client

![Use Case Diagram](./docs/svg/2_usecase_diagram.png)

[📄 View Mermaid Source](docs/svg/2_usecase_diagram.mmd)

---

#### 🗄️ 3. Entity-Relationship Diagram — Database Schema

All 7 Prisma models with field types, primary keys, foreign keys, and cardinalities.

**Models**: User, Profile, Preference, Swipe, Match, Conversation, Message

![ERD Diagram](./docs/svg/3_erd_diagram.png)

[📄 View Mermaid Source](docs/svg/3_erd_diagram.mmd)

---

#### 🔄 4. Activity Diagram — Discovery, Matching & Chat Flow

End-to-end state flow from login through onboarding, discovery, matching, and real-time chat.

**Key Flows**: Authentication gates, onboarding checks, mutual match detection

![Activity Diagram](./docs/svg/4_activity_diagram.png)

[📄 View Mermaid Source](docs/svg/4_activity_diagram.mmd)

---

#### 🔀 5. Sequence Diagram — Swipe & Match Process

Complete `POST /discovery/swipe` interaction flow through all backend layers.

**Participants**: Frontend → Controller → Service → Matching → Matches → MongoDB

![Sequence Diagram](./docs/svg/5_sequence_diagram.png)

[📄 View Mermaid Source](docs/svg/5_sequence_diagram.mmd)

---

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

All verification complete as of 2026-05-03:

- ✅ Backend typecheck: pass
- ✅ Backend tests: pass  
- ✅ Backend build: pass
- ✅ Frontend typecheck: pass
- ✅ Frontend tests: pass
- ✅ Frontend build: pass
- ✅ Manual auth flows: verified

**Testing Guide**: [Manual Auth End-to-End Verification](docs/manual-auth-end-to-end-verification.md)

---

## 📚 Documentation

**[📖 Complete Documentation Index](docs/DOCUMENTATION.md)** - Master navigation for all documentation

### Quick Links

| Category | Documents |
|----------|-----------|
| **Getting Started** | [Setup](docs/project-setup.md) · [User Flow](docs/product-user-flow.md) · [Architecture](docs/architecture.md) |
| **Implementation** | [Backend Reference](docs/backend-code-reference.md) · [Frontend Guide](docs/frontend-guide.md) · [API Reference](docs/api-reference.md) |
| **Database** | [Schema](docs/database-schema.md) · [Matching Algorithm](docs/matching-algorithm.md) |
| **Testing** | [Auth Verification](docs/manual-auth-end-to-end-verification.md) |
| **Design** | [UML Diagrams](docs/UML_DIAGRAMS.md) · [System Design Study Guide](docs/class-first-system-design-study-guide.md) |
| **Planning** | [Future Plan](docs/future-plan.md) · [Historical Archive](docs/historical-archive.md) |

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
