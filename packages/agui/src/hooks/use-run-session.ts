// ─────────────────────────────────────────────────────────────
// useRunSession — standalone hook to track run session state
//
// Use when you already have an event source (e.g. WS client)
// and just need the state reducer + React integration.
// ─────────────────────────────────────────────────────────────

import { useCallback, useState } from "react";
import type { AGUIEvent } from "@aevatar-react-sdk/types";
import {
  createRunSession,
  reduceEvent,
  type RunSessionState,
} from "../run-session";

export interface UseRunSessionReturn {
  session: RunSessionState;
  dispatch: (event: AGUIEvent) => void;
  reset: () => void;
}

export function useRunSession(): UseRunSessionReturn {
  const [session, setSession] = useState<RunSessionState>(createRunSession);

  const dispatch = useCallback((event: AGUIEvent) => {
    setSession((prev) => reduceEvent(prev, event));
  }, []);

  const reset = useCallback(() => {
    setSession(createRunSession());
  }, []);

  return { session, dispatch, reset };
}
