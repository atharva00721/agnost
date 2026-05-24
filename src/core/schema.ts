import { z } from "zod";

export const frameworkSchema = z.enum(["vercel-ai", "openai-agents", "mastra"]);

const baseEventSchema = z.object({
  id: z.string().min(1),
  sessionId: z.string().min(1),
  framework: frameworkSchema,
  timestamp: z.string().datetime(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const userMessageEventSchema = baseEventSchema.extend({
  eventType: z.literal("user_message"),
  content: z.string(),
});

const assistantMessageEventSchema = baseEventSchema.extend({
  eventType: z.literal("assistant_message"),
  content: z.string(),
  model: z.string().optional(),
});

const toolCallEventSchema = baseEventSchema.extend({
  eventType: z.literal("tool_call"),
  toolName: z.string(),
  input: z.record(z.string(), z.unknown()),
});

const toolResultEventSchema = baseEventSchema.extend({
  eventType: z.literal("tool_result"),
  toolName: z.string(),
  success: z.boolean(),
  output: z.unknown(),
  error: z.string().optional(),
});

const errorEventSchema = baseEventSchema.extend({
  eventType: z.literal("error"),
  code: z.string(),
  message: z.string(),
});

export const agentEventSchema = z.discriminatedUnion("eventType", [
  userMessageEventSchema,
  assistantMessageEventSchema,
  toolCallEventSchema,
  toolResultEventSchema,
  errorEventSchema,
]);

export const ingestEventsSchema = z.object({
  sessionId: z.string().min(1),
  framework: frameworkSchema,
  events: z.array(agentEventSchema).min(1),
});
