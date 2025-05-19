import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, vi, expect } from "vitest";
import AevatarCardInner from "./AevatarCardInner";
import React from "react";
import type { IAgentInfoDetail } from "@aevatar-react-sdk/services";

// Mock SVG imports and utilities
vi.mock("../../assets/svg/delete.svg?react", () => ({
  __esModule: true,
  default: (props: any) => <svg {...props} data-testid="delete-icon" />,
}));

vi.mock("../DeleteWorkflowGAevatar", () => ({
  __esModule: true,
  default: ({ handleDeleteClick }: any) => (
    // biome-ignore lint/a11y/useButtonType: <explanation>
    <button data-testid="delete-workflow-icon" onClick={handleDeleteClick}>
      DeleteWorkflow
    </button>
  ),
}));

vi.mock("../../utils/jsonSchemaParse", () => ({
  jsonSchemaParse: vi.fn(() => [
    ["Property 1", { value: "Value 1" }],
    ["Property 2", { value: "Value 2" }],
    ["Property 3", { value: "" }],
    ["Property 4", { value: "", enum: true }],
  ]),
}));

// Test suite
describe("AevatarCardInner", () => {
  const mockDeleteNode = vi.fn();
  const mockOnClick = vi.fn();

  const mockAgentInfo: IAgentInfoDetail = {
    id: "123",
    properties: {
      "Property 1": "Value 1",
      "Property 2": "Value 2",
    },
    agentGuid: "",
    agentType: "",
    name: "Test Agent",
    businessAgentGrainId: "",
  };

  it("renders the card with agent info", () => {
    render(
      <AevatarCardInner
        agentInfo={mockAgentInfo}
        deleteNode={mockDeleteNode}
        nodeId="node1"
      />
    );
    // Ensure agent name and type render correctly
    expect(screen.getByText("Test Agent")).toBeInTheDocument();

    // Check that properties render correctly
    expect(screen.getByText("Property 1")).toBeInTheDocument();
    expect(screen.getByText("Value 1")).toBeInTheDocument();
    expect(screen.getByText("Property 2")).toBeInTheDocument();
    expect(screen.getByText("Value 2")).toBeInTheDocument();
    expect(screen.getByText("Property 4")).toBeInTheDocument();
  });

  it("renders the DeleteWorkflowGAevatar button for new cards", () => {
    render(
      <AevatarCardInner
        isNew
        agentInfo={mockAgentInfo}
        deleteNode={mockDeleteNode}
        nodeId="node1"
      />
    );

    // Ensure the DeleteWorkflowGAevatar button renders
    expect(screen.getByTestId("delete-workflow-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("delete-icon")).not.toBeInTheDocument();
  });

  it("renders the Delete icon for existing cards", () => {
    render(
      <AevatarCardInner
        isNew={false}
        agentInfo={mockAgentInfo}
        deleteNode={mockDeleteNode}
        nodeId="node1"
      />
    );

    // Ensure the delete icon renders
    expect(screen.getByTestId("delete-icon")).toBeInTheDocument();
    expect(
      screen.queryByTestId("delete-workflow-icon")
    ).not.toBeInTheDocument();
  });

  it("calls deleteNode with nodeId when delete button is clicked", () => {
    render(
      <AevatarCardInner
        agentInfo={mockAgentInfo}
        deleteNode={mockDeleteNode}
        nodeId="node1"
      />
    );

    // Click the delete button
    fireEvent.click(screen.getByTestId("delete-icon"));

    // Ensure deleteNode is called
    expect(mockDeleteNode).toHaveBeenCalledWith("node1");
  });

  it("calls onClick when the card is clicked", () => {
    render(
      <AevatarCardInner
        agentInfo={mockAgentInfo}
        deleteNode={mockDeleteNode}
        onClick={mockOnClick}
        isNew={false}
        nodeId="node1"
      />
    );

    // Click on the card
    const card = screen.getByTestId("aevatar-card");
    fireEvent.click(card);

    // Ensure onClick is called with the correct arguments
    expect(mockOnClick).toHaveBeenCalledWith(mockAgentInfo, false, "node1");
  });

  it("renders Property for properties when isNew and no value exists", () => {
    render(<AevatarCardInner isNew deleteNode={mockDeleteNode} />);
    // Verify Property is rendered
    expect(
      screen.getByText("Property 3", { exact: false })
    ).toBeInTheDocument();
  });
});
