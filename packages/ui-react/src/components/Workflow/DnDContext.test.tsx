import "@testing-library/jest-dom";
import { renderHook, act } from "@testing-library/react-hooks";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DnDProvider, useDnD } from "./DnDContext";
import React from "react";
import { sleep } from "@aevatar-react-sdk/utils";

// Test Suite for DnDContext and useDnD hook
describe("DnDContext and useDnD Hook", () => {
  it("should provide the default context value", () => {
    // Render the hook inside DnDProvider
    const { result } = renderHook(() => useDnD(), { wrapper: DnDProvider });

    const [state, setState] = result.current;

    // Assert: Default value of 'state' is null
    expect(state).toBeNull();

    // Assert: setState is a function
    expect(typeof setState).toBe("function");
  });

  it("should allow updating drag item state through useDnD", () => {
    const { result } = renderHook(() => useDnD(), { wrapper: DnDProvider });

    // Update drag item state using setState
    act(() => {
      result.current[1]({
        nodeType: "new",
        agentInfo: { id: "test-id", name: "Test Agent" },
      });
    });

    const [state] = result.current;

    // Assert: drag item state has been updated
    expect(state).toEqual({
      nodeType: "new",
      agentInfo: { id: "test-id", name: "Test Agent" },
    });
  });

  it("should allow child components to use drag item state", () => {
    const TestComponent = () => {
      const [dragItem] = useDnD();
      console.log(dragItem, "dragItem====useDnD");
      return dragItem ? (
        <div data-testid="drag-item-id">{dragItem.agentInfo?.id}</div>
      ) : (
        <div data-testid="default-text">No Drag Item</div>
      );
    };

    // Initial render of the component inside the DnDProvider
    render(
      <DnDProvider>
        <TestComponent />
      </DnDProvider>
    );

    // 1. Assert that the default (initial) text is being rendered
    expect(screen.getByTestId("default-text")).toHaveTextContent(
      "No Drag Item"
    );

    // 2. Update the state through context using the useDnD hook
    const { result } = renderHook(() => useDnD(), { wrapper: DnDProvider });
    act(() => {
      const [, setDragItem] = result.current;
      setDragItem({
        nodeType: "new",
        agentInfo: { id: "1234" },
      });
    });

    expect(result.current[0]?.nodeType).toEqual("new");
    expect(result.current[0]?.agentInfo).toEqual({ id: "1234" });
  });

  it("should allow updating drag item state from a child component", () => {
    // Mock component to consume and modify state
    const TestComponent = () => {
      const [dragItem, setDragItem] = useDnD();

      return (
        <div>
          {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
          <button
            onClick={() =>
              setDragItem({ nodeType: "default", agentInfo: { id: "test-id" } })
            }>
            Set Drag Item
          </button>
          {dragItem ? (
            <div data-testid="drag-item-id">{dragItem.agentInfo?.id}</div>
          ) : (
            <div data-testid="default-text">No Drag Item</div>
          )}
        </div>
      );
    };

    // Render TestComponent inside DnDProvider
    render(
      <DnDProvider>
        <TestComponent />
      </DnDProvider>
    );

    // Assert: Default state is rendered
    expect(screen.getByTestId("default-text")).toHaveTextContent(
      "No Drag Item"
    );

    // Click button to update state
    const button = screen.getByText("Set Drag Item");
    fireEvent.click(button);

    // Assert: State is updated and reflected in the UI
    expect(screen.queryByTestId("default-text")).not.toBeInTheDocument();
    expect(screen.getByTestId("drag-item-id")).toHaveTextContent("test-id");
  });
});
