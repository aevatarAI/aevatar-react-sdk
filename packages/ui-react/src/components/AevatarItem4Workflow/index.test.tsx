import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { ReactFlowProvider } from "@xyflow/react";
import { describe, it, vi, expect } from "vitest";
import AevatarItem4Workflow from "./index";
import AevatarCardInner from "./AevatarCardInner";
import React from "react";
import WorkflowProvider from "../context/WorkflowProvider";

// Mock the `AevatarCardInner` component to simplify testing
vi.mock("./AevatarCardInner", () => ({
  __esModule: true,
  default: (props: any) => {
    const { agentInfo, isNew } = props;
    return (
      <div data-testid="aevatar-card-inner">
        Agent Info: {agentInfo ? agentInfo.name : "No Agent"}
        <span>{isNew ? "New Aevatar" : "Existing Aevatar"}</span>
      </div>
    );
  },
}));

// Mock specific parts of `@xyflow/react`, retaining the original `ReactFlowProvider`
vi.mock("@xyflow/react", async () => {
  const actual = await vi.importActual("@xyflow/react");
  return {
    ...actual, // Retain all original exports
    Handle: ({ type, position, style, id }: any) => (
      <div
        aria-label={`${type} handle`}
        data-position={position}
        data-testid="handle"
        id={id}
        style={{
          ...style,
          // Ensure numeric values are converted to strings with px for testing
          width: typeof style?.width === 'number' ? `${style.width}px` : style?.width,
          height: typeof style?.height === 'number' ? `${style.height}px` : style?.height,
        }}
      />
    ),
    Position: {
      Left: "left",
      Right: "right",
    },
  };
});

// Mock Toaster component to avoid context issues
vi.mock("../ui/toaster", () => ({
  Toaster: () => <div data-testid="toaster" />,
}));

describe("AevatarItem4Workflow", () => {
  const mockOnClick = vi.fn();
  const mockDeleteNode = vi.fn();

  const mockProps = {
    id: "node-1",
    data: {
      agentInfo: {
        id: "123",
        name: "Agent 123",
        agentType: "Test Type",
        properties: {
          name: "Test Agent",
          status: "Active",
        },
        propertyJsonSchema: "{}",
        agentGuid: "",
        businessAgentGrainId: "",
      },
      deleteNode: mockDeleteNode,
      onClick: mockOnClick,
      isNew: true,
    },
  };

  it("renders correctly with left and right `Handle` components", () => {
    render(
      <WorkflowProvider>
        <ReactFlowProvider>
          <AevatarItem4Workflow {...mockProps} />
        </ReactFlowProvider>
      </WorkflowProvider>
    );

    // Assert that the left `Handle` is rendered with correct position and styles
    const leftHandle = screen.getByLabelText("target handle");
    expect(leftHandle).toBeInTheDocument();
    // Check that the element has the correct inline styles
    expect(leftHandle.style.background).toBe("var(--sdk-success-color)");
    expect(leftHandle.style.width).toBe("10px");
    expect(leftHandle.style.height).toBe("10px");
    expect(leftHandle.style.zIndex).toBe("1");

    // Assert that the right `Handle` is rendered with correct position and styles
    const rightHandle = screen.getByLabelText("source handle");
    expect(rightHandle).toBeInTheDocument();
    expect(rightHandle.style.background).toBe("var(--sdk-success-color)");
    expect(rightHandle.style.width).toBe("10px");
    expect(rightHandle.style.height).toBe("10px");
  });

  it("renders AevatarCardInner with the correct props", () => {
    render(
      <WorkflowProvider>
        <ReactFlowProvider>
          <AevatarItem4Workflow {...mockProps} />
        </ReactFlowProvider>
      </WorkflowProvider>
    );

    // Assert AevatarCardInner is rendered
    const card = screen.getByTestId("aevatar-card-inner");
    expect(card).toBeInTheDocument();

    // Mocked content checks
    expect(card).toHaveTextContent("Agent Info: Agent 123");
    expect(card).toHaveTextContent("New Aevatar");
  });
});
