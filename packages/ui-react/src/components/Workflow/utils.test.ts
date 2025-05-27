import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { generateWorkflowGraph } from "./utils"; // Adjust import path as necessary
import type {
  IAgentInfoDetail,
  IWorkflowUnitListItem,
} from "@aevatar-react-sdk/services";
import type { TNodeDataClick, TDeleteNode } from "./types";

describe("generateWorkflowGraph", () => {
  // Mock input data
  const mockAgentInfos: IAgentInfoDetail[] = [
    {
      id: "agent1",
      businessAgentGrainId: "grain1",
      name: "Agent 1",
      agentGuid: "",
      agentType: "",
      properties: {},
    },
    {
      id: "agent2",
      businessAgentGrainId: "grain2",
      name: "Agent 2",
      agentGuid: "",
      agentType: "",
      properties: {},
    },
  ];

  const mockGrains: IWorkflowUnitListItem[] = [
    {
      GrainId: "grain1",
      NextGrainId: "grain2",
      ExtendedData: { xPosition: "100", yPosition: "200" },
    },
    {
      GrainId: "grain2",
      NextGrainId: "",
      ExtendedData: { xPosition: "300", yPosition: "400" },
    },
  ];

  const onClick: TNodeDataClick = vi.fn();
  const deleteNode: TDeleteNode = vi.fn();

  it("should generate nodes and edges correctly", () => {
    const { nodes, edges } = generateWorkflowGraph(
      mockGrains,
      mockAgentInfos,
      onClick,
      deleteNode
    );

    // Validate nodes
    expect(nodes).toHaveLength(2);
    expect(nodes[0]).toEqual({
      id: "agent1",
      type: "ScanCard",
      position: { x: 100, y: 200 },
      data: {
        label: "ScanCard Node",
        agentInfo: mockAgentInfos[0],
        isNew: false,
        onClick,
        deleteNode,
      },
      measured: { width: 234, height: 301 },
    });
    expect(nodes[1]).toEqual({
      id: "agent2",
      type: "ScanCard",
      position: { x: 300, y: 400 },
      data: {
        label: "ScanCard Node",
        agentInfo: mockAgentInfos[1],
        isNew: false,
        onClick,
        deleteNode,
      },
      measured: { width: 234, height: 301 },
    });

    // Validate edges
    expect(edges).toHaveLength(1);
    expect(edges[0]).toMatchObject({
      source: "agent1",
      target: "agent2",
      type: "smoothstep",
      style: {
        strokeWidth: 2,
        stroke: "#B9B9B9",
      },
    });
  });

  it("should throw an error if a grainId does not have a corresponding agent", () => {
    const invalidGrains: IWorkflowUnitListItem[] = [
      {
        GrainId: "grain3", // No corresponding agentInfo
        NextGrainId: "",
        ExtendedData: { xPosition: "100", yPosition: "200" },
      },
    ];

    expect(() =>
      generateWorkflowGraph(invalidGrains, mockAgentInfos, onClick, deleteNode)
    ).toThrowError("No agentInfo found for grainId grain3");
  });

  it("should throw an error if a nextGrainId does not have a corresponding agent", () => {
    const invalidGrains: IWorkflowUnitListItem[] = [
      {
        GrainId: "grain1",
        NextGrainId: "grain3", // No corresponding agentInfo
        ExtendedData: { xPosition: "100", yPosition: "200" },
      },
    ];

    expect(() =>
      generateWorkflowGraph(invalidGrains, mockAgentInfos, onClick, deleteNode)
    ).toThrowError("No agentInfo found for nextGrainId grain3");
  });

  it("should generate nodes without edges if nextGrainId is null", () => {
    const singleGrain: IWorkflowUnitListItem[] = [
      {
        GrainId: "grain1",
        NextGrainId: "", // No edge case
        ExtendedData: { xPosition: "100", yPosition: "200" },
      },
    ];

    const { nodes, edges } = generateWorkflowGraph(
      singleGrain,
      mockAgentInfos,
      onClick,
      deleteNode
    );

    // Validate nodes
    expect(nodes).toHaveLength(1);
    expect(edges).toHaveLength(0); // No edges
  });
});
