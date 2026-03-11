# Code Review — @aevatar-react-sdk/agui + services/types extensions

> Initial review: 2026-03-09
> Re-verification: 2026-03-10
> Scope: all unstaged & untracked changes

---

## Summary

| Verdict | Detail |
|---------|--------|
| Overall quality | **Good** — clean architecture, proper discriminated unions, lookup-table pattern, solid test coverage |
| Initial issues | 8 (2 P0, 2 P1, 4 P2/P3) |
| Fixed | 7 |
| Remaining | 1 (P3) |

---

## What's Done Right

1. **Lookup-table eliminates branching** — `event-normalizer.ts` and `custom-event-mapper.ts` use `Record<string, Extractor>` instead of switch/if chains.
2. **AsyncGenerator as stream abstraction** — Both SSE and WebSocket yield `AGUIEvent` via `AsyncGenerator`. One river, two sources.
3. **Reducer pattern for RunSession** — Pure function `reduceEvent()` + immutable spread. State flows in one direction.
4. **Discriminated unions in the type system** — `AGUIEvent` (12 variants) and `ChatWsEnvelope` (3 variants) let TypeScript do exhaustiveness checking.
5. **Thorough edge-case testing** — 5 test files, 48 tests passing, covering: malformed JSON, chunked delivery, trailing newline absence, unknown types, null values, WebSocket protocol.
6. **Clean package boundaries** — `agui` depends only on `types`. `ChatService.streamChat()` returns raw `Response`, leaving parse ownership to `agui`.
7. **Dependency injection in hooks** — `useChatStream` and `useHumanInteraction` accept injected functions, never call `fetch` directly.

---

## Issue Status

### P0-1 · `reduceEvent` mutates `state.events` — FIXED

- **Evidence**: Line 56 now reads `const next = { ...state, events: [...state.events, event] }`. All branches spread from `next`.

---

### P0-2 · `useChatStream` hardcoded fetch — FIXED

- **Evidence**: `UseChatStreamOptions.streamChat` is now a required injected function. No `fetch` call in the hook.

---

### P0-3 · `useHumanInteraction` hardcoded fetch — FIXED

- **Evidence**: `UseHumanInteractionOptions` requires injected `resume` and `signal` functions. No `fetch` call in the hook.

---

### P1-1 · `ChatService.streamChat()` bypasses `_request` — FIXED

- **Evidence**: `resolveBaseUrl()` reads `this._request._defaults.baseURL` (matching `FetchRequest` from `@portkey/request`). `resolveAuthHeaders()` reads `this._request.commonHeaders.Authorization` (matching `AevatarRequest`). Auth headers and base URL now flow through.

---

### P1-2 · `useChatStream` callback dependency instability — FIXED

- **Evidence**: Uses `useRef(options)` pattern. `send` depends only on `[abort]`.

---

### P2-1 · vitest version mismatch — FIXED

- **Evidence**: Root `package.json` now has `vitest: ^3.0.6`, aligned with all sub-packages.

---

### P2-2 · `core/package.json` repository.directory wrong — FIXED

- **Evidence**: Now reads `"directory": "packages/core"`.

---

### P3-1 · `WorkflowOutputFrame` index signature — OPEN

- **File**: `packages/types/src/agui.ts:50`
- **Current**: `[key: string]: unknown` still present.
- **Recommendation**: Remove. The `CUSTOM` event type with `value?: unknown` already provides the formal extensibility channel. The index signature silently accepts any property name, defeating type-checking for the 20+ explicitly declared fields.
- **Severity**: Low — does not block publishing, but erodes type safety for consumers.

---

### P3-2 · Endpoint path duplication — FIXED

- **Evidence**: Resolves naturally from P0-2 fix. `useChatStream` no longer constructs URLs.

---

## Publish Readiness Assessment

### Build

| Package | Status | Notes |
|---------|--------|-------|
| `@aevatar-react-sdk/types` | **PASS** | Builds clean |
| `@aevatar-react-sdk/services` | **PASS** | Builds clean |
| `@aevatar-react-sdk/agui` | **PASS** | Builds clean, produces ESM + CJS + d.ts + sourcemaps |
| `@aevatar-react-sdk/ui-react` | **WARN** | TS2322 in `ExecutionList/index.tsx:133` (pre-existing, not related to this changeset) |

### Tests

| Package | Status | Notes |
|---------|--------|-------|
| `@aevatar-react-sdk/agui` | **48/48 PASS** | 5 test files, all green |

### Coverage

| Area | Stmts | Branch | Funcs |
|------|-------|--------|-------|
| Core logic (sse, ws, normalizer, mapper, session) | 91.6% | 68.2% | 88.1% |
| React hooks | 0% | — | — |

**Hook coverage is 0%.** Not a blocker for alpha, but hooks should have tests before GA. The pure-logic modules are well covered.

### Package Tarball (`npm pack --dry-run`)

- 16 files, 26.5 kB packed
- Includes: `dist/` (ESM + CJS + d.ts + sourcemaps) + `README.md` + `package.json`
- `files` field correctly scopes to `dist/*` and `README.md`
- Exports map (`"."`) correctly configured for `types`, `import`, `require`

### Changeset

| Check | Status | Notes |
|-------|--------|-------|
| `@aevatar-react-sdk/agui` in `pre.json` | **MISSING** | `pre.json` lists 5 packages but not `agui`. Must add before changeset versioning. |
| Changeset entry for new package | **MISSING** | No `.changeset/*.md` file describes the `agui` addition. Need `pnpm changeset` to create one. |
| `changeset config.json` access | `"restricted"` | Correct for scoped packages during alpha. |

### README

- Present and accurate for the **old** API (before injection refactor).
- **STALE**: Quick Start example shows `useChatStream()` without the now-required `streamChat` option.

### Miscellaneous

| Check | Status |
|-------|--------|
| `package.json` author field | `"AevatarAI"` — good |
| `package.json` keywords | Present — good |
| `package.json` license | `"ISC"` — consistent with other packages |
| `package.json` repository | Correct path `packages/agui` |
| `peerDependencies` react range | `^18.0.0 \|\| ^19.0.0` — good |
| `@vitest/coverage-v8` version mismatch warning | `3.0.6` vs `vitest 3.1.3` resolved — runtime warning but non-blocking |

---

## Blocking Issues for Publish

| # | Issue | Action |
|---|-------|--------|
| 1 | **Changeset missing** for `@aevatar-react-sdk/agui` | Run `pnpm changeset` and create entry |
| 2 | **`pre.json` missing `agui`** | Add `"@aevatar-react-sdk/agui": "0.0.0-alpha.1"` to `initialVersions` |
| 3 | **README stale** | Update Quick Start to show required `streamChat` injection |

## Non-blocking Recommendations

| # | Recommendation | Priority |
|---|---------------|----------|
| 1 | Remove `WorkflowOutputFrame` index signature (P3-1) | Low |
| 2 | Add hook tests before GA release | Medium |
| 3 | Align `@vitest/coverage-v8` to `3.1.x` to match `vitest 3.1.3` | Low |
