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
      grainId: "grain1",
      nextGrainId: "grain2",
      extendedData: { xPosition: "100", yPosition: "200" },
    },
    {
      grainId: "grain2",
      nextGrainId: "",
      extendedData: { xPosition: "300", yPosition: "400" },
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
        grainId: "grain3", // No corresponding agentInfo
        nextGrainId: "",
        extendedData: { xPosition: "100", yPosition: "200" },
      },
    ];

    expect(() =>
      generateWorkflowGraph(invalidGrains, mockAgentInfos, onClick, deleteNode)
    ).toThrowError("No agentInfo found for grainId grain3");
  });

  it("should throw an error if a nextGrainId does not have a corresponding agent", () => {
    const invalidGrains: IWorkflowUnitListItem[] = [
      {
        grainId: "grain1",
        nextGrainId: "grain3", // No corresponding agentInfo
        extendedData: { xPosition: "100", yPosition: "200" },
      },
    ];

    expect(() =>
      generateWorkflowGraph(invalidGrains, mockAgentInfos, onClick, deleteNode)
    ).toThrowError("No agentInfo found for nextGrainId grain3");
  });

  it("should generate nodes without edges if nextGrainId is null", () => {
    const singleGrain: IWorkflowUnitListItem[] = [
      {
        grainId: "grain1",
        nextGrainId: "", // No edge case
        extendedData: { xPosition: "100", yPosition: "200" },
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

  it("should return empty nodes and edges if grains is empty", () => {
    const { nodes, edges } = generateWorkflowGraph(
      [],
      mockAgentInfos,
      onClick,
      deleteNode
    );
    expect(nodes).toHaveLength(0);
    expect(edges).toHaveLength(0);
  });

  it("should throw error if agentInfos is empty", () => {
    expect(() =>
      generateWorkflowGraph(mockGrains, [], onClick, deleteNode)
    ).toThrowError();
  });

  it("should handle extendedData with non-numeric x/y position as NaN", () => {
    const grains: IWorkflowUnitListItem[] = [
      {
        grainId: "grain1",
        nextGrainId: "",
        extendedData: { xPosition: "abc", yPosition: "def" },
      },
    ];
    const { nodes } = generateWorkflowGraph(
      grains,
      mockAgentInfos,
      onClick,
      deleteNode
    );
    expect(nodes[0].position.x).toBeNaN();
    expect(nodes[0].position.y).toBeNaN();
  });

  it("should use the last agentInfo if businessAgentGrainId is duplicated", () => {
    const duplicateAgentInfos = [
      ...mockAgentInfos,
      { ...mockAgentInfos[0], id: "agent1-dup", name: "Agent 1 Dup" },
    ];
    const { nodes } = generateWorkflowGraph(
      mockGrains,
      duplicateAgentInfos,
      onClick,
      deleteNode
    );
    // The last one should overwrite the previous in agentInfoMap
    expect(nodes[0].id).toBe("agent1-dup");
    expect(nodes[0].data.agentInfo.name).toBe("Agent 1 Dup");
  });
});
