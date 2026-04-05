# Flately — Project Setup & Development Guide

> Quick-start guide to set up the full-stack Flately project from scratch.

---

## Prerequisites

- **Node.js** ≥ 18 (recommended 22.x)
- **npm** ≥ 9
- **MongoDB Atlas** account (or a local MongoDB instance)
- **Auth0** tenant configured (see Auth0 Setup below)

---

## 1. Clone & Install

```bash
# Clone the repository
git clone <repo-url> flately-full_stack
cd flately-full_stack

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend/frontend
npm install
```

---

## 2. Backend Configuration

Create `backend/.env`:

```env
PORT=4000
DATABASE_URL="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/flately"
AUTH0_DOMAIN=<your-auth0-domain>.us.auth0.com
AUTH0_AUDIENCE=http://localhost:4000
FRONTEND_URL="http://localhost:5173"
```

### Generate Prisma Client

```bash
cd backend
npx prisma generate
```

### Seed Demo Data (Optional)

```bash
npm run seed         # Creates 8 demo users with matches and conversations
npm run seed:reset   # Removes all seed data
```

---

## 3. Auth0 Setup

### Create Auth0 Application

1. Go to [Auth0 Dashboard](https://manage.auth0.com/) → Applications → Create Application
2. Type: **Single Page Application**
3. Configure:
   - **Allowed Callback URLs**: `http://localhost:5173`
   - **Allowed Logout URLs**: `http://localhost:5173`
   - **Allowed Web Origins**: `http://localhost:5173`

### Create Auth0 API

1. Go to Auth0 Dashboard → APIs → Create API
2. **Identifier (audience)**: `http://localhost:4000`
3. **Signing Algorithm**: RS256

### Frontend `.env.example`

Create `frontend/frontend/.env.example` (and copy values into `frontend/frontend/.env` for local development):

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_SOCKET_URL=http://localhost:4000
VITE_AUTH0_DOMAIN=<your-auth0-domain>.us.auth0.com
VITE_AUTH0_CLIENT_ID=<your-auth0-client-id>
VITE_AUTH0_AUDIENCE=http://localhost:4000
```

Auth0 and transport values are loaded at runtime from `frontend/frontend/src/config/runtimeConfig.ts` and consumed by `main.tsx`, API client, and socket client.

---

## 4. Run the Application

### Terminal 1 — Backend

```bash
cd backend
npm run dev
# Output: Server + Socket running on port 4000
```

### Terminal 2 — Frontend

```bash
cd frontend/frontend
npm run dev
# Output: Local: http://localhost:5173
```

### Verify

- **Backend health**: `curl http://localhost:4000/health` → `{ "status": "ok" }`
- **Frontend**: Open `http://localhost:5173` in your browser

---

## 5. Project Directory Structure

```
flately-full_stack/
├── backend/
│   ├── .env                    # Environment variables
│   ├── package.json            # Backend dependencies
│   ├── tsconfig.json           # TypeScript config
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema (6 models)
│   │   ├── seed.ts             # Demo data seeder
│   │   └── seed.js             # Compiled seeder
│   └── src/
│       ├── app.ts              # Express app setup
│       ├── server.ts           # HTTP + Socket.IO server
│       ├── config/             # Environment + Prisma config
│       ├── middlewares/        # Auth0 JWT middleware
│       ├── modules/            # Feature modules (controller/service/routes)
│       └── types/              # TypeScript interfaces
├── frontend/
│   └── frontend/
│       ├── index.html          # Entry HTML
│       ├── package.json        # Frontend dependencies
│       ├── vite.config.js      # Vite configuration
│       └── src/
│           ├── main.tsx        # App entry (Auth0 + Redux + Router)
│           ├── index.css       # Design tokens
│           ├── app/            # Router, store, layout
│           ├── pages/          # Page components
│           ├── features/       # Feature modules (slice + page)
│           ├── components/     # Shared UI components
│           ├── services/       # API client
│           └── types/          # TypeScript interfaces
└── docs/                       # This documentation
```

---

## 6. Available Scripts

### Backend (`cd backend`)

| Script | Command | Purpose |
|---|---|---|
| `dev` | `tsx watch src/server.ts` | Dev server with hot reload |
| `start` | `tsx src/server.ts` | Production start (via tsx) |
| `build` | `tsc` | Compile TypeScript to `dist/` |
| `start:prod` | `node dist/server.js` | Run compiled JS |
| `test` | `vitest run` | Run backend test suite once |
| `test:watch` | `vitest` | Run backend tests in watch mode |
| `test:coverage` | `vitest run --coverage` | Run tests with coverage output |
| `seed` | `tsx prisma/seed.ts` | Seed 8 demo users |
| `seed:reset` | `tsx prisma/seed.ts --reset` | Remove demo data |
| `typecheck` | `tsc --noEmit` | Type checking only |

### Frontend (`cd frontend/frontend`)

| Script | Command | Purpose |
|---|---|---|
| `dev` | `vite` | Dev server on port 5173 |
| `build` | `vite build` | Production build to `dist/` |
| `preview` | `vite preview` | Preview production build |
| `lint` | `eslint .` | Run linter |
| `storybook` | `storybook dev -p 6006` | Component storybook |
| `build-storybook` | `storybook build` | Build storybook static |

---

## 7. Documentation Index

| File | Contents |
|---|---|
| [`architecture.md`](./architecture.md) | System architecture, tech stack, auth flow, module structure, routing map |
| [`database-schema.md`](./database-schema.md) | ER diagram, Prisma schema, relationships, field enums, seed data |
| [`api-reference.md`](./api-reference.md) | All REST + Socket.IO endpoints with request/response examples |
| [`matching-algorithm.md`](./matching-algorithm.md) | Compatibility algorithm deep-dive with formulas and worked examples |
| [`frontend-guide.md`](./frontend-guide.md) | Frontend architecture, design system, page breakdowns, Redux slices |
| [`backend-code-reference.md`](./backend-code-reference.md) | Current backend architecture baseline with compatibility snippets |
| [`minimal-ui-redesign-plan.md`](./minimal-ui-redesign-plan.md) | Forward plan for minimal frontend redesign and verification-first rollout |
| [`project-setup.md`](./project-setup.md) | This file — setup, scripts, directory structure |

---

## 8. Key Architecture Decisions

1. **MongoDB + Prisma** — Chosen for flexible schema and fast prototyping. Prisma provides type-safe queries without native MongoDB driver boilerplate.

2. **Auth0** — Delegated authentication eliminates the need to build password handling, MFA, social login, and token management from scratch.

3. **Redux Toolkit** — Centralized state management for authenticated user state, discovery feed, matches, and chat conversations across all pages.

4. **Socket.IO** — Enables real-time chat without polling. Messages are persisted to MongoDB and broadcast to all users in the conversation room.

5. **Module Pattern** — Each backend feature is self-contained: `routes.ts` → `controller.ts` → `service.ts`. Controllers handle HTTP I/O, services contain business logic.

6. **TailwindCSS v4** — Uses the new `@theme` directive for design tokens and `@import "tailwindcss"` for setup. Custom tokens defined for the green command-center aesthetic.

7. **Monorepo (simple)** — Backend and frontend are separate npm packages in the same repo, not managed by Turborepo/Nx. Each runs independently.
