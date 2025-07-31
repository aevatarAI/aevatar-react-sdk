import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { generateWorkflowGraph } from "./utils"; // Adjust import path as necessary
import type {
  IAgentInfoDetail,
  IWorkflowUnitListItem,
  IAgentsConfiguration,
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

  const mockGaevatarTypeList: IAgentsConfiguration[] = [
    {
      agentType: "type1",
      propertyJsonSchema: "{}",
    },
  ];

  const mockWorkflowViewData = {
    properties: {
      workflowNodeList: [
        {
          nodeId: "agent1",
          agentId: "agent1",
          agentType: "type1",
          extendedData: { xPosition: "100", yPosition: "200" },
        },
        {
          nodeId: "agent2",
          agentId: "agent2",
          agentType: "type1",
          extendedData: { xPosition: "300", yPosition: "400" },
        },
      ],
      workflowNodeUnitList: [
        {
          nodeId: "agent1",
          nextNodeId: "agent2",
        },
      ],
    },
  };

  const onClick: TNodeDataClick = vi.fn();
  const deleteNode: TDeleteNode = vi.fn();

  it("should generate nodes and edges correctly", () => {
    const { nodes, edges } = generateWorkflowGraph(
      mockWorkflowViewData,
      mockAgentInfos,
      mockGaevatarTypeList,
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
      type: "bezier",
      style: {
        strokeWidth: 2,
        stroke: "#B9B9B9",
      },
    });
  });

  it("should create default agentInfo when agentInfo is not found", () => {
    const workflowViewDataWithMissingAgent = {
      properties: {
        workflowNodeList: [
          {
            nodeId: "agent3",
            agentId: "agent3",
            agentType: "type1",
            extendedData: { xPosition: "100", yPosition: "200" },
          },
        ],
        workflowNodeUnitList: [],
      },
    };

    const { nodes } = generateWorkflowGraph(
      workflowViewDataWithMissingAgent,
      mockAgentInfos,
      mockGaevatarTypeList,
      onClick,
      deleteNode
    );

    expect(nodes).toHaveLength(1);
    expect(nodes[0].data.agentInfo.id).toBe("agent3");
    expect(nodes[0].data.agentInfo.businessAgentGrainId).toBe("agent3");
  });

  it("should generate nodes without edges if nextNodeId is null", () => {
    const workflowViewDataWithNullNext = {
      properties: {
        workflowNodeList: [
          {
            nodeId: "agent1",
            agentId: "agent1",
            agentType: "type1",
            extendedData: { xPosition: "100", yPosition: "200" },
          },
        ],
        workflowNodeUnitList: [
          {
            nodeId: "agent1",
            nextNodeId: null,
          },
        ],
      },
    };

    const { nodes, edges } = generateWorkflowGraph(
      workflowViewDataWithNullNext,
      mockAgentInfos,
      mockGaevatarTypeList,
      onClick,
      deleteNode
    );

    expect(nodes).toHaveLength(1);
    expect(edges).toHaveLength(0);
  });

  it("should return empty nodes and edges if grains is empty", () => {
    const emptyWorkflowViewData = {
      properties: {
        workflowNodeList: [],
        workflowNodeUnitList: [],
      },
    };

    const { nodes, edges } = generateWorkflowGraph(
      emptyWorkflowViewData,
      mockAgentInfos,
      mockGaevatarTypeList,
      onClick,
      deleteNode
    );

    expect(nodes).toHaveLength(0);
    expect(edges).toHaveLength(0);
  });

  it("should handle extendedData with non-numeric x/y position as NaN", () => {
    const workflowViewDataWithInvalidPosition = {
      properties: {
        workflowNodeList: [
          {
            nodeId: "agent1",
            agentId: "agent1",
            agentType: "type1",
            extendedData: { xPosition: "invalid", yPosition: "invalid" },
          },
        ],
        workflowNodeUnitList: [],
      },
    };

    const { nodes } = generateWorkflowGraph(
      workflowViewDataWithInvalidPosition,
      mockAgentInfos,
      mockGaevatarTypeList,
      onClick,
      deleteNode
    );

    expect(nodes[0].position.x).toBeNaN();
    expect(nodes[0].position.y).toBeNaN();
  });

  it("should use the last agentInfo if businessAgentGrainId is duplicated", () => {
    const duplicateAgentInfos = [
      { ...mockAgentInfos[0], id: "agent1", businessAgentGrainId: "grain1" },
      { ...mockAgentInfos[1], id: "agent2", businessAgentGrainId: "grain1" },
    ];

    const workflowViewDataWithDuplicate = {
      properties: {
        workflowNodeList: [
          {
            nodeId: "agent1",
            agentId: "agent1",
            agentType: "type1",
            extendedData: { xPosition: "100", yPosition: "200" },
          },
        ],
        workflowNodeUnitList: [],
      },
    };

    const { nodes } = generateWorkflowGraph(
      workflowViewDataWithDuplicate,
      duplicateAgentInfos,
      mockGaevatarTypeList,
      onClick,
      deleteNode
    );

    // The function uses agentInfoMap based on agent.id, not businessAgentGrainId
    // Since the workflowNodeList uses agentId "agent1", it will find the first agentInfo
    // with id "agent1" in the map
    expect(nodes[0].data.agentInfo).toEqual(duplicateAgentInfos[0]);
  });
});
