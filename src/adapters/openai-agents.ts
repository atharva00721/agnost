import type { FrameworkAdapter } from "./types";

export const openAIAgentsAdapter: FrameworkAdapter = {
  framework: "openai-agents",
  implemented: false,
  normalize() {
    return { ok: false, error: "OpenAI Agents adapter not implemented yet" };
  },
};
