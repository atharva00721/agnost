import Link from "next/link";
import { Activity, ArrowRight, Braces, Code2, Cpu, Layers, MessageSquare, Network, Play } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSessionsList } from "@/src/server/events";

export default async function HomePage() {
  const sessions = await getSessionsList();
  const totalEvents = sessions.reduce((sum, s) => sum + (s.eventCount ?? 0), 0);
  const frameworks = [...new Set(sessions.map((s) => s.framework))];

  return (
    <div className="min-h-screen bg-background text-zinc-100">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600">
              <Network className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-tight">Agnost Connect</span>
            <Badge className="ml-1 border-blue-800 bg-blue-950/50 text-blue-300">v0.1</Badge>
          </div>
          <nav className="flex items-center gap-1">
            <Link
              href="/playground"
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-zinc-200"
            >
              <Play className="h-3.5 w-3.5" />
              Playground
            </Link>
            <Link
              href="/sessions"
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-zinc-200"
            >
              <Activity className="h-3.5 w-3.5" />
              Sessions
            </Link>
            <Link
              href="/playground"
              className="ml-2 inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
            >
              Start building
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-20">
        {/* Hero */}
        <section className="py-16 md:py-24">
          <div className="max-w-2xl">
            <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              Agent observability,{" "}
              <span className="text-blue-400">universal</span>
            </h1>
            <p className="mb-8 text-base leading-relaxed text-zinc-400">
              Normalize traces from any AI framework — Vercel AI SDK, OpenAI Agents, Mastra — into a shared event schema.
              Debug tool calls, inspect failures, and understand agent behavior across runtimes.
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/playground"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
              >
                Open Playground
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/sessions"
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800/50"
              >
                View Traces
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mb-16 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-950/50">
                <Layers className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold tabular-nums">{sessions.length}</p>
                <p className="text-xs text-zinc-500">Total Sessions</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-950/50">
                <MessageSquare className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold tabular-nums">{totalEvents}</p>
                <p className="text-xs text-zinc-500">Events Ingested</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-950/50">
                <Code2 className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold tabular-nums">{frameworks.length}</p>
                <p className="text-xs text-zinc-500">Frameworks Tracked</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Framework badges */}
        {frameworks.length > 0 && (
          <section className="mb-16">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
              Active Frameworks
            </p>
            <div className="flex flex-wrap gap-2">
              {frameworks.map((fw) => (
                <Badge key={fw} className="border-zinc-700 bg-zinc-900 px-2.5 py-1 font-mono text-xs">
                  {fw}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* Features */}
        <section className="mb-16">
          <p className="mb-4 text-xs font-medium uppercase tracking-wider text-zinc-500">How it works</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="group transition-colors hover:border-zinc-700">
              <CardContent className="pt-5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-zinc-800/50">
                  <Braces className="h-4 w-4 text-zinc-300" />
                </div>
                <h3 className="mb-1.5 text-sm font-medium">Universal Schema</h3>
                <p className="text-xs leading-relaxed text-zinc-500">
                  Five event types — user message, assistant, tool call, tool result, error — validated with Zod.
                </p>
              </CardContent>
            </Card>

            <Card className="group transition-colors hover:border-zinc-700">
              <CardContent className="pt-5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-zinc-800/50">
                  <Cpu className="h-4 w-4 text-zinc-300" />
                </div>
                <h3 className="mb-1.5 text-sm font-medium">Framework Adapters</h3>
                <p className="text-xs leading-relaxed text-zinc-500">
                  Native adapter per framework — preserves streaming, reduces latency, no central proxy.
                </p>
              </CardContent>
            </Card>

            <Card className="group transition-colors hover:border-zinc-700">
              <CardContent className="pt-5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-zinc-800/50">
                  <Layers className="h-4 w-4 text-zinc-300" />
                </div>
                <h3 className="mb-1.5 text-sm font-medium">Append-Only Store</h3>
                <p className="text-xs leading-relaxed text-zinc-500">
                  PostgreSQL + Drizzle. JSONB payloads for flexible schema evolution. No deletes, no updates.
                </p>
              </CardContent>
            </Card>

            <Card className="group transition-colors hover:border-zinc-700">
              <CardContent className="pt-5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-zinc-800/50">
                  <Activity className="h-4 w-4 text-zinc-300" />
                </div>
                <h3 className="mb-1.5 text-sm font-medium">Heuristic Insights</h3>
                <p className="text-xs leading-relaxed text-zinc-500">
                  Failed tool calls, retry detection, frustration signals — validating signal quality before ML.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
