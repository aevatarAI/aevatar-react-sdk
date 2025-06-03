import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, vi, expect } from "vitest";
import Sidebar from "./sidebar";
import { useDnD } from "../Workflow/DnDContext";
import React from "react";
import type { IAgentInfoDetail } from "@aevatar-react-sdk/services";
import "@testing-library/jest-dom";

// Mock useDnD
const setDragItemMock = vi.fn();
vi.mock("../Workflow/DnDContext", () => ({
  __esModule: true,
  useDnD: vi.fn(() => [null, setDragItemMock]),
}));

// Mock AevatarItemMini
vi.mock("./aevatarItemMini", () => ({
  __esModule: true,
  default: (props: any) => {
    const { name, agentType, disabled, isnew, disabledGeavatarIds } = props;
    return (
      <div
        data-testid={isnew ? "new-aevatar-item-mini" : "aevatar-item-mini"}
        data-disabled={disabled}
        data-name={name}
        data-agent-type={agentType}
        onDragStart={props.onDragStart}
        draggable={props.draggable}>
        {name || (isnew ? "New Aevatar" : "Aevatar Item")}
      </div>
    );
  },
}));

vi.mock("../../..", () => ({
  useAevatar: () => [{ hiddenGAevatarType: [] }],
}));

describe("Sidebar Component", () => {
  const mockGaeavatarList: IAgentInfoDetail[] = [
    {
      id: "1",
      name: "Agent1",
      agentType: "Type A",
      propertyJsonSchema: JSON.stringify({}),
      properties: {},
      businessAgentGrainId: "",
      agentGuid: "",
    },
    {
      id: "2",
      name: "Agent 2",
      agentType: "Type A",
      propertyJsonSchema: JSON.stringify({}),
      properties: {},
      businessAgentGrainId: "",
      agentGuid: "",
    },
    {
      id: "3",
      name: "Agent 3",
      agentType: "Type B",
      propertyJsonSchema: JSON.stringify({}),
      properties: {},
      businessAgentGrainId: "",
      agentGuid: "",
    },
  ];

  it("renders the agent types and items correctly", () => {
    render(
      <Sidebar
        gaevatarList={mockGaeavatarList}
        gaevatarTypeList={[
          {
            agentType: "Type A",
            propertyJsonSchema: JSON.stringify({}),
            fullName: "",
          },
          {
            agentType: "Type B",
            propertyJsonSchema: "{}",
            fullName: "",
          },
        ]}
      />
    );
    // Verify categories (agent types) are rendered
    expect(screen.getAllByText("Type A")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Type B")[0]).toBeInTheDocument();

    // Verify agent items render correctly
    expect(screen.queryAllByTestId("aevatar-item-mini")).toHaveLength(3);
  });

  it("renders new aevatar items", () => {
    render(
      <Sidebar
        gaevatarList={mockGaeavatarList}
        gaevatarTypeList={[
          {
            agentType: "Type A",
            propertyJsonSchema: "{}",
            fullName: "",
          },
          {
            agentType: "Type B",
            propertyJsonSchema: "{} ",
            fullName: "",
          },
        ]}
      />
    );

    // Verify new aevatar items are rendered
    expect(screen.getAllByTestId("new-aevatar-item-mini")).toHaveLength(2);
  });

  it("disables new aevatar items when isNewGAevatar is false", () => {
    render(
      <Sidebar
        gaevatarList={mockGaeavatarList}
        gaevatarTypeList={[
          {
            agentType: "Type A",
            propertyJsonSchema: "{}",
            fullName: "",
          },
        ]}
        isNewGAevatar={false}
      />
    );

    // Ensure new aevatar items are disabled
    const newItems = screen.getAllByTestId("new-aevatar-item-mini");
    newItems.forEach((item) => {
      expect(item).toHaveAttribute("data-disabled", "true");
    });
  });

  it("disables specific aevatar items listed in disabledGeavatarIds", () => {
    render(
      <Sidebar
        gaevatarList={mockGaeavatarList}
        disabledGeavatarIds={["1", "3"]}
      />
    );
    // Ensure disabled items have the 'data-disabled' attribute
    const items = screen.queryAllByTestId("aevatar-item-mini");
    expect(items[0]).toHaveAttribute("data-disabled", "true"); // Agent 1
    expect(items[1]).toHaveAttribute("data-disabled", "false"); // Agent 2
    expect(items[2]).toHaveAttribute("data-disabled", "true"); // Agent 3
  });
});
