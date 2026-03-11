// ─────────────────────────────────────────────────────────────
// useChatStream — React hook for SSE-based AGUI chat streaming
//
// Accepts an injected `streamChat` function so the hook owns
// only parsing + state management, never HTTP infrastructure.
// ─────────────────────────────────────────────────────────────

import { useCallback, useRef, useState } from "react";
import type {
  AGUIEvent,
  ChatRunRequest,
  WorkflowOutputFrame,
} from "@aevatar-react-sdk/types";
import { parseSSEStream } from "../sse-client";
import {
  createRunSession,
  reduceEvent,
  type RunSessionState,
} from "../run-session";

export interface UseChatStreamOptions {
  streamChat: (request: ChatRunRequest, signal: AbortSignal) => Promise<Response>;
  onEvent?: (event: AGUIEvent) => void;
  onRawFrame?: (frame: WorkflowOutputFrame) => void;
  onError?: (error: Error) => void;
  onComplete?: (state: RunSessionState) => void;
}

export interface UseChatStreamReturn {
  session: RunSessionState;
  streaming: boolean;
  send: (request: ChatRunRequest) => Promise<void>;
  abort: () => void;
}

export function useChatStream(
  options: UseChatStreamOptions,
): UseChatStreamReturn {
  const [session, setSession] = useState<RunSessionState>(createRunSession);
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const abort = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreaming(false);
  }, []);

  const send = useCallback(
    async (request: ChatRunRequest) => {
      abort();

      const controller = new AbortController();
      abortRef.current = controller;
      const opts = optionsRef.current;

      let state = createRunSession();
      setSession(state);
      setStreaming(true);

      try {
        const response = await opts.streamChat(request, controller.signal);

        const eventStream = parseSSEStream(response, {
          signal: controller.signal,
          onRawFrame: opts.onRawFrame,
        });

        for await (const event of eventStream) {
          if (controller.signal.aborted) break;
          state = reduceEvent(state, event);
          setSession({ ...state });
          optionsRef.current.onEvent?.(event);
        }

        optionsRef.current.onComplete?.(state);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          optionsRef.current.onError?.(err as Error);
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [abort],
  );

  return { session, streaming, send, abort };
}
