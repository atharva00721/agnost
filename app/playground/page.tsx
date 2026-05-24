"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { AgentEvent } from "@/src/types/events";

function sessionId() {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function EventCard({ event, index }: { event: AgentEvent; index: number }) {
  const isFailure = event.eventType === "error" || (event.eventType === "tool_result" && !event.success);
  const bg = isFailure ? "border-red-800 bg-red-950/30" : "border-zinc-800 bg-zinc-900";

  return (
    <div className={`mb-2 rounded-lg border p-2.5 text-xs ${bg}`}>
      <div className="mb-1.5 flex items-center gap-2">
        <Badge className={isFailure ? "border-red-800 bg-red-950/50 text-red-300" : ""}>
          {event.eventType}
        </Badge>
        {event.eventType === "tool_call" && <span className="font-mono text-zinc-400">{event.toolName}</span>}
        {event.eventType === "tool_result" && (
          <span className="font-mono text-zinc-400">
            {event.toolName} {event.success ? "✓" : "✗"}
          </span>
        )}
        <span className="ml-auto font-mono text-zinc-500">#{index + 1}</span>
      </div>
      <pre className="overflow-x-auto whitespace-pre-wrap text-zinc-300">
        {JSON.stringify(event, null, 1)}
      </pre>
    </div>
  );
}

export default function PlaygroundPage() {
  const [sid] = useState(() => sessionId());
  const [input, setInput] = useState("");
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const pollRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: () => ({ sessionId: sid }),
    }),
  });

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch(`/api/sessions/${sid}`);
      if (res.ok) {
        const data = await res.json();
        if (data.events) setEvents(data.events);
      }
    } catch {}
  }, [sid]);

  useEffect(() => {
    pollRef.current = setInterval(fetchEvents, 1500);
    return () => clearInterval(pollRef.current);
  }, [fetchEvents]);

  return (
    <main className="mx-auto grid h-[calc(100vh-2rem)] max-w-7xl grid-cols-1 gap-4 p-4 text-zinc-100 md:grid-cols-5">
      <section className="flex flex-col md:col-span-3">
        <Card className="flex flex-1 flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Agent Playground</CardTitle>
              <Badge className="font-mono text-xs">{sid.slice(0, 20)}…</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            <ScrollArea className="flex-1 pr-2">
              {messages.length === 0 && (
                <div className="py-16 text-center text-zinc-500">
                  <p className="mb-2 text-lg font-medium text-zinc-300">Agnost Connect Playground</p>
                  <p className="mb-6 text-sm">
                    Ask the agent to calculate, check weather, or search. Tool calls will appear in the live trace panel.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {["What's 15 * 7 + 3?", "Weather in Tokyo", "Search for AI agent frameworks"].map(
                      (suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => setInput(suggestion)}
                          className="rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                        >
                          {suggestion}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              )}
              {messages.map((m) => (
                <div key={m.id} className={`mb-3 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                      m.role === "user" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-100"
                    }`}
                  >
                    {m.parts.map((part, i) => {
                      if (part.type === "text") {
                        return <p key={i} className="whitespace-pre-wrap">{part.text}</p>;
                      }
                      if (part.type === "step-start") {
                        return <div key={i} className="my-1 border-t border-zinc-700" />;
                      }
                      if (part.type.startsWith("tool-")) {
                        const p = part as { state: string; toolName?: string; input?: unknown; output?: unknown; errorText?: string | undefined };
                        return (
                          <div key={i} className="mt-1.5 rounded border border-zinc-700 bg-zinc-900 p-1.5 text-xs">
                            <div className="font-mono text-zinc-400">
                              {p.state === "output-available" ? "✓" : "⟳"} {p.toolName ?? "tool"}
                            </div>
                            {/* eslint-disable-next-line @typescript-eslint/no-base-to-string */}
                            {p.input != null && <div className="text-zinc-500">in: {JSON.stringify(p.input)}</div>}
                            {/* eslint-disable-next-line @typescript-eslint/no-base-to-string */}
                            {p.output != null && <div className="text-zinc-300">out: {JSON.stringify(p.output)}</div>}
                            {p.errorText != null && <div className="text-red-400">{String(p.errorText)}</div>}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              ))}
            </ScrollArea>
            <Separator />
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (input.trim()) {
                  sendMessage({ text: input });
                  setInput("");
                }
              }}
              className="mt-3 flex gap-2"
            >
              <input
                className="flex-1 rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask the agent to use a tool…"
                disabled={status !== "ready"}
              />
              <button
                type="submit"
                disabled={status !== "ready" || !input.trim()}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
              >
                {status === "submitted" || status === "streaming" ? "..." : "Send"}
              </button>
            </form>
          </CardContent>
        </Card>
      </section>

      <aside className="flex flex-col md:col-span-2">
        <Card className="flex flex-1 flex-col">
          <CardHeader>
            <CardTitle>Live Trace</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col p-0">
            <ScrollArea className="flex-1 px-4">
              {events.length === 0 ? (
                <p className="py-8 text-center text-sm text-zinc-500">
                  Send a message to see normalized events appear here.
                </p>
              ) : (
                events.map((event, i) => <EventCard key={event.id} event={event} index={i} />)
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </aside>
    </main>
  );
}
