import { describe, it, expect, vi, beforeEach } from "vitest";
import React, { createRef } from "react";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import WorkflowList, { IWorkflowListRef } from "./index";
import type {
  IAgentInfoDetail,
  IWorkflowCoordinatorState,
} from "@aevatar-react-sdk/services";

// Mock aevatarAI services
vi.mock("../../utils", () => ({
  aevatarAI: {
    services: {
      agent: {
        getAgents: vi.fn(),
        deleteAgent: vi.fn(),
        removeAllSubAgent: vi.fn(),
      },
      workflow: {
        getWorkflow: vi.fn(),
      },
    },
  },
}));

// Mock useToast hook
vi.mock("../../hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock error handling
vi.mock("../../utils/error", () => ({
  handleErrorMessage: vi.fn(
    (error) => error?.message || "Something went wrong."
  ),
}));

// Mock sleep utility
vi.mock("@aevatar-react-sdk/utils", () => ({
  sleep: vi.fn(),
}));

// Mock constants
vi.mock("../../constants", () => ({
  IS_NULL_ID: "null-id",
}));

// Mock AgentError
vi.mock("../../constants/error/agentError", () => ({
  AgentError: {
    AgentHasSubagents: "Agent has subagents",
  },
}));

// Mock Loading SVG
vi.mock("../../assets/svg/loading.svg?react", () => ({
  default: () => <div data-testid="loading-icon" />,
}));

// Mock DeleteGAevatarConfirm component
vi.mock("../DeleteGAevatarConfirm", () => ({
  default: ({ open, onOpenChange, handleConfirm, handleCancel }: any) => (
    <div data-testid="delete-confirm-dialog">
      {open && (
        <div>
          <button data-testid="confirm-delete" onClick={handleConfirm}>
            Confirm Delete
          </button>
          <button data-testid="cancel-delete" onClick={handleCancel}>
            Cancel
          </button>
          <button
            data-testid="close-dialog"
            onClick={() => onOpenChange(false)}>
            Close
          </button>
        </div>
      )}
    </div>
  ),
}));

// Mock WorkflowListInner component
vi.mock("../WorkflowListInner", () => ({
  default: ({
    workflowsList,
    loading,
    onNewWorkflow,
    onEditWorkflow,
    onDeleteWorkflow,
  }: any) => (
    <div data-testid="workflow-list-inner">
      {loading && <div data-testid="loading">Loading...</div>}
      {!loading && workflowsList && (
        <div data-testid="workflows-container">
          {workflowsList.map((workflow: any, index: number) => (
            <div key={workflow.id} data-testid={`workflow-${index}`}>
              <span data-testid={`workflow-name-${index}`}>
                {workflow.name}
              </span>
              <button
                data-testid={`edit-workflow-${index}`}
                onClick={() => onEditWorkflow?.(workflow.id)}>
                Edit
              </button>
              <button
                data-testid={`delete-workflow-${index}`}
                onClick={() => onDeleteWorkflow?.(workflow)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
      <button data-testid="new-workflow-btn" onClick={onNewWorkflow}>
        New Workflow
      </button>
    </div>
  ),
}));

describe("WorkflowList", () => {
  const mockAgents: IAgentInfoDetail[] = [
    {
      id: "agent-1",
      name: "Test Agent 1",
      properties: {
        workflowCoordinatorGAgentId: "workflow-1",
      },
      businessAgentGrainId: "grain-1",
      agentGuid: "guid-1",
      agentType: "type-1",
    },
    {
      id: "agent-2",
      name: "Test Agent 2",
      properties: {
        workflowCoordinatorGAgentId: "workflow-2",
      },
      businessAgentGrainId: "grain-2",
      agentGuid: "guid-2",
      agentType: "type-2",
    },
  ];

  const mockWorkflows: IWorkflowCoordinatorState[] = [
    {
      blackboardId: "workflow-1",
      workflowName: "Test Workflow 1",
      ctime: "2024-01-01T00:00:00Z",
      lastRunningTime: "2024-01-02T00:00:00Z",
      workflowStatus: "pending" as any,
    },
    {
      blackboardId: "workflow-2",
      workflowName: "Test Workflow 2",
      ctime: "2024-01-03T00:00:00Z",
      lastRunningTime: "2024-01-04T00:00:00Z",
      workflowStatus: "running" as any,
    },
  ];

  const defaultProps = {
    className: "test-class",
    onEditWorkflow: vi.fn(),
    onNewWorkflow: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders WorkflowListInner component", () => {
    render(<WorkflowList {...defaultProps} />);
    expect(screen.getByTestId("workflow-list-inner")).toBeInTheDocument();
  });

  it("shows loading state initially", () => {
    render(<WorkflowList {...defaultProps} />);
    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  it("handles empty agent list", async () => {
    const { aevatarAI } = await import("../../utils");
    const mockGetAgents = vi.mocked(aevatarAI.services.agent.getAgents);

    mockGetAgents.mockResolvedValueOnce([]);

    render(<WorkflowList {...defaultProps} />);

    await waitFor(() => {
      expect(
        screen.queryByTestId("workflows-container")
      ).not.toBeInTheDocument();
    });
  });

  it("exposes refresh method via ref", async () => {
    const { aevatarAI } = await import("../../utils");
    const mockGetAgents = vi.mocked(aevatarAI.services.agent.getAgents);
    const mockGetWorkflow = vi.mocked(aevatarAI.services.workflow.getWorkflow);

    // Mock the first call to getAgents to return data, then empty array to stop the loop
    mockGetAgents.mockResolvedValueOnce(mockAgents).mockResolvedValueOnce([]);
    mockGetWorkflow.mockResolvedValueOnce({
      items: mockWorkflows,
    });

    const ref = createRef<IWorkflowListRef>();
    render(<WorkflowList {...defaultProps} ref={ref} />);

    // Wait for workflows to be displayed
    await waitFor(
      () => {
        expect(screen.getByTestId("workflows-container")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    expect(ref.current).toBeDefined();
    expect(typeof ref.current?.refresh).toBe("function");
  }, 15000);
});
