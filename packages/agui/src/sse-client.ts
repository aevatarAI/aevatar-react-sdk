// ─────────────────────────────────────────────────────────────
// SSE Client — POST /api/chat -> text/event-stream parser
//
// Yields typed AGUIEvent objects from the SSE stream.
// Consumer provides the raw Response (from ChatService.streamChat).
// ─────────────────────────────────────────────────────────────

import type { AGUIEvent, WorkflowOutputFrame } from "@aevatar-react-sdk/types";
import { normalizeFrame } from "./event-normalizer";

export interface SSEClientOptions {
  signal?: AbortSignal;
  onRawFrame?: (frame: WorkflowOutputFrame) => void;
}

export async function* parseSSEStream(
  response: Response,
  options?: SSEClientOptions,
): AsyncGenerator<AGUIEvent, void, undefined> {
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `SSE request failed: HTTP ${response.status} — ${text || response.statusText}`,
    );
  }

  const body = response.body;
  if (!body) {
    throw new Error("SSE response has no readable body.");
  }

  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const dataLines: string[] = [];

  try {
    while (true) {
      if (options?.signal?.aborted) break;

      const { done, value } = await reader.read();

      if (!done) {
        buffer += decoder.decode(value, { stream: true });
      } else if (buffer.length > 0) {
        buffer += "\n";
      }

      const lines = buffer.split("\n");
      buffer = done ? "" : (lines.pop() ?? "");

      for (const line of lines) {
        if (line === "" || line === "\r") {
          if (dataLines.length > 0) {
            const event = flushDataLines(dataLines, options);
            if (event) yield event;
          }
          continue;
        }

        if (line.startsWith("data:")) {
          const segment = line.length > 5 ? line.slice(5) : "";
          dataLines.push(segment.startsWith(" ") ? segment.slice(1) : segment);
        }
      }

      if (done) {
        if (dataLines.length > 0) {
          const event = flushDataLines(dataLines, options);
          if (event) yield event;
        }
        break;
      }
    }
  } finally {
    reader.releaseLock();
  }
}

function flushDataLines(
  dataLines: string[],
  options?: SSEClientOptions,
): AGUIEvent | null {
  const payload = dataLines.splice(0, dataLines.length).join("\n").trim();

  if (!payload || payload === "[DONE]") return null;

  let frame: WorkflowOutputFrame;
  try {
    frame = JSON.parse(payload) as WorkflowOutputFrame;
  } catch {
    return null;
  }

  if (!frame.type) return null;

  options?.onRawFrame?.(frame);
  return normalizeFrame(frame);
}
