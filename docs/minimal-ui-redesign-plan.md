# Minimal UI Redesign Plan

Last updated: 2026-04-05
Owner scope: UI-001, UI-002, UI-003 with DS-001 to DS-006 contract preservation

## 1) Objective

Deliver a minimal, low-risk frontend redesign that improves route clarity and UX consistency without changing backend contracts, API behavior, socket behavior, or matching logic outputs.

## 2) Non-Negotiable Constraints

- Docs and implementation must preserve backend compatibility contracts.
- Canonical and alias REST contracts must remain explicit during rollout:
  - Canonical: `GET /discovery/feed`, `POST /discovery/swipe`
  - Aliases: `GET /discovery`, `POST /matches/connect/:toUserId`
- Canonical and alias socket contracts must remain explicit during rollout:
  - Canonical: `joinRoom`, `sendMessage`, `message`
  - Aliases: `join`, `send_message`, `new_message`
- Socket message payload must keep both string timestamps:
  - `createdAt`
  - `timestamp`
- No redesign step may silently alter matching/discovery/matches/chat behavior.
- Verification-first execution is required before and after each design phase.

## 3) Route Coverage Matrix

| Route | Router Support | Sidebar Link | Target State | Priority |
|---|---|---|---|---|
| `/app` | Yes | Yes | Keep as dashboard landing | P0 |
| `/app/discover` | Yes | Yes (`Discovery`) | Surfaced in primary sidebar navigation | P1 (D1-007) |
| `/app/matches` | Yes | Yes | Keep | P0 |
| `/app/chat/:matchId?` | Yes | Yes (`/app/chat`) | Keep | P0 |
| `/app/onboarding` | Yes | No | Keep as flow-only route | P1 |
| `/app/calendar` | Yes (placeholder) | Yes | Route closed with policy A placeholder | P0 (UI-001) |
| `/app/filters` | Yes (placeholder) | Yes | Route closed with policy A placeholder | P0 (UI-002) |
| `/app/settings` | Yes (placeholder) | Yes | Route closed with policy A placeholder | P0 (UI-003) |

## 4) Algorithm Verification Matrix

| Area | What Must Stay Stable | Verification Method | Pass Criteria |
|---|---|---|---|
| Matching | Ranking semantics and deterministic tie-order | Golden service tests + snapshot diff | No output drift for existing fixtures |
| Discovery | Feed contract, filtering semantics, enrichment payload shape | API response snapshots + smoke flow | Same fields/order semantics for existing clients |
| Matches | `GET /matches/me` payload semantics | API snapshot + UI regression checks | No field regressions in list rendering |
| Chat | Socket event compatibility and dual timestamp payload | Socket integration test + UI send/receive test | Canonical and alias events both function; `createdAt` and `timestamp` both present |

## 5) Phased Execution Plan

### Design-0 (Stabilize Navigation and Contracts)

Policy decision (locked):
- Policy A approved: keep Calendar/Filters/Settings sidebar items visible and clickable by adding protected placeholder routes now.

Goals:
- Resolve sidebar to router mismatches for calendar, filters, and settings.
- Add explicit transport contract notes in frontend implementation docs and checklists.
- Add route-level placeholders where needed to prevent dead links.

Deliverables:
- Route decision record for each unresolved sidebar link.
- Updated router/sidebar mapping with no broken navigation state.
- Verification baseline captured for matching/discovery/matches/chat flows.

Design-0 implementation status (2026-04-05):
- D0-001 route closure: implemented via protected placeholders for `/app/calendar`, `/app/filters`, `/app/settings`.
- D0-002 sidebar treatment: implemented via clickable links with explicit "Coming soon" indicator badges.
- D0-003 docs decision sync: implemented in redesign and frontend architecture docs.
- D0-004 worklog update: implemented in phase worklog.
- D0-005 quick verification notes: recorded as diagnostics-first checks after scoped edits.

Exit criteria:
- No unresolved sidebar links remain in shipped nav.
- Baseline verification matrix passes.

### Design-1 (Minimal Visual and Layout Coherence Pass)

Goals:
- Improve page-level consistency (spacing, hierarchy, nav context, state placeholders).
- Preserve current feature behavior and transport contracts.
- Keep onboarding/discovery/matches/chat interactions functionally equivalent.

Deliverables:
- Updated layout and page shells with consistent interaction states.
- No contract changes at API/socket boundaries.
- Before/after screenshots and behavior checklist.

Design-1 implementation status (2026-04-05):
- D1-001 shell geometry alignment: implemented with stable sidebar + content shell geometry and removed unused animated margin coupling.
- D1-002 outer container rhythm normalization: implemented with consistent page-level paddings and bounded content wrappers across dashboard/discovery/matches/chat.
- D1-004 overflow/panel width harmonization: implemented with responsive panel/table overflow handling and aligned panel width behavior across multi-panel pages.
- D1-005 empty/loading visual standardization: implemented with shared spinner and dashed empty-state patterns on discovery/matches/chat pages.
- D1-006 docs + worklog traceability: implemented via synchronized updates in redesign plan, frontend guide, and pre-documentation worklog.
- D1-007 discovery nav IA decision: implemented by surfacing `/app/discover` in primary sidebar navigation, with no route path or contract changes.

Exit criteria:
- All critical user flows are behavior-equivalent.
- Verification matrix passes after UI updates.

### Design-2 (Interaction Polish and Readability)

Goals:
- Improve readability and UX feedback (loading/empty/error states, visual affordances).
- Reduce confusion in multi-panel pages (discover/chat/matches).
- Keep all compatibility adapters active and documented.

Deliverables:
- Polished interaction states and route-level UX refinements.
- Regression summary against baseline behavior.
- Alias contract retention note for rollout safety.

Design-2 implementation status (2026-04-05):
- D2-001 state clarity: implemented explicit loading, empty, and error rendering on discovery/matches/chat with readable state copy and retry affordances where load can fail.
- D2-002 affordance honesty: implemented disable/relabel treatment for non-wired controls (search/filter previews, pagination, utility actions) to prevent implied behavior.
- D2-003 keyboard/focus semantics: implemented keyboard-first thread/profile selection controls and stronger focus-visible/readability semantics on primary interactive actions.
- D2-004 docs traceability: synchronized Design-2 execution notes in redesign plan, frontend guide, and pre-documentation worklog.
- guardrails confirmation: no endpoint/event/payload/path changes; no transport-semantic edits; no backend edits.
- verification snapshot:
  - frontend: `npm run lint` pass.
  - frontend: `npm run build` pass (existing chunk-size warning retained).
  - backend: `npm test` pass (27/27).
  - backend: `npm run typecheck` pass.
  - diagnostics: changed Design-2 files reviewed with editor diagnostics; only non-blocking style hints remain in legacy class/style surfaces.

Exit criteria:
- No regressions in core flows.
- Verification matrix passes in full.

## 6) Acceptance Gates

- Gate A: Route integrity
  - No sidebar item points to an undefined route.
- Gate B: Contract stability
  - Canonical and alias REST/socket contracts remain documented and operational.
- Gate C: Payload integrity
  - Socket message payload includes both `createdAt` and `timestamp` strings.
- Gate D: Flow integrity
  - Discovery load, swipe/connect, matches load, chat join/send/receive all pass smoke checks.
- Gate E: Regression confidence
  - Matching/discovery/matches/chat verification matrix passes before phase promotion.

## 7) Out of Scope

- Backend endpoint redesign.
- Matching algorithm behavior changes.
- Database schema changes.
- Removal of compatibility aliases in this redesign track.
- Large visual rebranding unrelated to route and interaction clarity.
