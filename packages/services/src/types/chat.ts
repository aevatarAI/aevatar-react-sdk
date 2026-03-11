// ─────────────────────────────────────────────────────────────
// IChatService — streaming chat + human interaction endpoints
// ─────────────────────────────────────────────────────────────

import type {
  ChatRunRequest,
  WorkflowResumeRequest,
  WorkflowResumeResponse,
  WorkflowSignalRequest,
  WorkflowSignalResponse,
} from "@aevatar-react-sdk/types";

export interface StreamChatOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export interface IChatService {
  streamChat(request: ChatRunRequest, options?: StreamChatOptions): Promise<Response>;
  resume(request: WorkflowResumeRequest): Promise<WorkflowResumeResponse>;
  signal(request: WorkflowSignalRequest): Promise<WorkflowSignalResponse>;
}
