# Architecture Diagram

```text
Framework Runtime (Vercel AI / OpenAI Agents / Mastra)
        |
        v
Integration Endpoint (/api/integrations/:framework/events)
        |
        v
Adapter Registry + Framework Normalizers
        |
        v
Universal AgentEvent Schema (discriminated union)
        |
        v
Ingestion API Validation (Zod)
        |
        v
PostgreSQL Event Store (sessions + append-only events JSONB)
        |
        v
Dashboard APIs (/api/sessions, /api/sessions/:id)
        |
        v
Trace UI + Rule-based Insights
```

## Why this shape
- One app, minimal moving parts.
- Explicit adapter boundary for SDK-specific semantics.
- Append-only immutable event history.
- JSONB for fast schema evolution in early-stage telemetry.
