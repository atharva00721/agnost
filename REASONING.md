# 1. Problem Framing

Agent integrations are fragmented because each framework emits different runtime primitives.

- **Vercel AI SDK** is message/stream centric with UI-driven events.
- **OpenAI Agents SDK** is run/step centric with explicit tool and lifecycle semantics.
- **Mastra** is workflow and orchestration centric.

These are all valid abstractions, but they are not interoperable by default. A team using two frameworks ends up with two trace formats, two debugging paths, and two analytics models.

Normalized telemetry matters because reliability work (tool failures, retries, fallback behavior, user frustration patterns) must be measured consistently across runtimes.

AI-agent observability differs from traditional app observability: semantic correctness and tool behavior are first-class, not just latency/error counters.

# 2. Design Goals

- Low onboarding friction
- Framework-agnostic architecture
- Append-only event model
- Extensibility via adapter boundary
- Developer-first experience
- Progressive complexity

I prioritized simplicity because this is a seed-stage infra MVP. The fastest way to learn is to make ingestion and trace visibility immediate, then evolve.

# 3. Architecture Decisions

## Why single Next.js app instead of monorepo?
- Faster iteration
- Lower operational overhead
- One deployment surface
- Still modular internally (`adapters`, `core`, `db`, `server`)

## Why PostgreSQL + JSONB?
- Telemetry payloads evolve quickly
- Different frameworks produce heterogeneous structures
- JSONB preserves raw payload flexibility
- Relational columns still support stable querying (`sessionId`, `eventType`, `timestamp`)

## Why adapters instead of proxy architecture?
- Lower integration friction
- Framework-native instrumentation remains intact
- Less runtime lock-in
- Easier local debugging and adoption

## Why append-only event storage?
- Immutable execution history
- Better auditability and postmortems
- Deterministic trace reconstruction
- Future replay capability

## Why no clustering algorithm in v1?
I intentionally did **not** ship clustering in this weekend scope. Clustering requires higher event volumes, stronger semantics, and feedback loops for cluster quality. Shipping naive clustering early adds complexity and likely creates misleading insights.

The v1 choice is rule-based insights (failed tools, retries, repeated user messages), which are transparent and debuggable.

# 4. Tradeoffs and Rejected Alternatives

Intentionally excluded:
- Kafka / Redis / queues
- Microservices
- Realtime streaming infra
- Vector DB + semantic search
- Authentication / tenancy stack
- Distributed tracing vendor integration
- Early clustering pipelines

Why excluded: each adds operational or product complexity before we validate the core interoperability loop.

# 5. Integration Mode, Onboarding, and Distribution Vision

## Integration mode shipped
`POST /api/integrations/:framework/events` accepts framework-specific traces and normalizes through an adapter registry. This is the low-friction path: keep existing agent runtime code, add a small ingestion client.

## How we minimize friction
- No proxy process required
- No new runtime SDK lock-in
- Minimal required payload (`sessionId`, raw `trace`)
- Shared normalized schema downstream

## Distribution vision
Long-term, onboarding should feel like adding “observability middleware”:
1. install lightweight package,
2. register framework adapter,
3. emit traces,
4. immediately get consistent dashboards/evals.

# 6. Future Vision

Agents should evolve from isolated apps into interoperable runtime systems. This platform can become:
- OpenTelemetry-compatible for agent spans/events
- Protocol-driven for cross-framework telemetry contracts
- Replayable for deterministic debugging
- Eval-aware for quality/regression analysis
- Registry-backed for cross-agent capability discovery

# 7. What I Would Build With a Month (vs a Weekend)

- Realtime stream ingestion + live trace tailing
- Semantic trace search and grouping
- Versioned prompt/tool lineage
- Replay sandbox with step-level state inspection
- Multi-project tenancy/auth + ingestion keys
- OpenTelemetry bridge and exporter
- **Clustering done correctly**:
  - embed trace segments,
  - cluster by failure/retry/fallback signatures,
  - evaluate cluster usefulness with human feedback,
  - expose clusters as debugging queues, not vanity charts.
