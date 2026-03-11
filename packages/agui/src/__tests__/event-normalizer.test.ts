import { describe, it, expect } from "vitest";
import { normalizeFrame } from "../event-normalizer";
import { AGUIEventType, type WorkflowOutputFrame } from "@aevatar-react-sdk/types";

describe("normalizeFrame", () => {
  it("normalizes RUN_STARTED frame", () => {
    const frame: WorkflowOutputFrame = {
      type: AGUIEventType.RUN_STARTED,
      timestamp: 1000,
      threadId: "t1",
      runId: "r1",
    };
    const event = normalizeFrame(frame);
    expect(event).toEqual({
      type: "RUN_STARTED",
      timestamp: 1000,
      threadId: "t1",
      runId: "r1",
    });
  });

  it("normalizes RUN_FINISHED frame with result", () => {
    const frame: WorkflowOutputFrame = {
      type: AGUIEventType.RUN_FINISHED,
      threadId: "t1",
      runId: "r1",
      result: { ok: true },
    };
    expect(normalizeFrame(frame)?.type).toBe("RUN_FINISHED");
  });

  it("normalizes RUN_ERROR frame", () => {
    const frame: WorkflowOutputFrame = {
      type: AGUIEventType.RUN_ERROR,
      message: "boom",
      code: "FAIL",
    };
    const event = normalizeFrame(frame);
    expect(event).toMatchObject({
      type: "RUN_ERROR",
      message: "boom",
      code: "FAIL",
    });
  });

  it("normalizes TEXT_MESSAGE_CONTENT frame", () => {
    const frame: WorkflowOutputFrame = {
      type: AGUIEventType.TEXT_MESSAGE_CONTENT,
      messageId: "m1",
      delta: "hello",
    };
    const event = normalizeFrame(frame);
    expect(event).toMatchObject({
      type: "TEXT_MESSAGE_CONTENT",
      messageId: "m1",
      delta: "hello",
    });
  });

  it("normalizes STEP_STARTED / STEP_FINISHED", () => {
    expect(
      normalizeFrame({ type: AGUIEventType.STEP_STARTED, stepName: "s1" }),
    ).toMatchObject({ type: "STEP_STARTED", stepName: "s1" });

    expect(
      normalizeFrame({ type: AGUIEventType.STEP_FINISHED, stepName: "s1" }),
    ).toMatchObject({ type: "STEP_FINISHED", stepName: "s1" });
  });

  it("normalizes TOOL_CALL_START / TOOL_CALL_END", () => {
    expect(
      normalizeFrame({
        type: AGUIEventType.TOOL_CALL_START,
        toolCallId: "tc1",
        toolName: "search",
      }),
    ).toMatchObject({ type: "TOOL_CALL_START", toolCallId: "tc1" });

    expect(
      normalizeFrame({
        type: AGUIEventType.TOOL_CALL_END,
        toolCallId: "tc1",
      }),
    ).toMatchObject({ type: "TOOL_CALL_END", toolCallId: "tc1" });
  });

  it("normalizes CUSTOM frame", () => {
    const frame: WorkflowOutputFrame = {
      type: AGUIEventType.CUSTOM,
      name: "aevatar.run.context",
      value: { actorId: "a1" },
    };
    const event = normalizeFrame(frame);
    expect(event).toMatchObject({
      type: "CUSTOM",
      name: "aevatar.run.context",
    });
  });

  it("normalizes STATE_SNAPSHOT frame", () => {
    const frame: WorkflowOutputFrame = {
      type: AGUIEventType.STATE_SNAPSHOT,
      snapshot: { workflow: "test" },
    };
    expect(normalizeFrame(frame)).toMatchObject({
      type: "STATE_SNAPSHOT",
      snapshot: { workflow: "test" },
    });
  });

  it("normalizes HUMAN_INPUT_REQUEST frame", () => {
    const frame: WorkflowOutputFrame = {
      type: AGUIEventType.HUMAN_INPUT_REQUEST,
      stepId: "step1",
      runId: "run1",
      suspensionType: "human_input",
      prompt: "Please approve",
      timeoutSeconds: 300,
      metadata: { key: "val" },
    };
    const event = normalizeFrame(frame);
    expect(event).toEqual({
      type: "HUMAN_INPUT_REQUEST",
      timestamp: undefined,
      stepId: "step1",
      runId: "run1",
      suspensionType: "human_input",
      prompt: "Please approve",
      timeoutSeconds: 300,
      metadata: { key: "val" },
    });
  });

  it("normalizes HUMAN_INPUT_RESPONSE frame", () => {
    const frame: WorkflowOutputFrame = {
      type: AGUIEventType.HUMAN_INPUT_RESPONSE,
      stepId: "step1",
      runId: "run1",
      approved: true,
      userInput: "yes",
    };
    const event = normalizeFrame(frame);
    expect(event).toEqual({
      type: "HUMAN_INPUT_RESPONSE",
      timestamp: undefined,
      stepId: "step1",
      runId: "run1",
      approved: true,
      userInput: "yes",
    });
  });

  it("returns null for unknown event type", () => {
    const frame = { type: "UNKNOWN_TYPE" as any };
    expect(normalizeFrame(frame)).toBeNull();
  });

  it("handles missing optional fields gracefully", () => {
    const frame: WorkflowOutputFrame = {
      type: AGUIEventType.RUN_STARTED,
    };
    const event = normalizeFrame(frame);
    expect(event).toMatchObject({
      type: "RUN_STARTED",
      threadId: "",
      runId: "",
    });
  });
});
