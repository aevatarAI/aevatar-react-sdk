// ─────────────────────────────────────────────────────────────
// RunSession — tracks the lifecycle state of a single workflow run
//
// Consumes AGUIEvent stream and maintains:
// - Run status (idle/running/finished/error)
// - Active steps
// - Text message accumulation
// - Pending human input requests
// - Latest state snapshot
// ─────────────────────────────────────────────────────────────

import {
  AGUIEventType,
  type AGUIEvent,
  type RunContextData,
  type HumanInputRequestData,
} from "@aevatar-react-sdk/types";
import { parseCustomEvent } from "./custom-event-mapper";
import { CustomEventName } from "@aevatar-react-sdk/types";

export type RunStatus = "idle" | "running" | "finished" | "error";

export interface TextMessage {
  messageId: string;
  role: string;
  content: string;
  complete: boolean;
}

export interface RunSessionState {
  status: RunStatus;
  runId?: string;
  threadId?: string;
  context?: RunContextData;
  activeSteps: Set<string>;
  messages: TextMessage[];
  pendingHumanInput?: HumanInputRequestData;
  lastSnapshot?: unknown;
  error?: { message: string; code?: string };
  events: AGUIEvent[];
}

export function createRunSession(): RunSessionState {
  return {
    status: "idle",
    activeSteps: new Set(),
    messages: [],
    events: [],
  };
}

export function reduceEvent(
  state: RunSessionState,
  event: AGUIEvent,
): RunSessionState {
  const next = { ...state, events: [...state.events, event] };

  switch (event.type) {
    case AGUIEventType.RUN_STARTED:
      return {
        ...next,
        status: "running",
        runId: event.runId,
        threadId: event.threadId,
        error: undefined,
        pendingHumanInput: undefined,
      };

    case AGUIEventType.RUN_FINISHED:
      return { ...next, status: "finished" };

    case AGUIEventType.RUN_ERROR:
      return {
        ...next,
        status: "error",
        error: { message: event.message, code: event.code },
      };

    case AGUIEventType.STEP_STARTED: {
      const steps = new Set(state.activeSteps);
      steps.add(event.stepName);
      return { ...next, activeSteps: steps };
    }

    case AGUIEventType.STEP_FINISHED: {
      const steps = new Set(state.activeSteps);
      steps.delete(event.stepName);
      return { ...next, activeSteps: steps };
    }

    case AGUIEventType.TEXT_MESSAGE_START: {
      const msg: TextMessage = {
        messageId: event.messageId,
        role: event.role,
        content: "",
        complete: false,
      };
      return { ...next, messages: [...state.messages, msg] };
    }

    case AGUIEventType.TEXT_MESSAGE_CONTENT: {
      const msgs = state.messages.map((m) =>
        m.messageId === event.messageId
          ? { ...m, content: m.content + event.delta }
          : m,
      );
      return { ...next, messages: msgs };
    }

    case AGUIEventType.TEXT_MESSAGE_END: {
      const msgs = state.messages.map((m) =>
        m.messageId === event.messageId ? { ...m, complete: true } : m,
      );
      return { ...next, messages: msgs };
    }

    case AGUIEventType.STATE_SNAPSHOT:
      return { ...next, lastSnapshot: event.snapshot };

    case AGUIEventType.HUMAN_INPUT_REQUEST:
      return {
        ...next,
        pendingHumanInput: {
          runId: event.runId,
          stepId: event.stepId,
          suspensionType: event.suspensionType,
          prompt: event.prompt,
          timeoutSeconds: event.timeoutSeconds,
          metadata: event.metadata,
        },
      };

    case AGUIEventType.HUMAN_INPUT_RESPONSE:
      return { ...next, pendingHumanInput: undefined };

    case AGUIEventType.CUSTOM:
      return reduceCustom(next, event);

    default:
      return next;
  }
}

function reduceCustom(
  state: RunSessionState,
  event: Extract<AGUIEvent, { type: "CUSTOM" }>,
): RunSessionState {
  const parsed = parseCustomEvent(event);

  switch (parsed.name) {
    case CustomEventName.RunContext:
      return {
        ...state,
        context: parsed.data as RunContextData,
      };

    case CustomEventName.HumanInputRequest:
      return {
        ...state,
        pendingHumanInput: parsed.data as HumanInputRequestData,
      };

    default:
      return state;
  }
}
