// ─────────────────────────────────────────────────────────────
// Custom Event Mapper — parse CUSTOM event name+value into
// typed data structures. Lookup table, no if/else chains.
// ─────────────────────────────────────────────────────────────

import {
  CustomEventName,
  type CustomEvent,
  type RunContextData,
  type StepRequestData,
  type StepCompletedData,
  type HumanInputRequestData,
  type WaitingSignalData,
  type LlmReasoningData,
  type SignalBufferedData,
} from "@aevatar-react-sdk/types";

export type ParsedCustomEvent =
  | { name: typeof CustomEventName.RunContext; data: RunContextData }
  | { name: typeof CustomEventName.StepRequest; data: StepRequestData }
  | { name: typeof CustomEventName.StepCompleted; data: StepCompletedData }
  | {
      name: typeof CustomEventName.HumanInputRequest;
      data: HumanInputRequestData;
    }
  | { name: typeof CustomEventName.WaitingSignal; data: WaitingSignalData }
  | { name: typeof CustomEventName.LlmReasoning; data: LlmReasoningData }
  | { name: typeof CustomEventName.SignalBuffered; data: SignalBufferedData }
  | { name: string; data: unknown };

function asRecord(v: unknown): Record<string, unknown> {
  return (typeof v === "object" && v !== null ? v : {}) as Record<
    string,
    unknown
  >;
}

type DataExtractor = (value: unknown) => unknown;

const customExtractors: Record<string, DataExtractor> = {
  [CustomEventName.RunContext]: (v): RunContextData => {
    const o = asRecord(v);
    return {
      actorId: o.actorId as string | undefined,
      workflowName: o.workflowName as string | undefined,
      commandId: o.commandId as string | undefined,
    };
  },
  [CustomEventName.StepRequest]: (v): StepRequestData => {
    const o = asRecord(v);
    return {
      runId: o.runId as string | undefined,
      stepId: o.stepId as string | undefined,
      stepType: o.stepType as string | undefined,
      input: o.input as string | undefined,
      targetRole: o.targetRole as string | undefined,
    };
  },
  [CustomEventName.StepCompleted]: (v): StepCompletedData => {
    const o = asRecord(v);
    return {
      runId: o.runId as string | undefined,
      stepId: o.stepId as string | undefined,
      success: o.success as boolean | undefined,
      output: o.output as string | undefined,
      error: o.error as string | undefined,
    };
  },
  [CustomEventName.HumanInputRequest]: (v): HumanInputRequestData => {
    const o = asRecord(v);
    return {
      runId: o.runId as string | undefined,
      stepId: o.stepId as string | undefined,
      suspensionType: o.suspensionType as string | undefined,
      prompt: o.prompt as string | undefined,
      timeoutSeconds: o.timeoutSeconds as number | undefined,
      metadata: o.metadata as Record<string, string> | undefined,
    };
  },
  [CustomEventName.WaitingSignal]: (v): WaitingSignalData => {
    const o = asRecord(v);
    return {
      runId: o.runId as string | undefined,
      stepId: o.stepId as string | undefined,
      signalName: o.signalName as string | undefined,
      prompt: o.prompt as string | undefined,
      timeoutMs: o.timeoutMs as number | undefined,
    };
  },
  [CustomEventName.LlmReasoning]: (v): LlmReasoningData => {
    const o = asRecord(v);
    return {
      role: o.role as string | undefined,
      delta: o.delta as string | undefined,
    };
  },
  [CustomEventName.SignalBuffered]: (v): SignalBufferedData => {
    const o = asRecord(v);
    return {
      runId: o.runId as string | undefined,
      stepId: o.stepId as string | undefined,
      signalName: o.signalName as string | undefined,
      payload: o.payload as string | undefined,
      receivedAtUnixTimeMs: o.receivedAtUnixTimeMs as number | undefined,
    };
  },
};

export function parseCustomEvent(event: CustomEvent): ParsedCustomEvent {
  const extractor = customExtractors[event.name];
  const data = extractor ? extractor(event.value) : event.value;
  return { name: event.name, data } as ParsedCustomEvent;
}
