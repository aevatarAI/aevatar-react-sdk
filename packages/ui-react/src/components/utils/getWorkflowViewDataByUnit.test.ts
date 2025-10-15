import { describe, it, expect, vi } from "vitest";
import { getWorkflowViewDataByUnit } from "./getWorkflowViewDataByUnit";
import type {
  IAgentInfoDetail,
  IWorkflowUnitListItem,
} from "@aevatar-react-sdk/services";
import type { INode } from "../Workflow/types";

// Mock the jsonSchemaParse utility
vi.mock("../../utils/jsonSchemaParse", () => ({
  getPropertiesByDefaultValues: vi.fn(() => ({ defaultProp: "defaultValue" })),
}));

describe("getWorkflowViewDataByUnit", () => {
  const mockGaevatarList: IAgentInfoDetail[] = [
    {
      id: "agent1",
      name: "Agent 1",
      agentType: "type1",
      properties: { prop1: "value1", prop2: "value2" },
      businessAgentGrainId: "grain1",
      agentGuid: "guid1",
      propertyJsonSchema: "{}",
    },
    {
      id: "agent2",
      name: "Agent 2",
      agentType: "type2",
      properties: { prop3: "value3" },
      businessAgentGrainId: "grain2",
      agentGuid: "guid2",
      propertyJsonSchema: "{}",
    },
  ];

  const mockWorkUnitRelations: IWorkflowUnitListItem[] = [
    {
      grainId: "agent1",
      nextGrainId: "agent2",
      extendedData: { xPosition: "100", yPosition: "200" },
    },
    {
      grainId: "agent2",
      nextGrainId: "",
      extendedData: { xPosition: "300", yPosition: "400" },
    },
  ];

  const mockNodeList: INode[] = [
    {
      id: "agent1",
      type: "ScanCard",
      position: { x: 100, y: 200 },
      data: {
        label: "ScanCard Node",
        agentInfo: {
          id: "agent1",
          name: "Agent 1",
          agentType: "type1",
          properties: { prop1: "value1", prop2: "value2" },
          businessAgentGrainId: "grain1",
          agentGuid: "guid1",
          propertyJsonSchema: "{}",
        },
        isNew: false,
        onClick: vi.fn(),
        deleteNode: vi.fn(),
      },
      measured: { width: 234, height: 301 },
    },
  ];

  it("should process workflow data correctly with valid inputs", () => {
    const result = getWorkflowViewDataByUnit(
      mockGaevatarList,
      mockWorkUnitRelations,
      mockNodeList
    );

    expect(result.workflowNodeList).toHaveLength(2);
    expect(result.workflowNodeUnitList).toHaveLength(1);

    // Check first workflow node
    const firstNode = result.workflowNodeList[0];
    expect(firstNode.nodeId).toBe("agent1");
    expect(firstNode.name).toBe("Agent 1");
    expect(firstNode.agentType).toBe("type1");
    expect(firstNode.jsonProperties).toBe(JSON.stringify({ prop1: "value1", prop2: "value2" }));
    expect(firstNode.extendedData).toEqual({
      xPosition: "100",
      yPosition: "200",
    });

    // Check second workflow node - should use gaevatarList data since agentInfo.id === nodeId
    const secondNode = result.workflowNodeList[1];
    expect(secondNode.nodeId).toBe("agent2");
    expect(secondNode.name).toBeUndefined();
    expect(secondNode.agentType).toBeUndefined();
    expect(secondNode.jsonProperties).toBe(JSON.stringify({ defaultProp: "defaultValue" }));
    expect(secondNode.extendedData).toEqual({
      xPosition: "300",
      yPosition: "400",
    });

    // Check workflow node unit list
    const unit = result.workflowNodeUnitList[0];
    expect(unit.nodeId).toBe("agent1");
    expect(unit.nextNodeId).toBe("agent2");
  });

  it("should handle empty gaevatarList", () => {
    const result = getWorkflowViewDataByUnit(
      [],
      mockWorkUnitRelations,
      mockNodeList
    );

    expect(result.workflowNodeList).toHaveLength(2);
    expect(result.workflowNodeUnitList).toHaveLength(1);

    // Should use agentInfo from nodeList when gaevatarList is empty
    const firstNode = result.workflowNodeList[0];
    expect(firstNode.nodeId).toBe("agent1");
    expect(firstNode.name).toBe("Agent 1");
  });

  it("should handle empty workUnitRelations", () => {
    const result = getWorkflowViewDataByUnit(
      mockGaevatarList,
      [],
      mockNodeList
    );

    expect(result.workflowNodeList).toHaveLength(0);
    expect(result.workflowNodeUnitList).toHaveLength(0);
  });

  it("should handle empty nodeList", () => {
    const result = getWorkflowViewDataByUnit(
      mockGaevatarList,
      mockWorkUnitRelations,
      []
    );

    expect(result.workflowNodeList).toHaveLength(2);
    expect(result.workflowNodeUnitList).toHaveLength(1);

    // Should use agentInfo from gaevatarList when nodeList is empty
    const firstNode = result.workflowNodeList[0];
    expect(firstNode.nodeId).toBe("agent1");
    expect(firstNode.name).toBeUndefined();
  });

  it("should handle missing agentInfo in nodeList", () => {
    const workUnitRelationsWithMissingAgent: IWorkflowUnitListItem[] = [
      {
        grainId: "missingAgent",
        nextGrainId: "agent2",
        extendedData: { xPosition: "500", yPosition: "600" },
      },
    ];

    const result = getWorkflowViewDataByUnit(
      mockGaevatarList,
      workUnitRelationsWithMissingAgent,
      mockNodeList
    );

    expect(result.workflowNodeList).toHaveLength(1);
    expect(result.workflowNodeUnitList).toHaveLength(1);

    const node = result.workflowNodeList[0];
    expect(node.nodeId).toBe("missingAgent");
    expect(node.name).toBeUndefined();
    expect(node.agentType).toBeUndefined();
    // Should use default values from getPropertiesByDefaultValues
    expect(node.jsonProperties).toBe(JSON.stringify({ defaultProp: "defaultValue" }));
  });

  it("should handle workUnitRelations without nextGrainId", () => {
    const workUnitRelationsWithoutNext: IWorkflowUnitListItem[] = [
      {
        grainId: "agent1",
        nextGrainId: "",
        extendedData: { xPosition: "100", yPosition: "200" },
      },
    ];

    const result = getWorkflowViewDataByUnit(
      mockGaevatarList,
      workUnitRelationsWithoutNext,
      mockNodeList
    );

    expect(result.workflowNodeList).toHaveLength(1);
    expect(result.workflowNodeUnitList).toHaveLength(0); // No nextGrainId, so no unit
  });

  it("should handle agentInfo with empty properties", () => {
    const gaevatarListWithEmptyProps: IAgentInfoDetail[] = [
      {
        id: "agent1",
        name: "Agent 1",
        agentType: "type1",
        properties: {},
        businessAgentGrainId: "grain1",
        agentGuid: "guid1",
        propertyJsonSchema: "{}",
      },
    ];

    const workUnitRelations: IWorkflowUnitListItem[] = [
      {
        grainId: "agent1",
        nextGrainId: "agent2",
        extendedData: { xPosition: "100", yPosition: "200" },
      },
    ];

    const result = getWorkflowViewDataByUnit(
      gaevatarListWithEmptyProps,
      workUnitRelations,
      mockNodeList
    );

    expect(result.workflowNodeList).toHaveLength(1);
    const node = result.workflowNodeList[0];
    // Should use properties from nodeList when gaevatarList properties are empty
    expect(node.jsonProperties).toBe(JSON.stringify({ prop1: "value1", prop2: "value2" }));
  });

  it("should handle agentInfo with different agentId", () => {
    const gaevatarListWithDifferentId: IAgentInfoDetail[] = [
      {
        id: "differentAgentId",
        name: "Agent 1",
        agentType: "type1",
        properties: { prop1: "value1" },
        businessAgentGrainId: "grain1",
        agentGuid: "guid1",
        propertyJsonSchema: "{}",
      },
    ];

    const workUnitRelations: IWorkflowUnitListItem[] = [
      {
        grainId: "agent1",
        nextGrainId: "agent2",
        extendedData: { xPosition: "100", yPosition: "200" },
      },
    ];

    const result = getWorkflowViewDataByUnit(
      gaevatarListWithDifferentId,
      workUnitRelations,
      mockNodeList
    );

    expect(result.workflowNodeList).toHaveLength(1);
    const node = result.workflowNodeList[0];
    expect(node.nodeId).toBe("agent1");
    // Since agentInfo.id === nodeId (both are "agent1"), agentId should not be set
    expect(node.agentId).toBeUndefined();
    expect(node.name).toBe("Agent 1");
  });

  it("should handle multiple workUnitRelations with complex relationships", () => {
    const complexWorkUnitRelations: IWorkflowUnitListItem[] = [
      {
        grainId: "agent1",
        nextGrainId: "agent2",
        extendedData: { xPosition: "100", yPosition: "200" },
      },
      {
        grainId: "agent2",
        nextGrainId: "agent3",
        extendedData: { xPosition: "300", yPosition: "400" },
      },
      {
        grainId: "agent3",
        nextGrainId: "",
        extendedData: { xPosition: "500", yPosition: "600" },
      },
    ];

    const extendedGaevatarList: IAgentInfoDetail[] = [
      ...mockGaevatarList,
      {
        id: "agent3",
        name: "Agent 3",
        agentType: "type3",
        properties: { prop4: "value4" },
        businessAgentGrainId: "grain3",
        agentGuid: "guid3",
        propertyJsonSchema: "{}",
      },
    ];

    const result = getWorkflowViewDataByUnit(
      extendedGaevatarList,
      complexWorkUnitRelations,
      mockNodeList
    );

    expect(result.workflowNodeList).toHaveLength(3);
    expect(result.workflowNodeUnitList).toHaveLength(2);

    // Check all nodes are created
    expect(result.workflowNodeList.map(n => n.nodeId)).toEqual([
      "agent1",
      "agent2",
      "agent3",
    ]);

    // Check workflow units
    expect(result.workflowNodeUnitList[0].nodeId).toBe("agent1");
    expect(result.workflowNodeUnitList[0].nextNodeId).toBe("agent2");
    expect(result.workflowNodeUnitList[1].nodeId).toBe("agent2");
    expect(result.workflowNodeUnitList[1].nextNodeId).toBe("agent3");
  });

  it("should handle extendedData with string positions", () => {
    const workUnitRelationsWithStringPositions: IWorkflowUnitListItem[] = [
      {
        grainId: "agent1",
        nextGrainId: "agent2",
        extendedData: { xPosition: "150", yPosition: "250" },
      },
    ];

    const result = getWorkflowViewDataByUnit(
      mockGaevatarList,
      workUnitRelationsWithStringPositions,
      mockNodeList
    );

    expect(result.workflowNodeList).toHaveLength(1);
    const node = result.workflowNodeList[0];
    expect(node.extendedData).toEqual({
      xPosition: "150",
      yPosition: "250",
    });
  });

  it("should handle agentInfo with different id than nodeId", () => {
    const gaevatarListWithDifferentId: IAgentInfoDetail[] = [
      {
        id: "differentAgentId",
        name: "Agent 1",
        agentType: "type1",
        properties: { prop1: "value1" },
        businessAgentGrainId: "grain1",
        agentGuid: "guid1",
        propertyJsonSchema: "{}",
      },
    ];

    const workUnitRelations: IWorkflowUnitListItem[] = [
      {
        grainId: "agent1",
        nextGrainId: "agent2",
        extendedData: { xPosition: "100", yPosition: "200" },
      },
    ];

    const result = getWorkflowViewDataByUnit(
      gaevatarListWithDifferentId,
      workUnitRelations,
      []
    );

    expect(result.workflowNodeList).toHaveLength(1);
    const node = result.workflowNodeList[0];
    expect(node.nodeId).toBe("agent1");
    // Since agentInfo.id !== nodeId, agentId should be set
    expect(node.agentId).toBeUndefined();
    expect(node.name).toBeUndefined();
  });

  it("should handle properties with publisherGrainId and correlationId", () => {
    const gaevatarListWithSpecialProps: IAgentInfoDetail[] = [
      {
        id: "agent1",
        name: "Agent 1",
        agentType: "type1",
        properties: {
          prop1: "value1",
          publisherGrainId: "pub123",
          correlationId: "corr456",
        },
        businessAgentGrainId: "grain1",
        agentGuid: "guid1",
        propertyJsonSchema: "{}",
      },
    ];

    const workUnitRelations: IWorkflowUnitListItem[] = [
      {
        grainId: "agent1",
        nextGrainId: "",
        extendedData: { xPosition: "100", yPosition: "200" },
      },
    ];

    const result = getWorkflowViewDataByUnit(
      gaevatarListWithSpecialProps,
      workUnitRelations,
      mockNodeList
    );

    expect(result.workflowNodeList).toHaveLength(1);
    const node = result.workflowNodeList[0];
    // The properties should NOT include publisherGrainId and correlationId since they are deleted
    expect(node.jsonProperties).toBe(JSON.stringify({
      prop1: "value1",
      prop2: "value2",
    }));
    const parsedProperties = JSON.parse(node.jsonProperties);
    expect(parsedProperties.publisherGrainId).toBeUndefined();
    expect(parsedProperties.correlationId).toBeUndefined();
  });
}); 