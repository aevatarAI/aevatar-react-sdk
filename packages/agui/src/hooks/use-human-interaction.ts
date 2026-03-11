// ─────────────────────────────────────────────────────────────
// useHumanInteraction — resume / signal actions
//
// Accepts injected resume/signal functions so the hook owns
// only loading/error state management, never HTTP calls.
// ─────────────────────────────────────────────────────────────

import { useCallback, useRef, useState } from "react";
import type {
  WorkflowResumeRequest,
  WorkflowResumeResponse,
  WorkflowSignalRequest,
  WorkflowSignalResponse,
} from "@aevatar-react-sdk/types";

export interface UseHumanInteractionOptions {
  resume: (request: WorkflowResumeRequest) => Promise<WorkflowResumeResponse>;
  signal: (request: WorkflowSignalRequest) => Promise<WorkflowSignalResponse>;
}

export interface UseHumanInteractionReturn {
  resuming: boolean;
  signaling: boolean;
  error?: Error;
  resume: (request: WorkflowResumeRequest) => Promise<WorkflowResumeResponse>;
  signal: (request: WorkflowSignalRequest) => Promise<WorkflowSignalResponse>;
}

export function useHumanInteraction(
  options: UseHumanInteractionOptions,
): UseHumanInteractionReturn {
  const [resuming, setResuming] = useState(false);
  const [signaling, setSignaling] = useState(false);
  const [error, setError] = useState<Error | undefined>();
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const resume = useCallback(
    async (request: WorkflowResumeRequest): Promise<WorkflowResumeResponse> => {
      setResuming(true);
      setError(undefined);
      try {
        return await optionsRef.current.resume(request);
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setResuming(false);
      }
    },
    [],
  );

  const signal = useCallback(
    async (request: WorkflowSignalRequest): Promise<WorkflowSignalResponse> => {
      setSignaling(true);
      setError(undefined);
      try {
        return await optionsRef.current.signal(request);
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setSignaling(false);
      }
    },
    [],
  );

  return { resuming, signaling, error, resume, signal };
}
