# Workflow Component

## Overview

The Workflow component provides a visual workflow editor with drag-and-drop functionality, node management, and undo/redo capabilities.

## Features

### Undo/Redo Functionality

The Workflow component now includes a complete undo/redo system that tracks changes to:

- Node positions (when dragging nodes)
- Node additions (when dropping new nodes)
- Node deletions
- Edge connections
- Edge deletions
- Node data updates

#### How it works

1. **History Management**: The component uses a custom `useHistory` hook to maintain a stack of workflow states
2. **Debounced State Tracking**: State changes are debounced (500ms) to prevent excessive recording during rapid operations like dragging
3. **Deep State Comparison**: Before recording, the system compares the new state with the current state to avoid recording identical states
4. **State Tracking**: Every time nodes or edges change, the current state is automatically recorded after the debounce delay (if different from current state)
5. **Undo/Redo Operations**: Users can undo/redo changes using the toolbar buttons
6. **Button States**: Undo/redo buttons are automatically enabled/disabled based on available history

#### Usage

The undo/redo functionality is automatically integrated into the Workflow component. Users can:

- Click the undo button (↶) to revert to the previous state
- Click the redo button (↷) to restore a previously undone state
- Buttons are disabled when no undo/redo operations are available

#### Technical Details

- **Maximum History**: Limited to 50 states to prevent memory issues
- **Debounce Delay**: 500ms delay to prevent excessive state recording during rapid changes
- **Deep State Comparison**: Prevents recording identical states to optimize performance and user experience
- **Deep Cloning**: States are deep-cloned to prevent reference issues
- **Function Registry**: Manages function references to prevent function loss during undo/redo operations
- **Auto-clear**: Redo stack is cleared when new changes are made
- **Initialization**: History is properly initialized when loading existing workflows
- **Memory Management**: Automatic cleanup of debounce timers to prevent memory leaks

#### API

The `useHistory` hook provides:

```typescript
interface UseHistoryReturn {
  canUndo: boolean;           // Whether undo is available
  canRedo: boolean;           // Whether redo is available
  undo: () => State | null;   // Perform undo operation
  redo: () => State | null;   // Perform redo operation
  pushState: (nodes: INode[], edges: Edge[]) => void;  // Record new state (debounced)
  pushStateImmediate: (nodes: INode[], edges: Edge[]) => void;  // Record new state immediately (for testing)
  clearHistory: () => void;   // Clear all history
  getCurrentState: () => State | null;  // Get current state
  initializeState: (nodes: INode[], edges: Edge[]) => void;  // Initialize history
  updateFunction: (fnId: string, fn: Function) => void;  // Update function reference in registry
}
```

## Components

### Main Components

- `Workflow`: Main workflow editor component
- `useHistory`: Custom hook for history management
- `AevatarItem4Workflow`: Individual node component
- `CustomEdge`: Custom edge component for connections

### Supporting Components

- `DnDContext`: Drag and drop context provider
- `Background`: Empty state background
- Various UI components for tooltips, buttons, etc.

### Utility Functions

- `FunctionRegistry`: Manages function references to prevent function loss during undo/redo
- `deepClone`: Generic deep cloning utility that preserves functions and handles circular references
- `workflowUtils`: Workflow-specific utilities for serialization and state comparison
  - `serializeNodeData`: Serializes node data, replacing functions with IDs
  - `deserializeNodeData`: Deserializes node data, replacing IDs with current functions
  - `isStateEqual`: Deep comparison of workflow states
  - `serializeNodes`: Serializes an array of nodes
  - `deserializeNodes`: Deserializes an array of nodes

## Props

### Workflow Component Props

```typescript
interface IProps {
  gaevatarList?: IAgentInfoDetail[];
  editWorkflow?: {
    workflowAgentId: string;
    workflowName: string;
    workflowViewData: IWorkflowViewDataParams;
  };
  editAgentOpen?: boolean;
  isRunning?: boolean;
  isStopping?: boolean;
  onCardClick: (data: Partial<IAgentInfoDetail>, isNew: boolean, nodeId: string) => void;
  onNodesChanged?: (nodes: INode[]) => void;
  onRemoveNode?: (nodeId: string) => void;
  onRunWorkflow?: () => Promise<void>;
  onStopWorkflow?: () => Promise<void>;
  extraControlBar?: React.ReactNode;
}
```

## Testing

The undo/redo functionality is thoroughly tested with comprehensive test cases covering:

- Initial state
- State pushing
- Undo operations
- Redo operations
- History clearing
- State initialization
- History size limits

Run tests with:
```bash
npm test -- src/components/Workflow/hooks/useHistory.test.ts --run
``` 