import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdapter } from "@/src/adapters/registry";
import { frameworkSchema } from "@/src/core/schema";
import { insertEvents, upsertSession } from "@/src/server/events";

const integrationIngestSchema = z.object({
  sessionId: z.string().min(1),
  trace: z.unknown(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ framework: string }> },
) {
  const { framework } = await params;
  const frameworkParse = frameworkSchema.safeParse(framework);

  if (!frameworkParse.success) {
    return NextResponse.json({ error: "Unsupported framework" }, { status: 400 });
  }

  const body = await request.json();
  const parsed = integrationIngestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const adapter = getAdapter(frameworkParse.data);
  if (!adapter.implemented) {
    return NextResponse.json({ error: `${frameworkParse.data} integration is not implemented yet` }, { status: 501 });
  }

  const normalized = adapter.normalize(parsed.data.trace);
  if (!normalized.ok) {
    return NextResponse.json({ error: normalized.error }, { status: 400 });
  }

  await upsertSession(parsed.data.sessionId, frameworkParse.data);
  await insertEvents(normalized.events);

  return NextResponse.json({ ok: true, ingested: normalized.events.length });
}
