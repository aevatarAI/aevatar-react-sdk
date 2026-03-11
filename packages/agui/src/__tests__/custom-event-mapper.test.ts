import { describe, it, expect } from "vitest";
import { parseCustomEvent } from "../custom-event-mapper";
import { CustomEventName, type CustomEvent, AGUIEventType } from "@aevatar-react-sdk/types";

function makeCustom(name: string, value?: unknown): CustomEvent {
  return { type: AGUIEventType.CUSTOM, name, value };
}

describe("parseCustomEvent", () => {
  it("parses RunContext", () => {
    const result = parseCustomEvent(
      makeCustom(CustomEventName.RunContext, {
        actorId: "a1",
        workflowName: "wf1",
        commandId: "c1",
      }),
    );
    expect(result.name).toBe(CustomEventName.RunContext);
    expect(result.data).toEqual({
      actorId: "a1",
      workflowName: "wf1",
      commandId: "c1",
    });
  });

  it("parses HumanInputRequest", () => {
    const result = parseCustomEvent(
      makeCustom(CustomEventName.HumanInputRequest, {
        runId: "r1",
        stepId: "s1",
        suspensionType: "human_approval",
        prompt: "Approve?",
        timeoutSeconds: 30,
      }),
    );
    expect(result.name).toBe(CustomEventName.HumanInputRequest);
    expect(result.data).toMatchObject({
      runId: "r1",
      stepId: "s1",
      prompt: "Approve?",
    });
  });

  it("parses StepRequest", () => {
    const result = parseCustomEvent(
      makeCustom(CustomEventName.StepRequest, {
        runId: "r1",
        stepId: "s2",
        stepType: "llm",
      }),
    );
    expect(result.name).toBe(CustomEventName.StepRequest);
    expect(result.data).toMatchObject({ stepType: "llm" });
  });

  it("parses StepCompleted", () => {
    const result = parseCustomEvent(
      makeCustom(CustomEventName.StepCompleted, {
        runId: "r1",
        stepId: "s2",
        success: true,
        output: "done",
      }),
    );
    expect(result.data).toMatchObject({ success: true, output: "done" });
  });

  it("parses WaitingSignal", () => {
    const result = parseCustomEvent(
      makeCustom(CustomEventName.WaitingSignal, {
        runId: "r1",
        signalName: "user.confirm",
        timeoutMs: 5000,
      }),
    );
    expect(result.data).toMatchObject({ signalName: "user.confirm" });
  });

  it("parses LlmReasoning", () => {
    const result = parseCustomEvent(
      makeCustom(CustomEventName.LlmReasoning, {
        role: "assistant",
        delta: "thinking...",
      }),
    );
    expect(result.data).toMatchObject({ delta: "thinking..." });
  });

  it("parses SignalBuffered", () => {
    const result = parseCustomEvent(
      makeCustom(CustomEventName.SignalBuffered, {
        runId: "r1",
        signalName: "user.confirm",
        payload: "ok",
        receivedAtUnixTimeMs: 1234567890,
      }),
    );
    expect(result.data).toMatchObject({ payload: "ok" });
  });

  it("returns raw value for unknown custom event name", () => {
    const result = parseCustomEvent(
      makeCustom("some.unknown.event", { foo: "bar" }),
    );
    expect(result.name).toBe("some.unknown.event");
    expect(result.data).toEqual({ foo: "bar" });
  });

  it("handles null/undefined value gracefully", () => {
    const result = parseCustomEvent(
      makeCustom(CustomEventName.RunContext, null),
    );
    expect(result.data).toEqual({
      actorId: undefined,
      workflowName: undefined,
      commandId: undefined,
    });
  });
});
