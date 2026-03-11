import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { connectChatWebSocket } from "../ws-client";
import { AGUIEventType } from "@aevatar-react-sdk/types";

class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  onopen: (() => void) | null = null;
  onmessage: ((msg: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  onclose: (() => void) | null = null;

  sentMessages: string[] = [];
  closeCalled = false;

  constructor(_url: string) {
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      this.onopen?.();
    }, 0);
  }

  send(data: string) {
    this.sentMessages.push(data);
  }

  close(_code?: number, _reason?: string) {
    this.closeCalled = true;
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.();
  }

  simulateMessage(data: unknown) {
    this.onmessage?.({ data: JSON.stringify(data) });
  }

  simulateError() {
    this.onerror?.();
  }
}

let mockWsInstance: MockWebSocket | null = null;

beforeEach(() => {
  mockWsInstance = null;
  vi.stubGlobal("WebSocket", class extends MockWebSocket {
    constructor(url: string) {
      super(url);
      mockWsInstance = this;
    }
  });
  vi.stubGlobal("crypto", { randomUUID: () => "test-uuid" });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("connectChatWebSocket", () => {
  it("sends chat.command on open", async () => {
    const { close } = connectChatWebSocket(
      { prompt: "Hello" },
      { url: "ws://localhost/api/ws/chat" },
    );

    await vi.waitFor(() => expect(mockWsInstance).not.toBeNull());
    await vi.waitFor(() => expect(mockWsInstance!.sentMessages).toHaveLength(1));

    const sent = JSON.parse(mockWsInstance!.sentMessages[0]);
    expect(sent.type).toBe("chat.command");
    expect(sent.payload.prompt).toBe("Hello");
    expect(sent.requestId).toBe("test-uuid");
    close();
  });

  it("calls onAck for command.ack messages", async () => {
    const onAck = vi.fn();
    const { close } = connectChatWebSocket(
      { prompt: "Hello" },
      { url: "ws://localhost/api/ws/chat", onAck },
    );

    await vi.waitFor(() => expect(mockWsInstance).not.toBeNull());
    await vi.waitFor(() => expect(mockWsInstance!.readyState).toBe(MockWebSocket.OPEN));

    mockWsInstance!.simulateMessage({
      type: "command.ack",
      requestId: "r1",
      correlationId: "c1",
      payload: { commandId: "cmd1", actorId: "a1", workflow: "wf1" },
    });

    expect(onAck).toHaveBeenCalledWith({
      commandId: "cmd1",
      actorId: "a1",
      workflow: "wf1",
    });
    close();
  });

  it("yields AGUIEvent for agui.event messages", async () => {
    const { events, close } = connectChatWebSocket(
      { prompt: "Hello" },
      { url: "ws://localhost/api/ws/chat" },
    );

    await vi.waitFor(() => expect(mockWsInstance).not.toBeNull());
    await vi.waitFor(() => expect(mockWsInstance!.readyState).toBe(MockWebSocket.OPEN));

    mockWsInstance!.simulateMessage({
      type: "agui.event",
      requestId: "r1",
      correlationId: "c1",
      payload: { type: "RUN_STARTED", threadId: "t1", runId: "r1" },
    });

    mockWsInstance!.close();

    const collected = [];
    for await (const event of events) {
      collected.push(event);
    }

    expect(collected).toHaveLength(1);
    expect(collected[0].type).toBe(AGUIEventType.RUN_STARTED);
    close();
  });

  it("calls onError and finishes on command.error", async () => {
    const onError = vi.fn();
    const { events, close } = connectChatWebSocket(
      { prompt: "Hello" },
      { url: "ws://localhost/api/ws/chat", onError },
    );

    await vi.waitFor(() => expect(mockWsInstance).not.toBeNull());
    await vi.waitFor(() => expect(mockWsInstance!.readyState).toBe(MockWebSocket.OPEN));

    mockWsInstance!.simulateMessage({
      type: "command.error",
      requestId: "r1",
      correlationId: "c1",
      code: "FAIL",
      message: "Something broke",
    });

    const collected = [];
    for await (const event of events) {
      collected.push(event);
    }

    expect(onError).toHaveBeenCalledWith("FAIL", "Something broke");
    expect(collected).toHaveLength(0);
    close();
  });

  it("calls onError on WebSocket error event", async () => {
    const onError = vi.fn();
    const { events, close } = connectChatWebSocket(
      { prompt: "Hello" },
      { url: "ws://localhost/api/ws/chat", onError },
    );

    await vi.waitFor(() => expect(mockWsInstance).not.toBeNull());
    await vi.waitFor(() => expect(mockWsInstance!.readyState).toBe(MockWebSocket.OPEN));

    mockWsInstance!.simulateError();

    const collected = [];
    for await (const event of events) {
      collected.push(event);
    }

    expect(onError).toHaveBeenCalledWith("WS_ERROR", "WebSocket connection error.");
    expect(collected).toHaveLength(0);
    close();
  });

  it("close() closes the socket", async () => {
    const { close } = connectChatWebSocket(
      { prompt: "Hello" },
      { url: "ws://localhost/api/ws/chat" },
    );

    await vi.waitFor(() => expect(mockWsInstance).not.toBeNull());
    await vi.waitFor(() => expect(mockWsInstance!.readyState).toBe(MockWebSocket.OPEN));

    close();
    expect(mockWsInstance!.closeCalled).toBe(true);
  });
});
