// ─────────────────────────────────────────────────────────────
// ChatService — SSE streaming + resume/signal REST calls
//
// streamChat() returns the raw Response so the consumer
// (agui package) owns SSE parsing and event normalization.
// ─────────────────────────────────────────────────────────────

import type { IBaseRequest } from "@aevatar-react-sdk/types";
import type {
  ChatRunRequest,
  WorkflowResumeRequest,
  WorkflowResumeResponse,
  WorkflowSignalRequest,
  WorkflowSignalResponse,
} from "@aevatar-react-sdk/types";
import { BaseService } from "../types";
import type { IChatService, StreamChatOptions } from "../types/chat";

export class ChatService<T extends IBaseRequest = IBaseRequest>
  extends BaseService<T>
  implements IChatService
{
  async streamChat(
    request: ChatRunRequest,
    options?: StreamChatOptions,
  ): Promise<Response> {
    const baseUrl = options?.baseUrl ?? this.resolveBaseUrl() ?? "";
    const url = `${baseUrl}/api/chat`;
    const authHeaders = this.resolveAuthHeaders();

    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        ...authHeaders,
        ...options?.headers,
      },
      body: JSON.stringify(request),
      signal: options?.signal,
    });
  }

  resume(request: WorkflowResumeRequest): Promise<WorkflowResumeResponse> {
    return this._request.send({
      method: "POST",
      url: "/api/workflows/resume",
      params: request,
    });
  }

  signal(request: WorkflowSignalRequest): Promise<WorkflowSignalResponse> {
    return this._request.send({
      method: "POST",
      url: "/api/workflows/signal",
      params: request,
    });
  }

  private resolveBaseUrl(): string | undefined {
    const req = this._request as Record<string, unknown>;
    const defaults = req._defaults as Record<string, unknown> | undefined;
    return defaults?.baseURL as string | undefined;
  }

  private resolveAuthHeaders(): Record<string, string> {
    const req = this._request as Record<string, unknown>;
    const common = req.commonHeaders as Record<string, string> | undefined;
    if (common?.Authorization) {
      return { Authorization: common.Authorization };
    }
    return {};
  }
}
