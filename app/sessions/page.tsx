import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

type SessionRow = {
  id: string;
  framework: string;
  status: string;
  eventCount: number;
  firstEventAt: string | null;
  lastEventAt: string | null;
};

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function formatDuration(firstEventAt: string | null, lastEventAt: string | null) {
  if (!firstEventAt || !lastEventAt) return "—";
  const start = new Date(firstEventAt).getTime();
  const end = new Date(lastEventAt).getTime();
  const seconds = Math.max(0, Math.round((end - start) / 1000));
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const rem = seconds % 60;
  return `${mins}m ${rem}s`;
}

export default async function SessionsPage() {
  const response = await fetch(`${baseUrl}/api/sessions`, { cache: "no-store" });
  const data: { sessions: SessionRow[] } = await response.json();

  return (
    <main className="mx-auto max-w-6xl p-6 text-zinc-100">
      <Card>
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[70vh]">
            <table className="w-full text-sm">
              <thead className="text-zinc-400">
                <tr>
                  <th className="p-2 text-left">Session</th>
                  <th className="p-2 text-left">Framework</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Events</th>
                  <th className="p-2 text-left">Duration</th>
                </tr>
              </thead>
              <tbody>
                {data.sessions.map((session) => (
                  <tr key={session.id} className="border-t border-zinc-800">
                    <td className="p-2">
                      <Link href={`/sessions/${session.id}`} className="text-blue-400 hover:underline">
                        {session.id}
                      </Link>
                    </td>
                    <td className="p-2">{session.framework}</td>
                    <td className="p-2">
                      <Badge>{session.status}</Badge>
                    </td>
                    <td className="p-2">{session.eventCount}</td>
                    <td className="p-2">{formatDuration(session.firstEventAt, session.lastEventAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </CardContent>
      </Card>
    </main>
  );
}
