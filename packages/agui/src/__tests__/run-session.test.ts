import { describe, it, expect } from "vitest";
import { createRunSession, reduceEvent } from "../run-session";
import { AGUIEventType, CustomEventName, type AGUIEvent } from "@aevatar-react-sdk/types";

describe("RunSession", () => {
  it("starts in idle state", () => {
    const s = createRunSession();
    expect(s.status).toBe("idle");
    expect(s.messages).toHaveLength(0);
    expect(s.events).toHaveLength(0);
  });

  it("transitions to running on RUN_STARTED", () => {
    let s = createRunSession();
    s = reduceEvent(s, {
      type: AGUIEventType.RUN_STARTED,
      threadId: "t1",
      runId: "r1",
    });
    expect(s.status).toBe("running");
    expect(s.runId).toBe("r1");
    expect(s.threadId).toBe("t1");
  });

  it("transitions to finished on RUN_FINISHED", () => {
    let s = createRunSession();
    s = reduceEvent(s, {
      type: AGUIEventType.RUN_STARTED,
      threadId: "t1",
      runId: "r1",
    });
    s = reduceEvent(s, {
      type: AGUIEventType.RUN_FINISHED,
      threadId: "t1",
      runId: "r1",
    });
    expect(s.status).toBe("finished");
  });

  it("transitions to error on RUN_ERROR", () => {
    let s = createRunSession();
    s = reduceEvent(s, {
      type: AGUIEventType.RUN_ERROR,
      message: "boom",
      code: "FAIL",
    });
    expect(s.status).toBe("error");
    expect(s.error).toEqual({ message: "boom", code: "FAIL" });
  });

  it("tracks active steps", () => {
    let s = createRunSession();
    s = reduceEvent(s, {
      type: AGUIEventType.STEP_STARTED,
      stepName: "stepA",
    });
    expect(s.activeSteps.has("stepA")).toBe(true);

    s = reduceEvent(s, {
      type: AGUIEventType.STEP_FINISHED,
      stepName: "stepA",
    });
    expect(s.activeSteps.has("stepA")).toBe(false);
  });

  it("accumulates text messages", () => {
    let s = createRunSession();
    s = reduceEvent(s, {
      type: AGUIEventType.TEXT_MESSAGE_START,
      messageId: "m1",
      role: "assistant",
    });
    expect(s.messages).toHaveLength(1);
    expect(s.messages[0].content).toBe("");
    expect(s.messages[0].complete).toBe(false);

    s = reduceEvent(s, {
      type: AGUIEventType.TEXT_MESSAGE_CONTENT,
      messageId: "m1",
      delta: "hello ",
    });
    s = reduceEvent(s, {
      type: AGUIEventType.TEXT_MESSAGE_CONTENT,
      messageId: "m1",
      delta: "world",
    });
    expect(s.messages[0].content).toBe("hello world");

    s = reduceEvent(s, {
      type: AGUIEventType.TEXT_MESSAGE_END,
      messageId: "m1",
    });
    expect(s.messages[0].complete).toBe(true);
  });

  it("updates lastSnapshot on STATE_SNAPSHOT", () => {
    let s = createRunSession();
    s = reduceEvent(s, {
      type: AGUIEventType.STATE_SNAPSHOT,
      snapshot: { yaml: "test" },
    });
    expect(s.lastSnapshot).toEqual({ yaml: "test" });
  });

  it("sets context on CUSTOM RunContext", () => {
    let s = createRunSession();
    s = reduceEvent(s, {
      type: AGUIEventType.CUSTOM,
      name: CustomEventName.RunContext,
      value: { actorId: "a1", workflowName: "wf" },
    });
    expect(s.context).toMatchObject({
      actorId: "a1",
      workflowName: "wf",
    });
  });

  it("sets pendingHumanInput on CUSTOM HumanInputRequest", () => {
    let s = createRunSession();
    s = reduceEvent(s, {
      type: AGUIEventType.CUSTOM,
      name: CustomEventName.HumanInputRequest,
      value: {
        runId: "r1",
        stepId: "s1",
        prompt: "Approve?",
      },
    });
    expect(s.pendingHumanInput).toMatchObject({
      runId: "r1",
      prompt: "Approve?",
    });
  });

  it("sets pendingHumanInput on HUMAN_INPUT_REQUEST event", () => {
    let s = createRunSession();
    s = reduceEvent(s, {
      type: AGUIEventType.RUN_STARTED,
      threadId: "t1",
      runId: "r1",
    });
    s = reduceEvent(s, {
      type: AGUIEventType.HUMAN_INPUT_REQUEST,
      stepId: "step1",
      runId: "r1",
      suspensionType: "human_input",
      prompt: "Approve deployment?",
      timeoutSeconds: 300,
      metadata: { env: "prod" },
    });
    expect(s.pendingHumanInput).toEqual({
      runId: "r1",
      stepId: "step1",
      suspensionType: "human_input",
      prompt: "Approve deployment?",
      timeoutSeconds: 300,
      metadata: { env: "prod" },
    });
  });

  it("clears pendingHumanInput on HUMAN_INPUT_RESPONSE event", () => {
    let s = createRunSession();
    s = reduceEvent(s, {
      type: AGUIEventType.HUMAN_INPUT_REQUEST,
      stepId: "step1",
      runId: "r1",
      suspensionType: "human_input",
      prompt: "Approve?",
      timeoutSeconds: 60,
    });
    expect(s.pendingHumanInput).toBeDefined();

    s = reduceEvent(s, {
      type: AGUIEventType.HUMAN_INPUT_RESPONSE,
      stepId: "step1",
      runId: "r1",
      approved: true,
      userInput: "yes",
    });
    expect(s.pendingHumanInput).toBeUndefined();
  });

  it("does not mutate previous state (immutability)", () => {
    const s0 = createRunSession();
    const s1 = reduceEvent(s0, {
      type: AGUIEventType.RUN_STARTED,
      threadId: "t1",
      runId: "r1",
    });
    expect(s0.events).toHaveLength(0);
    expect(s0.status).toBe("idle");
    expect(s1.events).toHaveLength(1);
    expect(s1.status).toBe("running");
    expect(s0.events).not.toBe(s1.events);
  });

  it("accumulates all events in order", () => {
    let s = createRunSession();
    const events: AGUIEvent[] = [
      { type: AGUIEventType.RUN_STARTED, threadId: "t1", runId: "r1" },
      { type: AGUIEventType.STEP_STARTED, stepName: "s1" },
      { type: AGUIEventType.STEP_FINISHED, stepName: "s1" },
      { type: AGUIEventType.RUN_FINISHED, threadId: "t1", runId: "r1" },
    ];
    for (const e of events) {
      s = reduceEvent(s, e);
    }
    expect(s.events).toHaveLength(4);
    expect(s.events.map((e) => e.type)).toEqual([
      "RUN_STARTED",
      "STEP_STARTED",
      "STEP_FINISHED",
      "RUN_FINISHED",
    ]);
  });
});
