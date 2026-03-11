// ─────────────────────────────────────────────────────────────
// @aevatar-react-sdk/agui
//
// AGUI protocol client: SSE + WebSocket transports,
// event normalization, custom event mapping, run session
// state tracking, and React hooks.
// ─────────────────────────────────────────────────────────────

// Transport
export { parseSSEStream } from "./sse-client";
export type { SSEClientOptions } from "./sse-client";

export { connectChatWebSocket } from "./ws-client";
export type { WsClientOptions, WsClientResult } from "./ws-client";

// Event processing
export { normalizeFrame } from "./event-normalizer";
export { parseCustomEvent } from "./custom-event-mapper";
export type { ParsedCustomEvent } from "./custom-event-mapper";

// Run session
export { createRunSession, reduceEvent } from "./run-session";
export type { RunStatus, TextMessage, RunSessionState } from "./run-session";

// React hooks
export {
  useChatStream,
  useRunSession,
  useHumanInteraction,
} from "./hooks";
export type {
  UseChatStreamOptions,
  UseChatStreamReturn,
  UseRunSessionReturn,
  UseHumanInteractionOptions,
  UseHumanInteractionReturn,
} from "./hooks";
