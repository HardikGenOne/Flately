# Contract Matrix (REST + Socket)

> STATUS: Historical artifact. Phase 1 contract alignment is completed.
> Current source of truth: [../api-reference.md](../api-reference.md), [../frontend-guide.md](../frontend-guide.md), [../architecture.md](../architecture.md).
> Archive boundary guide: [../historical-archive.md](../historical-archive.md).

Date: 2026-04-04
Scope: PA-001 only (completed)

## REST Contract Matrix (Finalized)

| Flow | Canonical Contract | Legacy Alias | Current Status | Notes |
|---|---|---|---|---|
| Discovery feed load | `GET /discovery/feed` | `GET /discovery` | Completed | Alias is intentionally kept for backward compatibility. |
| Connect/like action | `POST /discovery/swipe` (body: `toUserId`, `action`) | `POST /matches/connect/:toUserId` | Completed | Alias maps to canonical like-swipe behavior. |
| My matches list | `GET /matches/me` | None | Completed | No compatibility shim needed. |
| Open chat by match | `GET /chat/:matchId` | None | Completed | No compatibility shim needed. |

## Socket Contract Matrix (Finalized)

| Capability | Canonical Event | Legacy Alias | Current Status | Notes |
|---|---|---|---|---|
| Join conversation room | `joinRoom` | `join` | Completed | Both are accepted during compatibility window. |
| Send message | `sendMessage` | `send_message` | Completed | Both are accepted during compatibility window. |
| Receive message | `message` | `new_message` | Completed | Both are emitted during compatibility window. |

## Message Payload Contract

| Field | Type | Contract |
|---|---|---|
| `id` | string | Stable |
| `senderId` | string | Stable |
| `content` | string | Stable |
| `createdAt` | string (ISO datetime) | Canonical timestamp field |
| `timestamp` | string (ISO datetime) | Legacy alias field |

## Completion Summary

- Canonical and alias REST contracts are now explicit and implemented.
- Canonical and alias socket contracts are now explicit and implemented.
- Compatibility adapters remain in place to avoid breaking existing clients.
