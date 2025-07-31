# Workflow Utils

This directory contains utility functions and classes for the Workflow component.

## Files

### FunctionRegistry.ts
Manages function references to prevent function loss during undo/redo operations.

**Exports:**
- `FunctionRegistry` class: Singleton class for managing function references
- `functionRegistry` instance: Global singleton instance

**Methods:**
- `register(fn)`: Register a function and return its ID
- `get(id)`: Get a function by its ID
- `update(id, fn)`: Update a function reference by its ID
- `clear()`: Clear all registered functions
- `size()`: Get the number of registered functions
- `has(id)`: Check if a function ID exists

### deepClone.ts
Generic deep cloning utility that preserves functions and handles circular references.

**Exports:**
- `deepClone<T>(obj, hash?)`: Deep clone function with type safety

**Features:**
- Preserves function references
- Handles circular references using WeakMap
- Supports Date and RegExp objects
- Copies both enumerable and non-enumerable properties

### workflowUtils.ts
Workflow-specific utilities for serialization and state comparison.

**Exports:**
- `serializeNodeData(nodeData)`: Serialize node data, replacing functions with IDs
- `deserializeNodeData(nodeData)`: Deserialize node data, replacing IDs with current functions
- `isStateEqual(state1, state2)`: Deep comparison of workflow states
- `serializeNodes(nodes)`: Serialize an array of nodes
- `deserializeNodes(nodes)`: Deserialize an array of nodes

### index.ts
Main export file that re-exports all utility functions and classes.

## Usage

```typescript
import {
  FunctionRegistry,
  functionRegistry,
  deepClone,
  serializeNodes,
  deserializeNodes,
  isStateEqual,
} from '../utils';

// Use the utilities
const clonedObject = deepClone(originalObject);
const serializedNodes = serializeNodes(nodes);
const areEqual = isStateEqual(state1, state2);
```

## Architecture

The utils are designed with the following principles:

1. **Separation of Concerns**: Each file has a specific responsibility
2. **Type Safety**: Full TypeScript support with proper type definitions
3. **Reusability**: Functions can be used independently
4. **Performance**: Optimized for common use cases
5. **Maintainability**: Clear documentation and consistent patterns 