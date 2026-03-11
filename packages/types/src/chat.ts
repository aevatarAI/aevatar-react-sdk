// ─────────────────────────────────────────────────────────────
// Chat API contracts — mirrors backend endpoint models
// POST /api/chat (SSE), POST /api/workflows/resume|signal
// GET /api/ws/chat (WebSocket)
// ─────────────────────────────────────────────────────────────

import type { WorkflowOutputFrame } from "./agui";

// ─── SSE Chat ───

export interface ChatRunRequest {
  prompt: string;
  workflow?: string;
  agentId?: string;
  workflowYamls?: string[];
  metadata?: Record<string, string>;
}

// ─── Human interaction ───

export interface WorkflowResumeRequest {
  actorId: string;
  runId: string;
  stepId: string;
  commandId?: string;
  approved: boolean;
  userInput?: string;
  metadata?: Record<string, string>;
}

export interface WorkflowResumeResponse {
  accepted: boolean;
  actorId?: string;
  runId?: string;
  stepId?: string;
  commandId?: string;
}

export interface WorkflowSignalRequest {
  actorId: string;
  runId: string;
  signalName: string;
  stepId?: string;
  commandId?: string;
  payload?: string;
}

export interface WorkflowSignalResponse {
  accepted: boolean;
  actorId?: string;
  runId?: string;
  signalName?: string;
  stepId?: string;
  commandId?: string;
}

// ─── WebSocket protocol ───
// Inbound: client -> server

export interface ChatWsCommand {
  type: "chat.command";
  requestId?: string;
  payload: ChatRunRequest;
}

// Outbound: server -> client

export const ChatWsMessageType = {
  CommandAck: "command.ack",
  CommandError: "command.error",
  AguiEvent: "agui.event",
} as const;

export type ChatWsMessageType =
  (typeof ChatWsMessageType)[keyof typeof ChatWsMessageType];

export interface ChatWsAckPayload {
  commandId: string;
  actorId: string;
  workflow: string;
}

export interface ChatWsAckEnvelope {
  type: typeof ChatWsMessageType.CommandAck;
  requestId: string;
  correlationId: string;
  payload: ChatWsAckPayload;
}

export interface ChatWsEventEnvelope {
  type: typeof ChatWsMessageType.AguiEvent;
  requestId: string;
  correlationId: string;
  payload: WorkflowOutputFrame;
}

export interface ChatWsErrorEnvelope {
  type: typeof ChatWsMessageType.CommandError;
  requestId?: string;
  correlationId: string;
  code: string;
  message: string;
}

export type ChatWsEnvelope =
  | ChatWsAckEnvelope
  | ChatWsEventEnvelope
  | ChatWsErrorEnvelope;

// ─── Catalog & LLM ───

export interface WorkflowCatalogItem {
  name: string;
  description?: string;
  tags?: string[];
  yamlSource?: string;
  [key: string]: unknown;
}

export interface LlmStatusResponse {
  available: boolean;
  provider?: string;
  model?: string;
  [key: string]: unknown;
}

export interface PrimitiveCatalogItem {
  name: string;
  description?: string;
  category?: string;
  parameters?: Record<string, unknown>;
  [key: string]: unknown;
}
