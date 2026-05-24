import type { AgentEvent, Framework } from "@/src/types/events";

export type NormalizeResult =
  | { ok: true; events: AgentEvent[] }
  | { ok: false; error: string };

export interface FrameworkAdapter {
  framework: Framework;
  implemented: boolean;
  normalize(input: unknown): NormalizeResult;
}
