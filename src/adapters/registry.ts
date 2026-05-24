import { mastraAdapter } from "./mastra";
import { openAIAgentsAdapter } from "./openai-agents";
import { vercelAIAdapter } from "./vercel-ai";
import type { Framework } from "@/src/types/events";

export const adapterRegistry = {
  "vercel-ai": vercelAIAdapter,
  "openai-agents": openAIAgentsAdapter,
  mastra: mastraAdapter,
} as const;

export function getAdapter(framework: Framework) {
  return adapterRegistry[framework];
}
