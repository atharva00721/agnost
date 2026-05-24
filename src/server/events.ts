import { and, asc, count, eq, max, min } from "drizzle-orm";

import { db } from "@/src/db/client";
import { events, sessions } from "@/src/db/schema";
import type { AgentEvent } from "@/src/types/events";

export async function upsertSession(sessionId: string, framework: string) {
  await db
    .insert(sessions)
    .values({
      id: sessionId,
      framework,
      createdAt: new Date(),
      status: "active",
    })
    .onConflictDoNothing();
}

export async function insertEvents(agentEvents: AgentEvent[]) {
  if (!agentEvents.length) return;
  await db
    .insert(events)
    .values(
      agentEvents.map((event) => ({
        id: event.id,
        sessionId: event.sessionId,
        eventType: event.eventType,
        framework: event.framework,
        timestamp: new Date(event.timestamp),
        payload: event,
      })),
    )
    .onConflictDoNothing();
}

export async function getSessionsList() {
  const rows = await db
    .select({
      id: sessions.id,
      framework: sessions.framework,
      status: sessions.status,
      createdAt: sessions.createdAt,
      eventCount: count(events.id),
      firstEventAt: min(events.timestamp),
      lastEventAt: max(events.timestamp),
    })
    .from(sessions)
    .leftJoin(events, eq(events.sessionId, sessions.id))
    .groupBy(sessions.id);

  return rows;
}

export async function getSessionWithEvents(id: string) {
  const session = await db.query.sessions.findFirst({ where: eq(sessions.id, id) });
  if (!session) return null;

  const sessionEvents = await db.query.events.findMany({
    where: and(eq(events.sessionId, id)),
    orderBy: [asc(events.timestamp)],
  });

  return { session, events: sessionEvents };
}
