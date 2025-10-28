import type { IWorkflowViewDataParams } from "@aevatar-react-sdk/services";

export interface IWorkflowValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates workflow data structure for import
 * @param data - The data to validate
 * @returns Validation result with error message if invalid
 */
export function validateWorkflowData(data: any): IWorkflowValidationResult {
  // Validate top-level structure
  if (!data || typeof data !== "object") {
    return { isValid: false, error: "Invalid file format: must be a JSON object" };
  }

  // Validate name field
  if (!data.name || typeof data.name !== "string" || data.name.trim() === "") {
    return { isValid: false, error: "Invalid workflow name: must be a non-empty string" };
  }

  // Validate properties field
  if (!data.properties || typeof data.properties !== "object") {
    return { isValid: false, error: "Invalid properties: must be an object" };
  }

  // Validate workflowNodeList
  if (!Array.isArray(data.properties.workflowNodeList)) {
    return { isValid: false, error: "Invalid workflowNodeList: must be an array" };
  }

  // Validate workflowNodeUnitList
  if (!Array.isArray(data.properties.workflowNodeUnitList)) {
    return { isValid: false, error: "Invalid workflowNodeUnitList: must be an array" };
  }

  // Validate each workflow node
  for (let i = 0; i < data.properties.workflowNodeList.length; i++) {
    const node = data.properties.workflowNodeList[i];
    if (!node || typeof node !== "object") {
      return { isValid: false, error: `Invalid workflow node at index ${i}: must be an object` };
    }

    // Validate required fields
    if (!node.nodeId || typeof node.nodeId !== "string") {
      return { isValid: false, error: `Invalid nodeId in workflow node at index ${i}: must be a string` };
    }

    if (!node.name || typeof node.name !== "string") {
      return { isValid: false, error: `Invalid name in workflow node at index ${i}: must be a string` };
    }

    if (!node.agentType || typeof node.agentType !== "string") {
      return { isValid: false, error: `Invalid agentType in workflow node at index ${i}: must be a string` };
    }

    if (typeof node.jsonProperties !== "string") {
      return { isValid: false, error: `Invalid jsonProperties in workflow node at index ${i}: must be a string` };
    }

    // Validate extendedData
    if (!node.extendedData || typeof node.extendedData !== "object") {
      return { isValid: false, error: `Invalid extendedData in workflow node at index ${i}: must be an object` };
    }

    if (typeof node.extendedData.xPosition !== "string") {
      return { isValid: false, error: `Invalid xPosition in workflow node at index ${i}: must be a string` };
    }

    if (typeof node.extendedData.yPosition !== "string") {
      return { isValid: false, error: `Invalid yPosition in workflow node at index ${i}: must be a string` };
    }
  }

  // Validate each workflow node unit
  for (let i = 0; i < data.properties.workflowNodeUnitList.length; i++) {
    const unit = data.properties.workflowNodeUnitList[i];
    if (!unit || typeof unit !== "object") {
      return { isValid: false, error: `Invalid workflow node unit at index ${i}: must be an object` };
    }

    if (!unit.nodeId || typeof unit.nodeId !== "string") {
      return { isValid: false, error: `Invalid nodeId in workflow node unit at index ${i}: must be a string` };
    }

    // nextNodeId is optional, but if present must be a string
    if (unit.nextNodeId !== undefined && typeof unit.nextNodeId !== "string") {
      return { isValid: false, error: `Invalid nextNodeId in workflow node unit at index ${i}: must be a string` };
    }
  }

  return { isValid: true };
}
