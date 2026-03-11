// ─────────────────────────────────────────────────────────────
// WebSocket Client — /api/ws/chat
//
// Wraps native WebSocket with typed command/envelope protocol.
// One socket, one command, stream of AGUI events.
// ─────────────────────────────────────────────────────────────

import {
  ChatWsMessageType,
  type AGUIEvent,
  type ChatRunRequest,
  type ChatWsAckPayload,
  type ChatWsCommand,
  type ChatWsEnvelope,
  type WorkflowOutputFrame,
} from "@aevatar-react-sdk/types";
import { normalizeFrame } from "./event-normalizer";

export interface WsClientOptions {
  url?: string;
  onAck?: (payload: ChatWsAckPayload) => void;
  onError?: (code: string, message: string) => void;
  onRawFrame?: (frame: WorkflowOutputFrame) => void;
  requestId?: string;
}

export interface WsClientResult {
  events: AsyncGenerator<AGUIEvent, void, undefined>;
  close: () => void;
}

export function connectChatWebSocket(
  request: ChatRunRequest,
  options?: WsClientOptions,
): WsClientResult {
  const wsUrl = options?.url ?? buildDefaultWsUrl();
  const socket = new WebSocket(wsUrl);
  const requestId =
    options?.requestId ?? crypto.randomUUID?.() ?? generateFallbackId();
  let closed = false;

  const eventQueue: AGUIEvent[] = [];
  let resolve: (() => void) | null = null;
  let done = false;

  function enqueue(event: AGUIEvent) {
    eventQueue.push(event);
    resolve?.();
  }

  function finish() {
    done = true;
    resolve?.();
  }

  socket.onopen = () => {
    const command: ChatWsCommand = {
      type: "chat.command",
      requestId,
      payload: request,
    };
    socket.send(JSON.stringify(command));
  };

  socket.onmessage = (msg) => {
    let envelope: ChatWsEnvelope;
    try {
      envelope = JSON.parse(
        typeof msg.data === "string" ? msg.data : "",
      ) as ChatWsEnvelope;
    } catch {
      return;
    }

    if (envelope.type === ChatWsMessageType.CommandAck) {
      options?.onAck?.(envelope.payload);
      return;
    }

    if (envelope.type === ChatWsMessageType.CommandError) {
      options?.onError?.(envelope.code, envelope.message);
      finish();
      return;
    }

    if (envelope.type === ChatWsMessageType.AguiEvent) {
      const frame = envelope.payload;
      options?.onRawFrame?.(frame);
      const event = normalizeFrame(frame);
      if (event) enqueue(event);
    }
  };

  socket.onerror = () => {
    options?.onError?.("WS_ERROR", "WebSocket connection error.");
    finish();
  };

  socket.onclose = () => {
    finish();
  };

  async function* events(): AsyncGenerator<AGUIEvent, void, undefined> {
    while (true) {
      while (eventQueue.length > 0) {
        yield eventQueue.shift()!;
      }
      if (done) break;
      await new Promise<void>((r) => {
        resolve = r;
      });
      resolve = null;
    }
  }

  function close() {
    if (closed) return;
    closed = true;
    if (
      socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING
    ) {
      socket.close(1000, "done");
    }
  }

  return { events: events(), close };
}

function buildDefaultWsUrl(): string {
  const protocol = globalThis.location?.protocol === "https:" ? "wss:" : "ws:";
  const host = globalThis.location?.host ?? "localhost";
  return `${protocol}//${host}/api/ws/chat`;
}

function generateFallbackId(): string {
  return `ws-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
