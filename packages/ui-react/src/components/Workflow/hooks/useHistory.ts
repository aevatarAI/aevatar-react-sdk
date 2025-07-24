import { useCallback, useRef, useState, useEffect } from "react";
import type { INode } from "../types";
import type { Edge } from "@xyflow/react";
import {
  functionRegistry,
  deepClone,
  serializeNodes,
  deserializeNodes,
  isStateEqual,
} from "../utils/index";

interface HistoryState {
  nodes: INode[];
  edges: Edge[];
  timestamp: number;
}

interface UseHistoryReturn {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => { nodes: INode[]; edges: Edge[] } | null;
  redo: () => { nodes: INode[]; edges: Edge[] } | null;
  pushState: (nodes: INode[], edges: Edge[]) => void;
  pushStateImmediate: (nodes: INode[], edges: Edge[]) => void; // Synchronous version for testing
  clearHistory: () => void;
  getCurrentState: () => { nodes: INode[]; edges: Edge[] } | null;
  initializeState: (nodes: INode[], edges: Edge[]) => void;
  updateFunction: (fnId: string, fn: (...args: any[]) => any) => void; // Update function reference
}

const MAX_HISTORY_SIZE = 50;
const DEBOUNCE_DELAY = 500; // 500ms debounce delay

export const useHistory = (): UseHistoryReturn => {
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const historyStack = useRef<HistoryState[]>([]);
  const redoStack = useRef<HistoryState[]>([]);
  const currentState = useRef<HistoryState | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const updateButtonStates = useCallback(() => {
    setCanUndo(historyStack.current.length > 0);
    setCanRedo(redoStack.current.length > 0);
  }, []);

  // Actual state recording function
  const recordState = useCallback(
    (nodes: INode[], edges: Edge[]) => {
      // Serialize nodes to replace functions with IDs
      const serializedNodes = serializeNodes(nodes);
      
      const newState: HistoryState = {
        nodes: deepClone(serializedNodes), // Deep clone with serialized functions
        edges: deepClone(edges), // Deep clone preserving functions
        timestamp: Date.now(),
      };

      // Check if the new state is identical to the current state
      if (
        currentState.current &&
        isStateEqual(
          {
            nodes: currentState.current.nodes,
            edges: currentState.current.edges,
          },
          { nodes: newState.nodes, edges: newState.edges }
        )
      ) {
        console.log("State unchanged, skipping history record");
        return; // States are identical, don't record to history
      }

      // If we have a current state, push it to history
      if (currentState.current) {
        historyStack.current.push(currentState.current);

        // Limit history size
        if (historyStack.current.length > MAX_HISTORY_SIZE) {
          historyStack.current.shift();
        }
      }

      // Clear redo stack when new state is pushed
      redoStack.current = [];

      // Update current state
      currentState.current = newState;

      updateButtonStates();
    },
    [updateButtonStates]
  );

  // Debounced version of pushState
  const pushState = useCallback(
    (nodes: INode[], edges: Edge[]) => {
      // Clear previous timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      // Set new timer with the latest state
      debounceTimer.current = setTimeout(() => {
        recordState(nodes, edges);
        debounceTimer.current = null;
      }, DEBOUNCE_DELAY);
    },
    [recordState]
  );

  const initializeState = useCallback(
    (nodes: INode[], edges: Edge[]) => {
      // Serialize nodes to replace functions with IDs
      const serializedNodes = serializeNodes(nodes);
      
      const initialState: HistoryState = {
        nodes: deepClone(serializedNodes), // Deep clone with serialized functions
        edges: deepClone(edges), // Deep clone preserving functions
        timestamp: Date.now(),
      };

      currentState.current = initialState;
      updateButtonStates();
    },
    [updateButtonStates]
  );

  const undo = useCallback(() => {
    if (historyStack.current.length === 0 || !currentState.current) {
      return null;
    }

    // Push current state to redo stack
    redoStack.current.push(currentState.current);

    // Pop previous state from history stack
    const previousState = historyStack.current.pop();
    currentState.current = previousState;

    updateButtonStates();

    // Deserialize nodes to restore function references
    const deserializedNodes = deserializeNodes(previousState.nodes);

    return {
      nodes: deserializedNodes,
      edges: previousState.edges,
    };
  }, [updateButtonStates]);

  const redo = useCallback(() => {
    if (redoStack.current.length === 0 || !currentState.current) {
      return null;
    }

    // Push current state to history stack
    historyStack.current.push(currentState.current);

    // Pop next state from redo stack
    const nextState = redoStack.current.pop();
    currentState.current = nextState;

    updateButtonStates();

    // Deserialize nodes to restore function references
    const deserializedNodes = deserializeNodes(nextState.nodes);

    return {
      nodes: deserializedNodes,
      edges: nextState.edges,
    };
  }, [updateButtonStates]);

  const clearHistory = useCallback(() => {
    historyStack.current = [];
    redoStack.current = [];
    currentState.current = null;
    updateButtonStates();
  }, [updateButtonStates]);

  const getCurrentState = useCallback(() => {
    if (!currentState.current) {
      return null;
    }
    
    // Deserialize nodes to restore function references
    const deserializedNodes = deserializeNodes(currentState.current.nodes);
    
    return {
      nodes: deserializedNodes,
      edges: currentState.current.edges,
    };
  }, []);

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const updateFunction = useCallback((fnId: string, fn: (...args: any[]) => any) => {
    functionRegistry.update(fnId, fn);
  }, []);

  return {
    canUndo,
    canRedo,
    undo,
    redo,
    pushState,
    pushStateImmediate: recordState, // Synchronous version for testing
    clearHistory,
    getCurrentState,
    initializeState,
    updateFunction,
  };
};
