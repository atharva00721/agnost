import { NextResponse } from "next/server";

import { ingestEventsSchema } from "@/src/core/schema";
import { insertEvents, upsertSession } from "@/src/server/events";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = ingestEventsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await upsertSession(parsed.data.sessionId, parsed.data.framework);
  await insertEvents(parsed.data.events);

  return NextResponse.json({ ok: true, ingested: parsed.data.events.length });
}
