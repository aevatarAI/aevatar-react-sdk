import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import MyGAevatar from './index';
import { vi } from 'vitest';
// Global mock variables
let getAllAgentsConfigurationMock: any;
let getAgentsMock: any;
let toastMock: any;

// Mock useAevatar at the very top, do not use run-time variable
vi.mock('../context/AevatarProvider', () => ({
  useAevatar: () => [{ hiddenGAevatarType: globalThis.mockHiddenGAevatarType ?? [] }],
}));

// Mock jotai
vi.mock('jotai', () => ({
  useAtom: () => [false, vi.fn()],
  atom: (init: any) => init,
}));

// Mock handleErrorMessage
vi.mock('../../utils/error', () => ({
  handleErrorMessage: (e: any, d: string) => d,
}));

// Mock subcomponents
vi.mock('../AevatarCard', () => ({
  __esModule: true,
  default: ({ agentInfo, onEditGaevatar }: any) => (
    <div data-testid="aevatar-card" onClick={() => onEditGaevatar(agentInfo.id)}>{agentInfo.name}</div>
  ),
}));
vi.mock('../CommonHeader', () => ({
  __esModule: true,
  default: ({ leftEle, rightEle }: any) => (
    <div data-testid="common-header">{leftEle}{rightEle}</div>
  ),
}));
vi.mock('../PageLoading', () => ({
  __esModule: true,
  default: () => <div data-testid="page-loading" />,
}));
vi.mock('../ui', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));
vi.mock('../../assets/svg/add.svg?react', () => ({
  __esModule: true,
  default: () => <svg data-testid="add-icon" />,
}));
vi.mock('../../assets/svg/empty-gaevatar.svg?react', () => ({
  __esModule: true,
  default: () => <svg data-testid="empty-icon" />,
}));

// Mock useToast
vi.mock('../../hooks/use-toast', () => {
  const toastMock = vi.fn();
  return {
    useToast: () => ({ toast: toastMock }),
    __esModule: true,
    toastMock,
  };
});

// Mock aevatarAI
vi.mock('../../utils', async (importOriginal) => {
  const original = await importOriginal();
  const getAllAgentsConfigurationMock = vi.fn();
  const getAgentsMock = vi.fn();
  return {
    ...original,
    aevatarAI: {
      services: {
        agent: {
          getAllAgentsConfiguration: getAllAgentsConfigurationMock,
          getAgents: getAgentsMock,
        },
      },
    },
    sleep: vi.fn(),
    __esModule: true,
    getAllAgentsConfigurationMock,
    getAgentsMock,
  };
});

// Helper for async flush
const flushPromises = () => new Promise(setImmediate);

// Helper to get mocks from variables
async function getMocks() {
  const utils = await import('../../utils');
  const toastModule = await import('../../hooks/use-toast');
  return {
    getAllAgentsConfigurationMock: utils.getAllAgentsConfigurationMock,
    getAgentsMock: utils.getAgentsMock,
    toastMock: toastModule.toastMock,
  };
}

describe('MyGAevatar', () => {
  beforeEach(async () => {
    const { getAllAgentsConfigurationMock, getAgentsMock, toastMock } = await getMocks();
    getAllAgentsConfigurationMock.mockReset();
    getAgentsMock.mockReset();
    toastMock.mockReset();
    globalThis.mockHiddenGAevatarType = [];
    vi.clearAllMocks();
  });

  it('renders empty state and new button when no data', async () => {
    const { getAllAgentsConfigurationMock, getAgentsMock } = await getMocks();
    getAllAgentsConfigurationMock.mockResolvedValue([]);
    getAgentsMock.mockResolvedValue([]);
    render(<MyGAevatar onEditGaevatar={vi.fn()} />);
    await flushPromises();
    expect(screen.getByTestId('empty-icon')).toBeInTheDocument();
    expect(screen.getByText(/new g-agent/i)).toBeInTheDocument();
  });

  it('renders list of aevatars', async () => {
    const { getAllAgentsConfigurationMock, getAgentsMock } = await getMocks();
    getAllAgentsConfigurationMock.mockResolvedValue([
      { agentType: 'type1', propertyJsonSchema: { foo: 'bar' } },
    ]);
    getAgentsMock.mockResolvedValueOnce([
      { id: '1', name: 'Agent1', agentType: 'type1' },
    ]).mockResolvedValue([]);
    render(<MyGAevatar onEditGaevatar={vi.fn()} />);
    await flushPromises();
    expect(screen.getByTestId('aevatar-card')).toHaveTextContent('Agent1');
  });

  it('filters hiddenGAevatarType', async () => {
    globalThis.mockHiddenGAevatarType = ['type1'];
    const { getAllAgentsConfigurationMock, getAgentsMock } = await getMocks();
    getAllAgentsConfigurationMock.mockResolvedValue([
      { agentType: 'type1', propertyJsonSchema: {} },
      { agentType: 'type2', propertyJsonSchema: {} },
    ]);
    getAgentsMock.mockResolvedValueOnce([
      { id: '1', name: 'Agent1', agentType: 'type1' },
      { id: '2', name: 'Agent2', agentType: 'type2' },
    ]).mockResolvedValue([]);
    render(<MyGAevatar onEditGaevatar={vi.fn()} />);
    await flushPromises();
    const cards = screen.getAllByTestId('aevatar-card');
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveTextContent('Agent2');
  });

  it('calls onNewGAevatar when new button clicked', async () => {
    const { getAllAgentsConfigurationMock, getAgentsMock } = await getMocks();
    getAllAgentsConfigurationMock.mockResolvedValue([]);
    getAgentsMock.mockResolvedValue([]);
    const onNewGAevatar = vi.fn();
    render(<MyGAevatar onEditGaevatar={vi.fn()} onNewGAevatar={onNewGAevatar} />);
    await flushPromises();
    fireEvent.click(screen.getByText(/new g-agent/i));
    expect(onNewGAevatar).toHaveBeenCalled();
  });

  it('calls onEditGaevatar when card clicked', async () => {
    const { getAllAgentsConfigurationMock, getAgentsMock } = await getMocks();
    getAllAgentsConfigurationMock.mockResolvedValue([
      { agentType: 'type1', propertyJsonSchema: {} },
    ]);
    getAgentsMock.mockResolvedValueOnce([
      { id: '1', name: 'Agent1', agentType: 'type1' },
    ]).mockResolvedValue([]);
    const onEditGaevatar = vi.fn();
    render(<MyGAevatar onEditGaevatar={onEditGaevatar} />);
    await flushPromises();
    fireEvent.click(screen.getByTestId('aevatar-card'));
    expect(onEditGaevatar).toHaveBeenCalledWith('1');
  });

  it('shows PageLoading always', async () => {
    render(<MyGAevatar onEditGaevatar={vi.fn()} />);
    expect(screen.getByTestId('page-loading')).toBeInTheDocument();
  });

  it('does not show new button if maxGAevatarCount reached', async () => {
    const { getAllAgentsConfigurationMock, getAgentsMock } = await getMocks();
    getAllAgentsConfigurationMock.mockResolvedValue([
      { agentType: 'type1', propertyJsonSchema: {} },
    ]);
    getAgentsMock.mockResolvedValueOnce([
      { id: '1', name: 'Agent1', agentType: 'type1' },
    ]).mockResolvedValue([]);
    render(
      <MyGAevatar onEditGaevatar={vi.fn()} maxGAevatarCount={1} />
    );
    await flushPromises();
    expect(screen.queryByText(/new g-agent/i)).not.toBeInTheDocument();
  });

  it('handles getAllAgentsConfiguration error', async () => {
    const { getAllAgentsConfigurationMock, getAgentsMock, toastMock } = await getMocks();
    getAllAgentsConfigurationMock.mockRejectedValue(new Error('fail'));
    getAgentsMock.mockResolvedValue([]);
    render(<MyGAevatar onEditGaevatar={vi.fn()} />);
    await flushPromises();
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'error' })
    );
  });

  it('handles fetchAllList error', async () => {
    const { getAllAgentsConfigurationMock, getAgentsMock, toastMock } = await getMocks();
    getAllAgentsConfigurationMock.mockResolvedValue([]);
    getAgentsMock.mockRejectedValue(new Error('fail'));
    render(<MyGAevatar onEditGaevatar={vi.fn()} />);
    await flushPromises();
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'error' })
    );
  });

  it('handles getGAevatarList error', async () => {
    const { getAllAgentsConfigurationMock, getAgentsMock, toastMock } = await getMocks();
    getAllAgentsConfigurationMock.mockImplementation(() => { throw new Error('fail'); });
    getAgentsMock.mockResolvedValue([]);
    render(<MyGAevatar onEditGaevatar={vi.fn()} />);
    await flushPromises();
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'error' })
    );
  });
}); 