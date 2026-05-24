# Architecture

```text
                   ┌──────────────────────────────────┐
                   │     Agnost Connect (Next.js 15)   │
                   │                                   │
  ┌──────────┐     │  POST /api/chat                   │
  │Playground│────▶│    streamText(onStepFinish) ──────┐│
  │   UI     │     │    normalize → AgentEvent[]        ││
  └──────────┘     │                                   ││
                   │  POST /api/events                 ││
  ┌──────────┐     │    (direct normalized ingestion) ─┤│
  │ External │────▶│                                   ││◀── Drizzle ORM
  │   SDK    │     │  POST /api/integrations/           ││
  └──────────┘     │    :framework/events              ││    ┌─────────────┐
                   │    adapter registry → normalize ──┘│    │ PostgreSQL  │
                   │                                   │    │ sessions    │
  ┌──────────┐     │  GET /api/sessions                │    │ events(JSONB)│
  │Dashboard │◀────│  GET /api/sessions/:id            │    └─────────────┘
  │   UI     │     │    + heuristic insights            │
  └──────────┘     │                                   │
                   └──────────────────────────────────┘
```

## Two integration modes

### 1. Live adapter hooking (playground)
`POST /api/chat` uses Vercel AI SDK's `streamText` with an `onStepFinish` callback.
Each step result — text, tool calls, tool results — is normalized into `AgentEvent` objects
and persisted to Postgres mid-stream. The playground polls `/api/sessions/:id` every 1.5s
so normalized events appear in the trace panel as the agent runs.

### 2. External SDK ingestion
`POST /api/integrations/:framework/events` accepts already-collected traces and normalizes
them through the adapter registry. The Vercel AI adapter is fully implemented;
OpenAI Agents and Mastra return 501 until built. `POST /api/events` accepts
pre-normalized `AgentEvent[]` payloads for zero-adapter direct ingestion.

## Key decisions

- **Single Next.js app** — one deployment surface, modular internally (`adapters`, `core`, `db`, `server`).
- **PostgreSQL + JSONB** — relational columns for stable query fields (`sessionId`, `eventType`, `timestamp`); JSONB for framework-specific payloads that evolve fast.
- **Adapter registry** — maps framework slug → normalizer. No central proxy, no new SDK lock-in.
- **Append-only storage** — immutable event history, no updates or deletes.
- **Heuristic insights** — rule-based (failed tools, retries, frustration signals). No ML in v1.
