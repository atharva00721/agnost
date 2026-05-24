import type { AgentEvent } from "@/src/types/events";

export interface TraceInsights {
  failedToolCalls: number;
  retrySignals: number;
  frustrationSignals: number;
  fallbackAssistantResponses: number;
}

const FALLBACK_MARKERS = ["i'm not sure", "cannot help with that", "don't have enough", "unable to"];

export function generateTraceInsights(events: AgentEvent[]): TraceInsights {
  const failedToolCalls = events.filter(
    (event) =>
      (event.eventType === "tool_result" && !event.success) || event.eventType === "error",
  ).length;

  const retrySignals = events.filter((event, index) => {
    if (event.eventType !== "tool_call" || index === 0) return false;
    const previous = events[index - 1];
    return previous?.eventType === "tool_call" && previous.toolName === event.toolName;
  }).length;

  const repeatedUserMessages = events.filter((event, index) => {
    if (event.eventType !== "user_message" || index === 0) return false;
    const previous = events[index - 1];
    return previous?.eventType === "user_message" && previous.content === event.content;
  }).length;

  const fallbackAssistantResponses = events.filter(
    (event) =>
      event.eventType === "assistant_message" &&
      FALLBACK_MARKERS.some((marker) => event.content.toLowerCase().includes(marker)),
  ).length;

  return {
    failedToolCalls,
    retrySignals,
    frustrationSignals: repeatedUserMessages + fallbackAssistantResponses,
    fallbackAssistantResponses,
  };
}
