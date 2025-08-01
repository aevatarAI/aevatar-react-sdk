import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useWorkflowState } from './useWorkflowState';
import { aevatarAI } from '../utils';

// Mock aevatarAI services
vi.mock('../utils', () => ({
  aevatarAI: {
    services: {
      workflow: {
        getWorkflow: vi.fn(),
      },
    },
  },
}));

describe('useWorkflowState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns getWorkflowState function', () => {
    const { result } = renderHook(() => useWorkflowState());
    
    expect(result.current).toHaveProperty('getWorkflowState');
    expect(typeof result.current.getWorkflowState).toBe('function');
  });

  it('calls getWorkflow with correct parameters', async () => {
    const mockWorkflowData = {
      items: [
        {
          _id: 'workflow-123',
          name: 'Test Workflow',
          status: 'active',
        },
      ],
    };
    
    const mockGetWorkflow = vi.mocked(aevatarAI.services.workflow.getWorkflow);
    mockGetWorkflow.mockResolvedValue(mockWorkflowData);
    
    const { result } = renderHook(() => useWorkflowState());
    
    await result.current.getWorkflowState('workflow-123');
    
    expect(mockGetWorkflow).toHaveBeenCalledWith({
      stateName: 'WorkflowCoordinatorState',
      queryString: '_id:workflow-123',
    });
  });

  it('returns first item from workflow list', async () => {
    const mockWorkflowData = {
      items: [
        {
          _id: 'workflow-123',
          name: 'Test Workflow',
          status: 'active',
        },
        {
          _id: 'workflow-456',
          name: 'Another Workflow',
          status: 'inactive',
        },
      ],
    };
    
    const mockGetWorkflow = vi.mocked(aevatarAI.services.workflow.getWorkflow);
    mockGetWorkflow.mockResolvedValue(mockWorkflowData);
    
    const { result } = renderHook(() => useWorkflowState());
    
    const workflow = await result.current.getWorkflowState('workflow-123');
    
    expect(workflow).toEqual(mockWorkflowData.items[0]);
  });

  it('throws error when workflow not found', async () => {
    const mockWorkflowData = {
      items: [],
    };
    
    const mockGetWorkflow = vi.mocked(aevatarAI.services.workflow.getWorkflow);
    mockGetWorkflow.mockResolvedValue(mockWorkflowData);
    
    const { result } = renderHook(() => useWorkflowState());
    
    await expect(result.current.getWorkflowState('nonexistent-workflow')).rejects.toBe('workflow not found');
  });

  it('throws error when workflow list is empty', async () => {
    const mockWorkflowData = {
      items: [],
    };
    
    const mockGetWorkflow = vi.mocked(aevatarAI.services.workflow.getWorkflow);
    mockGetWorkflow.mockResolvedValue(mockWorkflowData);
    
    const { result } = renderHook(() => useWorkflowState());
    
    await expect(result.current.getWorkflowState('empty-workflow')).rejects.toBe('workflow not found');
  });

  it('handles different workflow agent IDs', async () => {
    const mockWorkflowData = {
      items: [
        {
          _id: 'different-workflow-id',
          name: 'Different Workflow',
          status: 'active',
        },
      ],
    };
    
    const mockGetWorkflow = vi.mocked(aevatarAI.services.workflow.getWorkflow);
    mockGetWorkflow.mockResolvedValue(mockWorkflowData);
    
    const { result } = renderHook(() => useWorkflowState());
    
    const workflow = await result.current.getWorkflowState('different-workflow-id');
    
    expect(workflow).toEqual(mockWorkflowData.items[0]);
    expect(mockGetWorkflow).toHaveBeenCalledWith({
      stateName: 'WorkflowCoordinatorState',
      queryString: '_id:different-workflow-id',
    });
  });

  it('handles complex workflow data structure', async () => {
    const mockWorkflowData = {
      items: [
        {
          _id: 'complex-workflow',
          name: 'Complex Workflow',
          status: 'active',
          config: {
            agents: ['agent1', 'agent2'],
            settings: {
              timeout: 5000,
              retries: 3,
            },
          },
          metadata: {
            createdAt: '2024-01-01',
            updatedAt: '2024-01-02',
            version: '1.0.0',
          },
        },
      ],
    };
    
    const mockGetWorkflow = vi.mocked(aevatarAI.services.workflow.getWorkflow);
    mockGetWorkflow.mockResolvedValue(mockWorkflowData);
    
    const { result } = renderHook(() => useWorkflowState());
    
    const workflow = await result.current.getWorkflowState('complex-workflow');
    
    expect(workflow).toEqual(mockWorkflowData.items[0]);
    expect(workflow.config.agents).toEqual(['agent1', 'agent2']);
    expect(workflow.metadata.version).toBe('1.0.0');
  });

  it('handles service errors gracefully', async () => {
    const mockGetWorkflow = vi.mocked(aevatarAI.services.workflow.getWorkflow);
    mockGetWorkflow.mockRejectedValue(new Error('Service unavailable'));
    
    const { result } = renderHook(() => useWorkflowState());
    
    await expect(result.current.getWorkflowState('error-workflow')).rejects.toThrow();
  });

  it('handles network errors', async () => {
    const mockGetWorkflow = vi.mocked(aevatarAI.services.workflow.getWorkflow);
    mockGetWorkflow.mockRejectedValue(new Error('Network error'));
    
    const { result } = renderHook(() => useWorkflowState());
    
    await expect(result.current.getWorkflowState('network-error-workflow')).rejects.toThrow();
  });

  it('maintains function reference across renders', () => {
    const { result, rerender } = renderHook(() => useWorkflowState());
    
    const firstGetWorkflowState = result.current.getWorkflowState;
    
    rerender();
    
    const secondGetWorkflowState = result.current.getWorkflowState;
    
    // Function reference should be stable due to useCallback
    expect(firstGetWorkflowState).toBe(secondGetWorkflowState);
  });

  it('handles undefined workflow agent ID', async () => {
    const mockWorkflowData = {
      items: [],
    };
    
    const mockGetWorkflow = vi.mocked(aevatarAI.services.workflow.getWorkflow);
    mockGetWorkflow.mockResolvedValue(mockWorkflowData);
    
    const { result } = renderHook(() => useWorkflowState());
    
    await expect(result.current.getWorkflowState(undefined as any)).rejects.toBe('workflow not found');
    
    expect(mockGetWorkflow).toHaveBeenCalledWith({
      stateName: 'WorkflowCoordinatorState',
      queryString: '_id:undefined',
    });
  });

  it('handles empty string workflow agent ID', async () => {
    const mockWorkflowData = {
      items: [],
    };
    
    const mockGetWorkflow = vi.mocked(aevatarAI.services.workflow.getWorkflow);
    mockGetWorkflow.mockResolvedValue(mockWorkflowData);
    
    const { result } = renderHook(() => useWorkflowState());
    
    await expect(result.current.getWorkflowState('')).rejects.toBe('workflow not found');
    
    expect(mockGetWorkflow).toHaveBeenCalledWith({
      stateName: 'WorkflowCoordinatorState',
      queryString: '_id:',
    });
  });
}); 