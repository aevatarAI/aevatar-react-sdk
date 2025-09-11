import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import WorkflowAevatarEdit from "./";
import type { IAgentInfoDetail } from "@aevatar-react-sdk/services";
import React from "react";

// Mock utilities
vi.mock("../../utils/jsonSchemaParse", () => ({
  jsonSchemaParse: vi.fn(() => [
    ["property1", { type: "string", minLength: 3 }],
    ["property2", { type: "number", minimum: 10, maximum: 20 }],
  ]),
}));

vi.mock("../../hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock props
const mockAgentItem: Partial<IAgentInfoDetail> = {
  id: "1",
  name: "Test Agent",
  agentType: "Test Type",
  propertyJsonSchema: JSON.stringify({}),
  properties: {},
};

const mockOnGaevatarChange = vi.fn(() =>
  Promise.resolve({
    id: "1",
    name: "Updated Agent",
    agentType: "Test Type",
    properties: { property1: "test", property2: 15 },
    agentGuid: "",
    businessAgentGrainId: "",
  })
);

describe("WorkflowAevatarEdit Component", () => {
  it("renders the form fields correctly", () => {
    render(
      <WorkflowAevatarEdit
        agentItem={mockAgentItem}
        isNew={true}
        nodeId="123"
        onGaevatarChange={mockOnGaevatarChange}
      />
    );

    // Agent name input - use getAllByText since there might be multiple instances
    const agentNameLabels = screen.getAllByText("agent name");
    expect(agentNameLabels.length).toBeGreaterThan(0);

    // Agent type select - use getAllByLabelText since there might be multiple instances
    const agentTypeLabels = screen.getAllByLabelText("agent Type");
    expect(agentTypeLabels.length).toBeGreaterThan(0);

    // Dynamic fields
    expect(screen.getByText("property1")).toBeInTheDocument();
    expect(screen.getByText("property2")).toBeInTheDocument();
  });

  // it("displays validation errors for missing required fields", async () => {
  //   render(
  //     <WorkflowAevatarEdit
  //       agentItem={mockAgentItem}
  //       isNew={true}
  //       nodeId="123"
  //       onGaevatarChange={mockOnGaevatarChange}
  //     />
  //   );

  //   // Click the save button without entering any values
  //   fireEvent.click(screen.getByText("save"));

  //   // Wait for validation errors to appear
  //   await waitFor(() => {
  //     expect(screen.getAllByText("required").length).toBeGreaterThan(0);
  //   });
  // });

  // it("validates dynamic numeric fields correctly", async () => {
  //   render(
  //     <WorkflowAevatarEdit
  //       agentItem={mockAgentItem}
  //       isNew={true}
  //       nodeId="123"
  //       onGaevatarChange={mockOnGaevatarChange}
  //     />
  //   );

  //   const property2Input = screen.getByLabelText("property2");

  //   // Enter a number out of range
  //   fireEvent.change(property2Input, { target: { value: "25" } });

  //   // Click the save button
  //   fireEvent.click(screen.getByText("save"));

  //   // Check for validation error for the number field
  //   await waitFor(() => {
  //     expect(screen.getByText("maximum: 20")).toBeInTheDocument();
  //   });
  // });

  // it("calls onGaevatarChange with correct data on valid submission", async () => {
  //   render(
  //     <WorkflowAevatarEdit
  //       agentItem={mockAgentItem}
  //       isNew={true}
  //       nodeId="123"
  //       onGaevatarChange={mockOnGaevatarChange}
  //     />
  //   );

  //   // Fill out form fields
  //   fireEvent.change(screen.getByLabelText("g-agent name"), {
  //     target: { value: "New Agent" },
  //   });

  //   fireEvent.change(screen.getByLabelText("property1"), {
  //     target: { value: "valid" },
  //   });

  //   fireEvent.change(screen.getByLabelText("property2"), {
  //     target: { value: "15" },
  //   });

  //   // Click the save button
  //   fireEvent.click(screen.getByText("save"));

  //   // Wait for submission to complete
  //   await waitFor(() =>
  //     expect(mockOnGaevatarChange).toHaveBeenCalledWith(
  //       true,
  //       {
  //         params: {
  //           agentType: "Test Type",
  //           name: "New Agent",
  //           properties: {
  //             property1: "valid",
  //             property2: 15,
  //           },
  //         },
  //         agentId: "1",
  //       },
  //       "123"
  //     )
  //   );
  // });

  // it("shows loading state when save button is clicked", async () => {
  //   render(
  //     <WorkflowAevatarEdit
  //       agentItem={mockAgentItem}
  //       isNew={true}
  //       nodeId="123"
  //       onGaevatarChange={mockOnGaevatarChange}
  //     />
  //   );

  //   // Fill out form fields
  //   fireEvent.change(screen.getByLabelText("g-agent name"), {
  //     target: { value: "Agent Name" },
  //   });

  //   fireEvent.change(screen.getByLabelText("property1"), {
  //     target: { value: "value" },
  //   });

  //   fireEvent.change(screen.getByLabelText("property2"), {
  //     target: { value: "15" },
  //   });

  //   // Click save button
  //   fireEvent.click(screen.getByText("save"));

  //   // Check that loading spinner appears
  //   expect(screen.getByTestId("loading")).toBeInTheDocument();

  //   // Wait for button to clear loading state
  //   await waitFor(() => {
  //     expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
  //   });
  // });
});
