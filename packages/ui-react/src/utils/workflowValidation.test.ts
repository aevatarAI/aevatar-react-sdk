import { describe, it, expect } from "vitest";
import { validateWorkflowData } from "./workflowValidation";
import type { IWorkflowViewDataParams } from "@aevatar-react-sdk/services";

describe("validateWorkflowData", () => {
  const validWorkflowData: IWorkflowViewDataParams = {
    name: "Test Workflow",
    properties: {
      workflowNodeList: [
        {
          nodeId: "node-1",
          name: "Node 1",
          agentType: "test-agent",
          jsonProperties: "{}",
          extendedData: {
            xPosition: "100",
            yPosition: "200",
          },
        },
      ],
      workflowNodeUnitList: [
        {
          nodeId: "node-1",
          nextNodeId: "node-2",
        },
      ],
    },
  };

  it("should validate a valid workflow data structure", () => {
    const result = validateWorkflowData(validWorkflowData);
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("should reject non-object data", () => {
    const result = validateWorkflowData(null);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("must be a JSON object");
  });

  it("should reject workflow with missing name", () => {
    const data = { ...validWorkflowData, name: "" };
    const result = validateWorkflowData(data);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("Invalid workflow name");
  });

  it("should reject workflow with missing properties", () => {
    const data = { ...validWorkflowData, properties: undefined as any };
    const result = validateWorkflowData(data);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("Invalid properties");
  });

  it("should reject workflow with non-array workflowNodeList", () => {
    const data = {
      ...validWorkflowData,
      properties: { ...validWorkflowData.properties, workflowNodeList: "invalid" },
    };
    const result = validateWorkflowData(data);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("Invalid workflowNodeList");
  });

  it("should reject workflow with non-array workflowNodeUnitList", () => {
    const data = {
      ...validWorkflowData,
      properties: { ...validWorkflowData.properties, workflowNodeUnitList: "invalid" },
    };
    const result = validateWorkflowData(data);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("Invalid workflowNodeUnitList");
  });

  it("should reject workflow node with missing nodeId", () => {
    const data = {
      ...validWorkflowData,
      properties: {
        ...validWorkflowData.properties,
        workflowNodeList: [{ ...validWorkflowData.properties.workflowNodeList[0], nodeId: "" }],
      },
    };
    const result = validateWorkflowData(data);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("Invalid nodeId in workflow node");
  });

  it("should reject workflow node with missing name", () => {
    const data = {
      ...validWorkflowData,
      properties: {
        ...validWorkflowData.properties,
        workflowNodeList: [{ ...validWorkflowData.properties.workflowNodeList[0], name: "" }],
      },
    };
    const result = validateWorkflowData(data);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("Invalid name in workflow node");
  });

  it("should reject workflow node with missing agentType", () => {
    const data = {
      ...validWorkflowData,
      properties: {
        ...validWorkflowData.properties,
        workflowNodeList: [{ ...validWorkflowData.properties.workflowNodeList[0], agentType: "" }],
      },
    };
    const result = validateWorkflowData(data);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("Invalid agentType in workflow node");
  });

  it("should reject workflow node with non-string jsonProperties", () => {
    const data = {
      ...validWorkflowData,
      properties: {
        ...validWorkflowData.properties,
        workflowNodeList: [{ ...validWorkflowData.properties.workflowNodeList[0], jsonProperties: {} as any }],
      },
    };
    const result = validateWorkflowData(data);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("Invalid jsonProperties in workflow node");
  });

  it("should reject workflow node with invalid extendedData", () => {
    const data = {
      ...validWorkflowData,
      properties: {
        ...validWorkflowData.properties,
        workflowNodeList: [{ ...validWorkflowData.properties.workflowNodeList[0], extendedData: null }],
      },
    };
    const result = validateWorkflowData(data);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("Invalid extendedData in workflow node");
  });

  it("should reject workflow node unit with missing nodeId", () => {
    const data = {
      ...validWorkflowData,
      properties: {
        ...validWorkflowData.properties,
        workflowNodeUnitList: [{ nodeId: "" }],
      },
    };
    const result = validateWorkflowData(data);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("Invalid nodeId in workflow node unit");
  });

  it("should accept workflow node unit with optional nextNodeId", () => {
    const data = {
      ...validWorkflowData,
      properties: {
        ...validWorkflowData.properties,
        workflowNodeUnitList: [{ nodeId: "node-1" }],
      },
    };
    const result = validateWorkflowData(data);
    expect(result.isValid).toBe(true);
  });

  it("should reject workflow node unit with non-string nextNodeId", () => {
    const data = {
      ...validWorkflowData,
      properties: {
        ...validWorkflowData.properties,
        workflowNodeUnitList: [{ nodeId: "node-1", nextNodeId: 123 as any }],
      },
    };
    const result = validateWorkflowData(data);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("Invalid nextNodeId in workflow node unit");
  });
});
