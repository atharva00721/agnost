import type { FrameworkAdapter } from "./types";

export const mastraAdapter: FrameworkAdapter = {
  framework: "mastra",
  implemented: false,
  normalize() {
    return { ok: false, error: "Mastra adapter not implemented yet" };
  },
};
