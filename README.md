# Agnost Connect Prototype

A production-quality first-pass prototype of an agent interoperability + observability layer.

## What this repo now covers vs requirements
This repo **does satisfy the first-pass Track B requirement** for a full-stack integration mode:
- Framework-specific telemetry normalization into shared `AgentEvent`s.
- APIs that are directly usable for ingestion and trace retrieval.
- An integration endpoint designed for low-friction adapter-based onboarding.
- A minimal but usable dashboard for developer trace debugging.

## Stack
- Bun
- Next.js App Router + TypeScript
- Tailwind + shadcn/ui
- Drizzle ORM + PostgreSQL
- Zod
- Vercel AI SDK adapter (working)

## Features
- Universal `AgentEvent` schema via discriminated unions.
- Framework adapters (`vercel-ai` implemented; `openai-agents` and `mastra` return explicit 501 until implemented).
- Direct normalized ingestion API: `POST /api/events`.
- Integration-mode ingestion API: `POST /api/integrations/:framework/events`.
- Session and trace APIs: `GET /api/sessions`, `GET /api/sessions/[id]`.
- Append-only event storage using PostgreSQL JSONB payloads.
- Sessions dashboard + trace timeline UI.
- Rule-based trace insights:
  - Failed tool call highlighting
  - Retry detection
  - Frustration heuristics

## Integration Mode (Track B)
### Goal
Minimize onboarding friction for teams already shipping agents in Vercel AI SDK, OpenAI Agents SDK, or Mastra.

### Approach
1. Keep framework-native traces in app code.
2. Send raw trace payloads to:
   - `POST /api/integrations/vercel-ai/events`
   - `POST /api/integrations/openai-agents/events`
   - `POST /api/integrations/mastra/events`
3. Adapter registry maps framework → normalizer.
4. Normalized events are persisted in append-only store.

This avoids requiring users to adopt a new runtime/proxy and lets onboarding be a small transport + adapter mapping change.

## Setup
1. Install dependencies:
   ```bash
   bun install
   ```
2. Configure env:
   ```bash
   cp .env.example .env.local
   ```
3. Generate and run migrations:
   ```bash
   bun run db:generate
   bun run db:migrate
   ```
4. Start:
   ```bash
   bun run dev
   ```

## API Contracts
### POST /api/events
```json
{
  "sessionId": "sess_1",
  "framework": "vercel-ai",
  "events": [
    {
      "id": "evt_1",
      "sessionId": "sess_1",
      "framework": "vercel-ai",
      "timestamp": "2026-05-24T00:00:00.000Z",
      "eventType": "user_message",
      "content": "Find weather"
    }
  ]
}
```

### POST /api/integrations/:framework/events
```json
{
  "sessionId": "sess_1",
  "trace": {
    "sessionId": "sess_1",
    "steps": []
  }
}
```

## Reasoning Notes
See `REASONING.md` for major architecture decisions, rejected alternatives (including clustering), onboarding/distribution vision, and “month vs weekend” roadmap.
