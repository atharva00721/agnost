import { NextResponse } from "next/server";

import { generateTraceInsights } from "@/src/core/insights";
import { getSessionWithEvents } from "@/src/server/events";
import type { AgentEvent } from "@/src/types/events";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessionData = await getSessionWithEvents(id);

  if (!sessionData) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const normalizedEvents = sessionData.events.map((event: { payload: unknown }) => event.payload as AgentEvent);

  return NextResponse.json({
    session: sessionData.session,
    events: normalizedEvents,
    insights: generateTraceInsights(normalizedEvents),
  });
}
