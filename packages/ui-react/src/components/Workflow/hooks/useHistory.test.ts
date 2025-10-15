import { renderHook, act } from '@testing-library/react';
import { useHistory } from './useHistory';
import type { INode } from '../types';
import type { Edge } from '@xyflow/react';
import { vi } from 'vitest';

describe('useHistory', () => {
  const mockNode: INode = {
    id: 'test-node',
    type: 'ScanCard',
    position: { x: 100, y: 100 },
    data: {
      label: 'Test Node',
      agentInfo: {
        id: 'test-agent',
        name: 'Test Agent',
        agentType: 'test',
        properties: {},
      },
      isNew: false,
      onClick: vi.fn(),
      deleteNode: vi.fn(),
    },
  };

  const mockEdge: Edge = {
    id: 'test-edge',
    source: 'test-node',
    target: 'test-node-2',
    type: 'bezier',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with undo and redo disabled', () => {
    const { result } = renderHook(() => useHistory());

    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('should enable undo after pushing state', () => {
    const { result } = renderHook(() => useHistory());

    act(() => {
      result.current.pushStateImmediate([mockNode], [mockEdge]);
    });

    expect(result.current.canUndo).toBe(false); // First state doesn't enable undo
    expect(result.current.canRedo).toBe(false);
  });

  it('should enable undo after pushing multiple states', () => {
    const { result } = renderHook(() => useHistory());

    act(() => {
      result.current.pushStateImmediate([mockNode], [mockEdge]);
      result.current.pushStateImmediate([{ ...mockNode, id: 'test-node-2' }], [mockEdge]);
    });

    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  it('should perform undo correctly', () => {
    const { result } = renderHook(() => useHistory());

    act(() => {
      result.current.pushStateImmediate([mockNode], [mockEdge]);
      result.current.pushStateImmediate([{ ...mockNode, id: 'test-node-2' }], [mockEdge]);
    });

    expect(result.current.canUndo).toBe(true);

    act(() => {
      const previousState = result.current.undo();
      expect(previousState).toBeDefined();
      expect(previousState?.nodes).toHaveLength(1);
      expect(previousState?.nodes[0].id).toBe('test-node');
      expect(previousState?.edges).toHaveLength(1);
    });

    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);
  });

  it('should perform redo correctly', () => {
    const { result } = renderHook(() => useHistory());

    act(() => {
      result.current.pushStateImmediate([mockNode], [mockEdge]);
      result.current.pushStateImmediate([{ ...mockNode, id: 'test-node-2' }], [mockEdge]);
    });

    act(() => {
      result.current.undo();
    });

    expect(result.current.canRedo).toBe(true);

    act(() => {
      const nextState = result.current.redo();
      expect(nextState).toBeDefined();
      expect(nextState?.nodes).toHaveLength(1);
      expect(nextState?.nodes[0].id).toBe('test-node-2');
      expect(nextState?.edges).toHaveLength(1);
    });

    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  it('should clear redo stack when new state is pushed', () => {
    const { result } = renderHook(() => useHistory());

    act(() => {
      result.current.pushStateImmediate([mockNode], [mockEdge]);
      result.current.pushStateImmediate([{ ...mockNode, id: 'test-node-2' }], [mockEdge]);
    });

    act(() => {
      result.current.undo();
    });

    expect(result.current.canRedo).toBe(true);

    act(() => {
      result.current.pushStateImmediate([{ ...mockNode, id: 'test-node-3' }], [mockEdge]);
    });

    expect(result.current.canRedo).toBe(false);
  });

  it('should clear history correctly', () => {
    const { result } = renderHook(() => useHistory());

    act(() => {
      result.current.pushStateImmediate([mockNode], [mockEdge]);
      result.current.pushStateImmediate([{ ...mockNode, id: 'test-node-2' }], [mockEdge]);
    });

    expect(result.current.canUndo).toBe(true);

    act(() => {
      result.current.clearHistory();
    });

    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('should initialize state correctly', () => {
    const { result } = renderHook(() => useHistory());

    act(() => {
      result.current.initializeState([mockNode], [mockEdge]);
    });

    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);

    const currentState = result.current.getCurrentState();
    expect(currentState).toBeDefined();
    expect(currentState?.nodes).toHaveLength(1);
    expect(currentState?.nodes[0].id).toBe('test-node');
    expect(currentState?.edges).toHaveLength(1);
  });

  it('should limit history size', () => {
    const { result } = renderHook(() => useHistory());
    const maxSize = 50;

    // Push more states than the limit
    act(() => {
      for (let i = 0; i <= maxSize + 10; i++) {
        result.current.pushStateImmediate([{ ...mockNode, id: `node-${i}` }], [mockEdge]);
      }
    });

    // Should still be able to undo
    expect(result.current.canUndo).toBe(true);

    // Undo all states
    for (let i = 0; i < maxSize; i++) {
      act(() => {
        result.current.undo();
      });
    }

    expect(result.current.canUndo).toBe(false);
  });

  it('should not record identical states', () => {
    const { result } = renderHook(() => useHistory());

    // Push the same state multiple times
    act(() => {
      result.current.pushStateImmediate([mockNode], [mockEdge]);
      result.current.pushStateImmediate([mockNode], [mockEdge]); // Same state
      result.current.pushStateImmediate([mockNode], [mockEdge]); // Same state
    });

    // Should only have one state in history (the first one)
    expect(result.current.canUndo).toBe(false); // First state doesn't enable undo
    expect(result.current.canRedo).toBe(false);

    // Push a different state
    act(() => {
      result.current.pushStateImmediate([{ ...mockNode, id: 'different-node' }], [mockEdge]);
    });

    // Now should be able to undo
    expect(result.current.canUndo).toBe(true);
  });

  it("should preserve function properties during deep cloning", () => {
    const { result } = renderHook(() => useHistory());

    const mockOnClick = vi.fn();
    const mockDeleteNode = vi.fn();

    const nodesWithFunctions = [
      {
        id: "test-node",
        type: "ScanCard",
        position: { x: 100, y: 100 },
        data: {
          label: "Test Node",
          agentInfo: { id: "agent-1", name: "Test Agent" },
          isNew: false,
          onClick: mockOnClick,
          deleteNode: mockDeleteNode,
        },
      },
    ];

    const edges = [
      {
        id: "test-edge",
        source: "test-node",
        target: "test-node-2",
        type: "bezier",
      },
    ];

    // Initialize state with functions
    result.current.initializeState(nodesWithFunctions, edges);

    // Get current state and verify functions are preserved
    const currentState = result.current.getCurrentState();
    expect(currentState).toBeDefined();
    expect(currentState?.nodes).toHaveLength(1);
    expect(currentState?.nodes[0].data.onClick).toBe(mockOnClick);
    expect(currentState?.nodes[0].data.deleteNode).toBe(mockDeleteNode);

    // Test that functions are callable
    expect(typeof currentState?.nodes[0].data.onClick).toBe("function");
    expect(typeof currentState?.nodes[0].data.deleteNode).toBe("function");
  });

  it("should properly handle function references through function registry", () => {
    const { result } = renderHook(() => useHistory());

    const mockOnClick = vi.fn();
    const mockDeleteNode = vi.fn();

    const nodesWithFunctions = [
      {
        id: "test-node",
        type: "ScanCard",
        position: { x: 100, y: 100 },
        data: {
          label: "Test Node",
          agentInfo: { id: "agent-1", name: "Test Agent" },
          isNew: false,
          onClick: mockOnClick,
          deleteNode: mockDeleteNode,
        },
      },
    ];

    const edges = [
      {
        id: "test-edge",
        source: "test-node",
        target: "test-node-2",
        type: "bezier",
      },
    ];

    // Initialize state
    result.current.initializeState(nodesWithFunctions, edges);

    // Push another state
    const updatedNodes = [
      {
        ...nodesWithFunctions[0],
        position: { x: 200, y: 200 },
      },
    ];
    result.current.pushStateImmediate(updatedNodes, edges);

    // Perform undo
    const undoneState = result.current.undo();
    expect(undoneState).toBeDefined();
    expect(undoneState?.nodes).toHaveLength(1);
    expect(undoneState?.nodes[0].id).toBe("test-node");

    // Verify that functions are properly restored
    const restoredNode = undoneState?.nodes[0];
    expect(restoredNode?.data.onClick).toBeDefined();
    expect(restoredNode?.data.deleteNode).toBeDefined();
    expect(typeof restoredNode?.data.onClick).toBe("function");
    expect(typeof restoredNode?.data.deleteNode).toBe("function");

    // Test that the functions are callable
    restoredNode?.data.onClick();
    restoredNode?.data.deleteNode();
    expect(mockOnClick).toHaveBeenCalled();
    expect(mockDeleteNode).toHaveBeenCalled();
  });
}); 