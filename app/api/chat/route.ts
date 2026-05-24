import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, stepCountIs, streamText, UIMessage } from "ai";

import { demoTools } from "@/src/tools";
import { insertEvents, upsertSession } from "@/src/server/events";
import type { AgentEvent } from "@/src/types/events";

export const maxDuration = 60;

export async function POST(req: Request) {
  const body = await req.json();
  const messages: UIMessage[] = body.messages;
  const sessionId: string = body.sessionId ?? `sess_${Date.now()}`;

  if (!Array.isArray(messages)) {
    return new Response(JSON.stringify({ error: "messages array required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const baseTimestamp = new Date().toISOString();
  let stepIndex = 0;
  const capturedEvents: AgentEvent[] = [];

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system:
      "You are a helpful AI assistant with access to tools. Use tools when appropriate.",
    messages: await convertToModelMessages(messages),
    tools: demoTools,
    stopWhen: stepCountIs(5),
    onStepFinish: async (step) => {
      const stepTs = new Date().toISOString();
      const stepEvents: AgentEvent[] = [];

      if (step.text) {
        stepEvents.push({
          id: `${sessionId}-asst-${stepIndex}`,
          sessionId,
          framework: "vercel-ai",
          timestamp: stepTs,
          eventType: "assistant_message",
          content: step.text,
          metadata: { stepNumber: step.stepNumber, finishReason: step.finishReason },
        });
      }

      for (let i = 0; i < step.toolCalls.length; i++) {
        const tc = step.toolCalls[i];
        stepEvents.push({
          id: `${sessionId}-toolcall-${stepIndex}-${i}`,
          sessionId,
          framework: "vercel-ai",
          timestamp: stepTs,
          eventType: "tool_call",
          toolName: tc.toolName,
          input: tc.input as Record<string, unknown>,
          metadata: { stepNumber: step.stepNumber },
        });
      }

      for (let i = 0; i < step.toolResults.length; i++) {
        const tr = step.toolResults[i];
        const isError = (tr as { error?: Error }).error !== undefined;
        stepEvents.push({
          id: `${sessionId}-toolresult-${stepIndex}-${i}`,
          sessionId,
          framework: "vercel-ai",
          timestamp: stepTs,
          eventType: "tool_result",
          toolName: tr.toolName,
          success: !isError,
          output: tr.output,
          metadata: { stepNumber: step.stepNumber },
        });
      }

      capturedEvents.push(...stepEvents);
      stepIndex++;

      if (capturedEvents.length > 0) {
        await upsertSession(sessionId, "vercel-ai").catch(() => {});
        await insertEvents(capturedEvents.splice(0)).catch(() => {});
      }
    },
  });

  return result.toUIMessageStreamResponse();
}
