import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AgentEvent } from "@/src/types/events";

type TraceResponse = {
  session: { id: string; framework: string; status: string };
  events: AgentEvent[];
  insights: {
    failedToolCalls: number;
    retrySignals: number;
    frustrationSignals: number;
    fallbackAssistantResponses: number;
  };
};

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default async function SessionTracePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const response = await fetch(`${baseUrl}/api/sessions/${id}`, { cache: "no-store" });
  const data: TraceResponse = await response.json();

  return (
    <main className="mx-auto grid max-w-6xl gap-4 p-6 text-zinc-100 md:grid-cols-3">
      <section className="md:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Trace {id}</CardTitle>
              <Badge>{data.session.framework}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs>
              <TabsList>
                <TabsTrigger className="bg-zinc-900">Timeline</TabsTrigger>
              </TabsList>
              <TabsContent>
                <ScrollArea className="max-h-[70vh] space-y-3 pr-2">
                  {data.events.map((event) => (
                    <div key={event.id} className="mb-3 rounded-lg border border-zinc-800 bg-zinc-900 p-3">
                      <div className="mb-2 flex items-center gap-2">
                        <Badge>{event.eventType}</Badge>
                        <span className="text-xs text-zinc-400">{new Date(event.timestamp).toISOString()}</span>
                      </div>
                      <pre className="overflow-x-auto text-xs text-zinc-200">
                        {JSON.stringify(event, null, 2)}
                      </pre>
                    </div>
                  ))}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>
      <aside className="space-y-3">
        <Card>
          <CardHeader>
            <CardTitle>Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-zinc-300">
            <div className="flex items-center justify-between"><span>Failed tool calls</span><Badge>{data.insights.failedToolCalls}</Badge></div>
            <Separator />
            <div className="flex items-center justify-between"><span>Retry signals</span><Badge>{data.insights.retrySignals}</Badge></div>
            <Separator />
            <div className="flex items-center justify-between"><span>Fallback responses</span><Badge>{data.insights.fallbackAssistantResponses}</Badge></div>
            <Separator />
            <div className="flex items-center justify-between"><span>Frustration score</span><Badge>{data.insights.frustrationSignals}</Badge></div>
          </CardContent>
        </Card>
      </aside>
    </main>
  );
}
