import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useGetWorkflowList } from './useGetWorkflowList';
import { aevatarAI } from '../utils';

// Mock the aevatarAI module
vi.mock('../utils', () => ({
  aevatarAI: {
    services: {
      agent: {
        getAgents: vi.fn(),
      },
    },
  },
}));

describe('useGetWorkflowList', () => {
  let mockGetAgents: any;
  
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAgents = vi.mocked(aevatarAI.services.agent.getAgents);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useGetWorkflowList({}));

    expect(result.current.data).toEqual([]);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe('');
  });

  it('should call getAgents with default parameters', async () => {
    const mockResponse = [{ id: '1', name: 'Workflow 1' }];
    mockGetAgents.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useGetWorkflowList({}));

    await waitFor(() => {
      expect(mockGetAgents).toHaveBeenCalledWith({
        name: undefined,
        status: undefined,
        pageIndex: 0,
        pageSize: 100,
        agentType: 'Aevatar.GAgents.GroupChat.WorkflowCoordinator.WorkflowCoordinatorGAgent',
      });
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('');
  });

  it('should call getAgents with custom parameters', async () => {
    const mockResponse = [{ id: '1', name: 'Custom Workflow' }];
    mockGetAgents.mockResolvedValue(mockResponse);

    const customParams = {
      name: 'Custom',
      status: 'active',
      pageIndex: 1,
      pageSize: 50,
      agentType: 'CustomAgentType',
    };

    const { result } = renderHook(() => useGetWorkflowList(customParams));

    await waitFor(() => {
      expect(mockGetAgents).toHaveBeenCalledWith(customParams);
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('');
  });

  it('should handle API error', async () => {
    mockGetAgents.mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useGetWorkflowList({}));

    await waitFor(() => {
      expect(result.current.error).toBe('There was an error fetching...');
    });

    expect(result.current.data).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle empty response', async () => {
    mockGetAgents.mockResolvedValue(null);

    const { result } = renderHook(() => useGetWorkflowList({}));

    await waitFor(() => {
      expect(result.current.data).toEqual([]);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('');
  });

  it('should handle empty array response', async () => {
    mockGetAgents.mockResolvedValue([]);

    const { result } = renderHook(() => useGetWorkflowList({}));

    await waitFor(() => {
      expect(result.current.data).toEqual([]);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('');
  });

  it('should update data when parameters change', async () => {
    const mockResponse1 = [{ id: '1', name: 'Workflow 1' }];
    const mockResponse2 = [{ id: '2', name: 'Workflow 2' }];
    
    mockGetAgents
      .mockResolvedValueOnce(mockResponse1)
      .mockResolvedValueOnce(mockResponse2);

    const { result, rerender } = renderHook(
      ({ params }) => useGetWorkflowList(params),
      {
        initialProps: { params: { name: 'First' } },
      }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(mockResponse1);
    });

    // Change parameters
    rerender({ params: { name: 'Second' } });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockResponse2);
    });

    expect(mockGetAgents).toHaveBeenCalledTimes(2);
  });

  it('should handle loading state correctly', async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    
    mockGetAgents.mockReturnValue(promise);

    const { result } = renderHook(() => useGetWorkflowList({}));

    // Initially should be loading
    expect(result.current.isLoading).toBe(true);

    // Resolve the promise after a small delay
    setTimeout(() => {
      resolvePromise([{ id: '1', name: 'Workflow' }]);
    }, 0);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should handle multiple rapid parameter changes', async () => {
    const mockResponses = [
      [{ id: '1', name: 'Workflow 1' }],
      [{ id: '2', name: 'Workflow 2' }],
      [{ id: '3', name: 'Workflow 3' }],
    ];
    
    mockGetAgents
      .mockResolvedValueOnce(mockResponses[0])
      .mockResolvedValueOnce(mockResponses[1])
      .mockResolvedValueOnce(mockResponses[2]);

    const { result, rerender } = renderHook(
      ({ params }) => useGetWorkflowList(params),
      {
        initialProps: { params: { name: 'First' } },
      }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(mockResponses[0]);
    });

    rerender({ params: { name: 'Second' } });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockResponses[1]);
    });

    rerender({ params: { name: 'Third' } });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockResponses[2]);
    });

    expect(mockGetAgents).toHaveBeenCalledTimes(3);
  });

  it('should handle partial parameters', async () => {
    const mockResponse = [{ id: '1', name: 'Partial Workflow' }];
    mockGetAgents.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useGetWorkflowList({ name: 'Partial' }));

    await waitFor(() => {
      expect(mockGetAgents).toHaveBeenCalledWith({
        name: 'Partial',
        status: undefined,
        pageIndex: 0,
        pageSize: 100,
        agentType: 'Aevatar.GAgents.GroupChat.WorkflowCoordinator.WorkflowCoordinatorGAgent',
      });
    });

    expect(result.current.data).toEqual(mockResponse);
  });

  it('should handle status parameter', async () => {
    const mockResponse = [{ id: '1', name: 'Active Workflow', status: 'active' }];
    mockGetAgents.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useGetWorkflowList({ status: 'active' }));

    await waitFor(() => {
      expect(mockGetAgents).toHaveBeenCalledWith({
        name: undefined,
        status: 'active',
        pageIndex: 0,
        pageSize: 100,
        agentType: 'Aevatar.GAgents.GroupChat.WorkflowCoordinator.WorkflowCoordinatorGAgent',
      });
    });

    expect(result.current.data).toEqual(mockResponse);
  });

  it('should handle pagination parameters', async () => {
    const mockResponse = [{ id: '1', name: 'Paginated Workflow' }];
    mockGetAgents.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => 
      useGetWorkflowList({ pageIndex: 2, pageSize: 25 })
    );

    await waitFor(() => {
      expect(mockGetAgents).toHaveBeenCalledWith({
        name: undefined,
        status: undefined,
        pageIndex: 2,
        pageSize: 25,
        agentType: 'Aevatar.GAgents.GroupChat.WorkflowCoordinator.WorkflowCoordinatorGAgent',
      });
    });

    expect(result.current.data).toEqual(mockResponse);
  });

  it('should handle custom agent type', async () => {
    const mockResponse = [{ id: '1', name: 'Custom Agent Workflow' }];
    mockGetAgents.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => 
      useGetWorkflowList({ agentType: 'Custom.Agent.Type' })
    );

    await waitFor(() => {
      expect(mockGetAgents).toHaveBeenCalledWith({
        name: undefined,
        status: undefined,
        pageIndex: 0,
        pageSize: 100,
        agentType: 'Custom.Agent.Type',
      });
    });

    expect(result.current.data).toEqual(mockResponse);
  });

  it('should handle all parameters together', async () => {
    const mockResponse = [{ id: '1', name: 'Complete Workflow' }];
    mockGetAgents.mockResolvedValue(mockResponse);

    const completeParams = {
      name: 'Complete',
      status: 'active',
      pageIndex: 1,
      pageSize: 50,
      agentType: 'Complete.Agent.Type',
    };

    const { result } = renderHook(() => useGetWorkflowList(completeParams));

    await waitFor(() => {
      expect(mockGetAgents).toHaveBeenCalledWith(completeParams);
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('');
  });
}); 