// ─────────────────────────────────────────────────────────────
// Event Normalizer — WorkflowOutputFrame -> typed AGUIEvent
//
// Single function, zero branches per event type: a lookup table
// maps type strings to extractor functions.
// ─────────────────────────────────────────────────────────────

import {
  AGUIEventType,
  type AGUIEvent,
  type WorkflowOutputFrame,
  type RunStartedEvent,
  type RunFinishedEvent,
  type RunErrorEvent,
  type StepStartedEvent,
  type StepFinishedEvent,
  type TextMessageStartEvent,
  type TextMessageContentEvent,
  type TextMessageEndEvent,
  type StateSnapshotEvent,
  type ToolCallStartEvent,
  type ToolCallEndEvent,
  type HumanInputRequestEvent,
  type HumanInputResponseEvent,
  type CustomEvent,
} from "@aevatar-react-sdk/types";

type FrameExtractor = (f: WorkflowOutputFrame) => AGUIEvent;

const extractors: Record<string, FrameExtractor> = {
  [AGUIEventType.RUN_STARTED]: (f): RunStartedEvent => ({
    type: AGUIEventType.RUN_STARTED,
    timestamp: f.timestamp,
    threadId: (f.threadId ?? "") as string,
    runId: (f.runId ?? "") as string,
  }),
  [AGUIEventType.RUN_FINISHED]: (f): RunFinishedEvent => ({
    type: AGUIEventType.RUN_FINISHED,
    timestamp: f.timestamp,
    threadId: (f.threadId ?? "") as string,
    runId: (f.runId ?? "") as string,
    result: f.result,
  }),
  [AGUIEventType.RUN_ERROR]: (f): RunErrorEvent => ({
    type: AGUIEventType.RUN_ERROR,
    timestamp: f.timestamp,
    message: (f.message ?? "") as string,
    runId: f.runId as string | undefined,
    code: f.code as string | undefined,
  }),
  [AGUIEventType.STEP_STARTED]: (f): StepStartedEvent => ({
    type: AGUIEventType.STEP_STARTED,
    timestamp: f.timestamp,
    stepName: (f.stepName ?? "") as string,
  }),
  [AGUIEventType.STEP_FINISHED]: (f): StepFinishedEvent => ({
    type: AGUIEventType.STEP_FINISHED,
    timestamp: f.timestamp,
    stepName: (f.stepName ?? "") as string,
  }),
  [AGUIEventType.TEXT_MESSAGE_START]: (f): TextMessageStartEvent => ({
    type: AGUIEventType.TEXT_MESSAGE_START,
    timestamp: f.timestamp,
    messageId: (f.messageId ?? "") as string,
    role: (f.role ?? "") as string,
  }),
  [AGUIEventType.TEXT_MESSAGE_CONTENT]: (f): TextMessageContentEvent => ({
    type: AGUIEventType.TEXT_MESSAGE_CONTENT,
    timestamp: f.timestamp,
    messageId: (f.messageId ?? "") as string,
    delta: (f.delta ?? "") as string,
  }),
  [AGUIEventType.TEXT_MESSAGE_END]: (f): TextMessageEndEvent => ({
    type: AGUIEventType.TEXT_MESSAGE_END,
    timestamp: f.timestamp,
    messageId: (f.messageId ?? "") as string,
  }),
  [AGUIEventType.STATE_SNAPSHOT]: (f): StateSnapshotEvent => ({
    type: AGUIEventType.STATE_SNAPSHOT,
    timestamp: f.timestamp,
    snapshot: f.snapshot,
  }),
  [AGUIEventType.TOOL_CALL_START]: (f): ToolCallStartEvent => ({
    type: AGUIEventType.TOOL_CALL_START,
    timestamp: f.timestamp,
    toolCallId: (f.toolCallId ?? "") as string,
    toolName: (f.toolName ?? "") as string,
  }),
  [AGUIEventType.TOOL_CALL_END]: (f): ToolCallEndEvent => ({
    type: AGUIEventType.TOOL_CALL_END,
    timestamp: f.timestamp,
    toolCallId: (f.toolCallId ?? "") as string,
    result: f.result as string | undefined,
  }),
  [AGUIEventType.HUMAN_INPUT_REQUEST]: (f): HumanInputRequestEvent => ({
    type: AGUIEventType.HUMAN_INPUT_REQUEST,
    timestamp: f.timestamp,
    stepId: (f.stepId ?? "") as string,
    runId: (f.runId ?? "") as string,
    suspensionType: (f.suspensionType ?? "") as string,
    prompt: (f.prompt ?? "") as string,
    timeoutSeconds: (f.timeoutSeconds ?? 0) as number,
    metadata: f.metadata,
  }),
  [AGUIEventType.HUMAN_INPUT_RESPONSE]: (f): HumanInputResponseEvent => ({
    type: AGUIEventType.HUMAN_INPUT_RESPONSE,
    timestamp: f.timestamp,
    stepId: (f.stepId ?? "") as string,
    runId: (f.runId ?? "") as string,
    approved: (f.approved ?? false) as boolean,
    userInput: f.userInput as string | undefined,
  }),
  [AGUIEventType.CUSTOM]: (f): CustomEvent => ({
    type: AGUIEventType.CUSTOM,
    timestamp: f.timestamp,
    name: (f.name ?? "") as string,
    value: f.value,
  }),
};

export function normalizeFrame(frame: WorkflowOutputFrame): AGUIEvent | null {
  const extractor = extractors[frame.type];
  return extractor ? extractor(frame) : null;
}
