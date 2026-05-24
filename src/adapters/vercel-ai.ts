import { z } from "zod";

import type { FrameworkAdapter, NormalizeResult } from "./types";

const vercelAIStepSchema = z.object({
  type: z.enum(["user", "assistant", "tool-call", "tool-result", "error"]),
  id: z.string().min(1),
  content: z.string().optional(),
  toolName: z.string().optional(),
  input: z.record(z.string(), z.unknown()).optional(),
  output: z.unknown().optional(),
  error: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  timestamp: z.string().datetime(),
});

const vercelAITraceSchema = z.object({
  sessionId: z.string().min(1),
  steps: z.array(vercelAIStepSchema),
});

export const vercelAIAdapter: FrameworkAdapter = {
  framework: "vercel-ai",
  implemented: true,
  normalize(input: unknown): NormalizeResult {
    const parsed = vercelAITraceSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Invalid Vercel AI trace shape" };
    }

    const events = parsed.data.steps.map((step) => {
      const base = {
        id: step.id,
        framework: "vercel-ai" as const,
        sessionId: parsed.data.sessionId,
        timestamp: step.timestamp,
        metadata: step.metadata,
      };

      switch (step.type) {
        case "user":
          return { ...base, eventType: "user_message" as const, content: step.content ?? "" };
        case "assistant":
          return { ...base, eventType: "assistant_message" as const, content: step.content ?? "" };
        case "tool-call":
          return { ...base, eventType: "tool_call" as const, toolName: step.toolName ?? "unknown", input: step.input ?? {} };
        case "tool-result":
          return { ...base, eventType: "tool_result" as const, toolName: step.toolName ?? "unknown", success: !step.error, output: step.output, error: step.error };
        case "error":
          return { ...base, eventType: "error" as const, code: "VERCEL_AI_ERROR", message: step.error ?? "Unknown adapter error" };
      }
    });

    return { ok: true, events };
  },
};
