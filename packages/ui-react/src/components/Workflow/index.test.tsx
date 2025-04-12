import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import { Workflow } from "./index";
import React from "react";
import { useReactFlow } from "@xyflow/react";

// Mock necessary libraries and components
vi.mock("@xyflow/react", () => ({
  ReactFlow: vi.fn(({ children }) => (
    <div data-testid="reactflow">{children}</div>
  )),
  addEdge: vi.fn((params, edges) => [...edges, params]),
  useNodesState: vi.fn(() => [[], vi.fn(), vi.fn()]),
  useEdgesState: vi.fn(() => [[], vi.fn(), vi.fn()]),
  useReactFlow: vi.fn(() => ({
    screenToFlowPosition: vi.fn(({ x, y }) => ({ x, y })),
  })),
  Controls: vi.fn(() => <div data-testid="controls" />),
}));

vi.mock("./DnDContext", () => ({
  useDnD: vi.fn(() => [{ nodeType: "new", agentInfo: { id: "node1" } }]),
}));

// Mock utils and background
vi.mock("./utils", () => ({
  generateWorkflowGraph: vi.fn(() => ({
    nodes: [],
    edges: [],
  })),
}));
vi.mock("./background", () => ({
  __esModule: true,
  default: () => <div data-testid="background" />,
}));

describe("Workflow Component", () => {
  // biome-ignore lint/style/useSingleVarDeclarator: <explanation>
  // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
  let onCardClickMock, onNodesChangedMock;

  beforeEach(() => {
    onCardClickMock = vi.fn();
    onNodesChangedMock = vi.fn();
  });

  it("should render the Workflow component and ReactFlow wrapper", () => {
    render(
      <Workflow
        gaevatarList={[]}
        editWorkflow={undefined}
        onCardClick={onCardClickMock}
        onNodesChanged={onNodesChangedMock}
      />
    );
    const reactFlowWrapper = screen.getByTestId("reactflow");
    expect(reactFlowWrapper).toBeInTheDocument();

    const controls = screen.getByTestId("controls");
    expect(controls).toBeInTheDocument();
  });
});
