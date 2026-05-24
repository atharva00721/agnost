export type Framework = "vercel-ai" | "openai-agents" | "mastra";

export type EventType =
  | "user_message"
  | "assistant_message"
  | "tool_call"
  | "tool_result"
  | "error";

export interface BaseAgentEvent {
  id: string;
  sessionId: string;
  framework: Framework;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface UserMessageEvent extends BaseAgentEvent {
  eventType: "user_message";
  content: string;
}

export interface AssistantMessageEvent extends BaseAgentEvent {
  eventType: "assistant_message";
  content: string;
  model?: string;
}

export interface ToolCallEvent extends BaseAgentEvent {
  eventType: "tool_call";
  toolName: string;
  input: Record<string, unknown>;
}

export interface ToolResultEvent extends BaseAgentEvent {
  eventType: "tool_result";
  toolName: string;
  success: boolean;
  output: unknown;
  error?: string;
}

export interface ErrorEvent extends BaseAgentEvent {
  eventType: "error";
  code: string;
  message: string;
}

export type AgentEvent =
  | UserMessageEvent
  | AssistantMessageEvent
  | ToolCallEvent
  | ToolResultEvent
  | ErrorEvent;
