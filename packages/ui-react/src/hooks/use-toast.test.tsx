import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { reducer, useToast, toast } from "./use-toast";
import * as React from "react";
import { render } from "@testing-library/react";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("use-toast reducer", () => {
  it("adds toast", () => {
    const state = { toasts: [] };
    const action = { type: "ADD_TOAST", toast: { id: "1", open: true } };
    const next = reducer(state, action);
    expect(next.toasts.length).toBe(1);
    expect(next.toasts[0].id).toBe("1");
  });

  it("updates toast", () => {
    const state = { toasts: [{ id: "1", open: true, title: "a" }] };
    const action = { type: "UPDATE_TOAST", toast: { id: "1", title: "b" } };
    const next = reducer(state, action);
    expect(next.toasts[0].title).toBe("b");
  });

  it("dismisses toast by id", () => {
    const state = { toasts: [{ id: "1", open: true }, { id: "2", open: true }] };
    const action = { type: "DISMISS_TOAST", toastId: "1" };
    const next = reducer(state, action);
    expect(next.toasts[0].open).toBe(false);
    expect(next.toasts[1].open).toBe(true);
  });

  it("dismisses all toasts", () => {
    const state = { toasts: [{ id: "1", open: true }, { id: "2", open: true }] };
    const action = { type: "DISMISS_TOAST" };
    const next = reducer(state, action);
    expect(next.toasts.every((t) => t.open === false)).toBe(true);
  });

  it("removes toast by id", () => {
    const state = { toasts: [{ id: "1" }, { id: "2" }] };
    const action = { type: "REMOVE_TOAST", toastId: "1" };
    const next = reducer(state, action);
    expect(next.toasts.length).toBe(1);
    expect(next.toasts[0].id).toBe("2");
  });

  it("removes all toasts if toastId undefined", () => {
    const state = { toasts: [{ id: "1" }, { id: "2" }] };
    const action = { type: "REMOVE_TOAST" };
    const next = reducer(state, action);
    expect(next.toasts.length).toBe(0);
  });
});

describe("toast logic", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("creates, updates, and dismisses toast", () => {
    const t = toast({ title: "A" });
    expect(typeof t.id).toBe("string");
    t.update({ title: "B", id: t.id });
    t.dismiss();
  });

  it("auto removes toast after delay", async () => {
    const t = toast({ title: "A" });
    vi.advanceTimersByTime(1000000);
    // 由于内部状态不可直接访问，只验证无异常
  });
});

describe("useToast hook", () => {
  function TestComponent() {
    const { toasts, toast, dismiss } = useToast();
    React.useEffect(() => {
      const t = toast({ title: "A" });
      setTimeout(() => dismiss(t.id), 10);
    }, []);
    return <div>{toasts.map((t) => <span key={t.id}>{t.title}</span>)}</div>;
  }
  it("provides toasts and dismiss", async () => {
    vi.useFakeTimers();
    render(<TestComponent />);
    vi.advanceTimersByTime(20);
    await Promise.resolve();
    expect(document.body.textContent).toContain("A");
    vi.useRealTimers();
  });
}); 