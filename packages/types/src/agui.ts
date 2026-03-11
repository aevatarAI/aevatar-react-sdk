// ─────────────────────────────────────────────────────────────
// AGUI Protocol — Agent-UI event stream type definitions
// Mirrors: Aevatar.Presentation.AGUI.AGUIEvents
//          Aevatar.Workflow.Sdk.Contracts.WorkflowContracts
// ─────────────────────────────────────────────────────────────

export const AGUIEventType = {
  RUN_STARTED: "RUN_STARTED",
  RUN_FINISHED: "RUN_FINISHED",
  RUN_ERROR: "RUN_ERROR",
  STEP_STARTED: "STEP_STARTED",
  STEP_FINISHED: "STEP_FINISHED",
  TEXT_MESSAGE_START: "TEXT_MESSAGE_START",
  TEXT_MESSAGE_CONTENT: "TEXT_MESSAGE_CONTENT",
  TEXT_MESSAGE_END: "TEXT_MESSAGE_END",
  STATE_SNAPSHOT: "STATE_SNAPSHOT",
  TOOL_CALL_START: "TOOL_CALL_START",
  TOOL_CALL_END: "TOOL_CALL_END",
  HUMAN_INPUT_REQUEST: "HUMAN_INPUT_REQUEST",
  HUMAN_INPUT_RESPONSE: "HUMAN_INPUT_RESPONSE",
  CUSTOM: "CUSTOM",
} as const;

export type AGUIEventType = (typeof AGUIEventType)[keyof typeof AGUIEventType];

// ─── Flat envelope from backend SSE / WS ───

export interface WorkflowOutputFrame {
  type: AGUIEventType;
  timestamp?: number;
  threadId?: string;
  runId?: string;
  result?: unknown;
  message?: string;
  code?: string;
  stepName?: string;
  messageId?: string;
  role?: string;
  delta?: string;
  snapshot?: unknown;
  toolCallId?: string;
  toolName?: string;
  name?: string;
  value?: unknown;
  stepId?: string;
  suspensionType?: string;
  prompt?: string;
  timeoutSeconds?: number;
  metadata?: Record<string, string>;
  approved?: boolean;
  userInput?: string;
}

// ─── Typed event discriminated union ───

export interface RunStartedEvent {
  type: typeof AGUIEventType.RUN_STARTED;
  timestamp?: number;
  threadId: string;
  runId: string;
}

export interface RunFinishedEvent {
  type: typeof AGUIEventType.RUN_FINISHED;
  timestamp?: number;
  threadId: string;
  runId: string;
  result?: unknown;
}

export interface RunErrorEvent {
  type: typeof AGUIEventType.RUN_ERROR;
  timestamp?: number;
  message: string;
  runId?: string;
  code?: string;
}

export interface StepStartedEvent {
  type: typeof AGUIEventType.STEP_STARTED;
  timestamp?: number;
  stepName: string;
}

export interface StepFinishedEvent {
  type: typeof AGUIEventType.STEP_FINISHED;
  timestamp?: number;
  stepName: string;
}

export interface TextMessageStartEvent {
  type: typeof AGUIEventType.TEXT_MESSAGE_START;
  timestamp?: number;
  messageId: string;
  role: string;
}

export interface TextMessageContentEvent {
  type: typeof AGUIEventType.TEXT_MESSAGE_CONTENT;
  timestamp?: number;
  messageId: string;
  delta: string;
}

export interface TextMessageEndEvent {
  type: typeof AGUIEventType.TEXT_MESSAGE_END;
  timestamp?: number;
  messageId: string;
}

export interface StateSnapshotEvent {
  type: typeof AGUIEventType.STATE_SNAPSHOT;
  timestamp?: number;
  snapshot: unknown;
}

export interface ToolCallStartEvent {
  type: typeof AGUIEventType.TOOL_CALL_START;
  timestamp?: number;
  toolCallId: string;
  toolName: string;
}

export interface ToolCallEndEvent {
  type: typeof AGUIEventType.TOOL_CALL_END;
  timestamp?: number;
  toolCallId: string;
  result?: string;
}

export interface HumanInputRequestEvent {
  type: typeof AGUIEventType.HUMAN_INPUT_REQUEST;
  timestamp?: number;
  stepId: string;
  runId: string;
  suspensionType: string;
  prompt: string;
  timeoutSeconds: number;
  metadata?: Record<string, string>;
}

export interface HumanInputResponseEvent {
  type: typeof AGUIEventType.HUMAN_INPUT_RESPONSE;
  timestamp?: number;
  stepId: string;
  runId: string;
  approved: boolean;
  userInput?: string;
}

export interface CustomEvent {
  type: typeof AGUIEventType.CUSTOM;
  timestamp?: number;
  name: string;
  value?: unknown;
}

export type AGUIEvent =
  | RunStartedEvent
  | RunFinishedEvent
  | RunErrorEvent
  | StepStartedEvent
  | StepFinishedEvent
  | TextMessageStartEvent
  | TextMessageContentEvent
  | TextMessageEndEvent
  | StateSnapshotEvent
  | ToolCallStartEvent
  | ToolCallEndEvent
  | HumanInputRequestEvent
  | HumanInputResponseEvent
  | CustomEvent;

// ─── Custom event name constants ───
// Mirrors: Aevatar.Workflow.Sdk.Contracts.WorkflowCustomEventNames

export const CustomEventName = {
  RunContext: "aevatar.run.context",
  StepRequest: "aevatar.step.request",
  StepCompleted: "aevatar.step.completed",
  HumanInputRequest: "aevatar.human_input.request",
  WaitingSignal: "aevatar.workflow.waiting_signal",
  SignalBuffered: "aevatar.workflow.signal.buffered",
  LlmReasoning: "aevatar.llm.reasoning",
} as const;

export type CustomEventName =
  (typeof CustomEventName)[keyof typeof CustomEventName];

// ─── Custom event data shapes ───

export interface RunContextData {
  actorId?: string;
  workflowName?: string;
  commandId?: string;
}

export interface StepRequestData {
  runId?: string;
  stepId?: string;
  stepType?: string;
  input?: string;
  targetRole?: string;
}

export interface StepCompletedData {
  runId?: string;
  stepId?: string;
  success?: boolean;
  output?: string;
  error?: string;
}

export interface HumanInputRequestData {
  runId?: string;
  stepId?: string;
  suspensionType?: string;
  prompt?: string;
  timeoutSeconds?: number;
  metadata?: Record<string, string>;
}

export interface WaitingSignalData {
  runId?: string;
  stepId?: string;
  signalName?: string;
  prompt?: string;
  timeoutMs?: number;
}

export interface LlmReasoningData {
  role?: string;
  delta?: string;
}

export interface SignalBufferedData {
  runId?: string;
  stepId?: string;
  signalName?: string;
  payload?: string;
  receivedAtUnixTimeMs?: number;
}
