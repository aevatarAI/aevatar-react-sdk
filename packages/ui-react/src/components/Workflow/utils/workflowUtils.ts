import type { INode } from "../types";
import type { Edge } from "@xyflow/react";
import { functionRegistry } from "./FunctionRegistry";

/**
 * Serialize node data, replacing functions with IDs
 * @param nodeData - Node data to serialize
 * @returns Serialized node data with function IDs
 */
export const serializeNodeData = (nodeData: any): any => {
  const serialized = { ...nodeData };
  
  // Replace function properties with IDs
  if (typeof serialized.onClick === 'function') {
    const fnId = functionRegistry.register(serialized.onClick);
    serialized.onClick = fnId;
  }
  
  if (typeof serialized.deleteNode === 'function') {
    const fnId = functionRegistry.register(serialized.deleteNode);
    serialized.deleteNode = fnId;
  }
  
  return serialized;
};

/**
 * Deserialize node data, replacing IDs with current functions
 * @param nodeData - Node data to deserialize
 * @returns Deserialized node data with function references
 */
export const deserializeNodeData = (nodeData: any): any => {
  const deserialized = { ...nodeData };
  
  // Replace function IDs with current function references
  if (typeof deserialized.onClick === 'string' && deserialized.onClick.startsWith('fn_')) {
    const fn = functionRegistry.get(deserialized.onClick);
    if (fn) {
      deserialized.onClick = fn;
    }
  }
  
  if (typeof deserialized.deleteNode === 'string' && deserialized.deleteNode.startsWith('fn_')) {
    const fn = functionRegistry.get(deserialized.deleteNode);
    if (fn) {
      deserialized.deleteNode = fn;
    }
  }
  
  return deserialized;
};

/**
 * Deep comparison of two states to check if they are identical
 * @param state1 - First state to compare
 * @param state2 - Second state to compare
 * @returns True if states are identical, false otherwise
 */
export const isStateEqual = (
  state1: { nodes: INode[]; edges: Edge[] },
  state2: { nodes: INode[]; edges: Edge[] }
): boolean => {
  try {
    // Normalize state for comparison, excluding function properties
    const normalizeState = (state: { nodes: INode[]; edges: Edge[] }) => {
      return {
        nodes: state.nodes.map((node) => ({
          id: node.id,
          type: node.type,
          position: node.position,
          data: {
            label: node.data.label,
            agentInfo: node.data.agentInfo,
            isNew: node.data.isNew,
            // Exclude function properties like onClick, deleteNode
          },
          // Ignore other properties that may change like measured, etc.
        })),
        edges: state.edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.type,
          // Ignore style and other properties that may change
        })),
      };
    };

    const normalized1 = normalizeState(state1);
    const normalized2 = normalizeState(state2);

    return JSON.stringify(normalized1) === JSON.stringify(normalized2);
  } catch (error) {
    // If comparison fails, consider states as different
    console.warn("State comparison failed:", error);
    return false;
  }
};

/**
 * Serialize nodes array, replacing functions with IDs
 * @param nodes - Array of nodes to serialize
 * @returns Array of serialized nodes
 */
export const serializeNodes = (nodes: INode[]): INode[] => {
  return nodes.map(node => ({
    ...node,
    data: serializeNodeData(node.data)
  }));
};

/**
 * Deserialize nodes array, replacing IDs with current functions
 * @param nodes - Array of nodes to deserialize
 * @returns Array of deserialized nodes
 */
export const deserializeNodes = (nodes: INode[]): INode[] => {
  return nodes.map(node => ({
    ...node,
    data: deserializeNodeData(node.data)
  }));
}; 