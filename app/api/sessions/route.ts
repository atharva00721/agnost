import { NextResponse } from "next/server";

import { getSessionsList } from "@/src/server/events";

export async function GET() {
  const sessions = await getSessionsList();
  return NextResponse.json({ sessions });
}
