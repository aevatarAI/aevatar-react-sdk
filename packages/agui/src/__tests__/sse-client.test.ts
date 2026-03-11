import { describe, it, expect } from "vitest";
import { parseSSEStream } from "../sse-client";
import { AGUIEventType } from "@aevatar-react-sdk/types";

function mockSSEResponse(body: string, status = 200): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(body));
      controller.close();
    },
  });
  return new Response(stream, {
    status,
    headers: { "Content-Type": "text/event-stream" },
  });
}

describe("parseSSEStream", () => {
  it("parses a single SSE event", async () => {
    const body = `data: ${JSON.stringify({ type: "RUN_STARTED", threadId: "t1", runId: "r1" })}\n\n`;
    const response = mockSSEResponse(body);
    const events = [];
    for await (const event of parseSSEStream(response)) {
      events.push(event);
    }
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe(AGUIEventType.RUN_STARTED);
  });

  it("parses multiple SSE events", async () => {
    const body = [
      `data: ${JSON.stringify({ type: "RUN_STARTED", threadId: "t1", runId: "r1" })}`,
      "",
      `data: ${JSON.stringify({ type: "TEXT_MESSAGE_CONTENT", messageId: "m1", delta: "hi" })}`,
      "",
      `data: ${JSON.stringify({ type: "RUN_FINISHED", threadId: "t1", runId: "r1" })}`,
      "",
      "",
    ].join("\n");

    const response = mockSSEResponse(body);
    const events = [];
    for await (const event of parseSSEStream(response)) {
      events.push(event);
    }
    expect(events).toHaveLength(3);
    expect(events.map((e) => e.type)).toEqual([
      "RUN_STARTED",
      "TEXT_MESSAGE_CONTENT",
      "RUN_FINISHED",
    ]);
  });

  it("ignores [DONE] sentinel", async () => {
    const body = [
      `data: ${JSON.stringify({ type: "RUN_FINISHED", threadId: "t1", runId: "r1" })}`,
      "",
      "data: [DONE]",
      "",
      "",
    ].join("\n");

    const response = mockSSEResponse(body);
    const events = [];
    for await (const event of parseSSEStream(response)) {
      events.push(event);
    }
    expect(events).toHaveLength(1);
  });

  it("throws on non-OK response", async () => {
    const response = mockSSEResponse("error", 500);
    const gen = parseSSEStream(response);
    await expect(gen.next()).rejects.toThrow("SSE request failed: HTTP 500");
  });

  it("skips frames with unknown type", async () => {
    const body = `data: ${JSON.stringify({ type: "TOTALLY_UNKNOWN" })}\n\n`;
    const response = mockSSEResponse(body);
    const events = [];
    for await (const event of parseSSEStream(response)) {
      events.push(event);
    }
    expect(events).toHaveLength(0);
  });

  it("skips malformed JSON lines", async () => {
    const body = [
      "data: {not valid json}",
      "",
      `data: ${JSON.stringify({ type: "RUN_STARTED", threadId: "t1", runId: "r1" })}`,
      "",
      "",
    ].join("\n");

    const response = mockSSEResponse(body);
    const events = [];
    for await (const event of parseSSEStream(response)) {
      events.push(event);
    }
    expect(events).toHaveLength(1);
  });

  it("handles chunked delivery across multiple reads", async () => {
    const line = `data: ${JSON.stringify({ type: "TEXT_MESSAGE_CONTENT", messageId: "m1", delta: "hi" })}\n\n`;
    const mid = Math.floor(line.length / 2);
    const chunk1 = line.slice(0, mid);
    const chunk2 = line.slice(mid);
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(chunk1));
        controller.enqueue(encoder.encode(chunk2));
        controller.close();
      },
    });
    const response = new Response(stream, {
      status: 200,
      headers: { "Content-Type": "text/event-stream" },
    });
    const events = [];
    for await (const event of parseSSEStream(response)) {
      events.push(event);
    }
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("TEXT_MESSAGE_CONTENT");
  });

  it("flushes pending data when stream ends without trailing newline", async () => {
    const body = `data: ${JSON.stringify({ type: "RUN_STARTED", threadId: "t1", runId: "r1" })}`;
    const response = mockSSEResponse(body);
    const events = [];
    for await (const event of parseSSEStream(response)) {
      events.push(event);
    }
    expect(events).toHaveLength(1);
  });
});
