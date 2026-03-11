# @aevatar-react-sdk/agui

AGUI protocol client for Aevatar — SSE and WebSocket transports, event normalization, run session state tracking, and React hooks.

## Install

```bash
pnpm add @aevatar-react-sdk/agui @aevatar-react-sdk/types
```

Peer dependency: `react ^18.0.0 || ^19.0.0`

## Quick Start

```tsx
import { useChatStream } from "@aevatar-react-sdk/agui";
import type { ChatRunRequest } from "@aevatar-react-sdk/types";

// Inject your own stream function (e.g. from ChatService)
const streamChat = async (request: ChatRunRequest, signal: AbortSignal) =>
  fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
    body: JSON.stringify(request),
    signal,
  });

function Chat() {
  const { session, streaming, send, abort } = useChatStream({ streamChat });

  return (
    <div>
      <button onClick={() => send({ prompt: "Hello" })}>Send</button>
      <button onClick={abort} disabled={!streaming}>Stop</button>
      <p>Status: {session.status}</p>
      {session.messages.map((m) => (
        <div key={m.messageId}>{m.content}</div>
      ))}
    </div>
  );
}
```

### With ChatService (recommended)

```tsx
import { useChatStream, useHumanInteraction } from "@aevatar-react-sdk/agui";

// chatService is an instance of ChatService from @aevatar-react-sdk/services
const { session, send, abort } = useChatStream({
  streamChat: (req, signal) => chatService.streamChat(req, { signal }),
});

const { resume, signal } = useHumanInteraction({
  resume: (req) => chatService.resume(req),
  signal: (req) => chatService.signal(req),
});
```

## API

### Transport

| Export | Description |
|--------|-------------|
| `parseSSEStream(response, options?)` | Parse `text/event-stream` Response into `AsyncGenerator<AGUIEvent>` |
| `connectChatWebSocket(request, options?)` | Connect to WebSocket, returns `{ events, close }` |

### Event Processing

| Export | Description |
|--------|-------------|
| `normalizeFrame(frame)` | Convert `WorkflowOutputFrame` to typed `AGUIEvent` |
| `parseCustomEvent(event)` | Parse `CUSTOM` event into typed data structure |

### Run Session

| Export | Description |
|--------|-------------|
| `createRunSession()` | Create initial `RunSessionState` |
| `reduceEvent(state, event)` | Pure reducer: returns new state with event applied |

### React Hooks

| Hook | Description |
|------|-------------|
| `useChatStream(options)` | SSE streaming — requires injected `streamChat` function |
| `useRunSession()` | Standalone session state — `{ session, dispatch, reset }` |
| `useHumanInteraction(options)` | Resume/signal — requires injected `resume` and `signal` functions |

## AGUI Event Types

12 core event types aligned with the Aevatar AGUI protocol:

`RUN_STARTED` · `RUN_FINISHED` · `RUN_ERROR` · `STEP_STARTED` · `STEP_FINISHED` · `TEXT_MESSAGE_START` · `TEXT_MESSAGE_CONTENT` · `TEXT_MESSAGE_END` · `STATE_SNAPSHOT` · `TOOL_CALL_START` · `TOOL_CALL_END` · `CUSTOM`

## Custom Event Names

7 known custom event types:

`aevatar.run.context` · `aevatar.step.request` · `aevatar.step.completed` · `aevatar.human_input.request` · `aevatar.workflow.waiting_signal` · `aevatar.workflow.signal.buffered` · `aevatar.llm.reasoning`

## License

ISC
