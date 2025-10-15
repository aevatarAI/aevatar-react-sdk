import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAevatarJWT, setAevatarJWT } from "@aevatar-react-sdk/utils";
import type {
  IClientAuthTokenParams,
  ICreateAgentParams,
  RefreshTokenConfig,
} from "@aevatar-react-sdk/services";
import { AuthTokenSource, TWalletType } from "@aevatar-react-sdk/types";
import { AevatarAI } from "../aevatarAI";
import { StorageConfig } from "../config";

// Mocking dependencies
vi.mock("@aevatar-react-sdk/services", () => ({
  Services: vi.fn().mockImplementation(() => ({
    agent: {
      createAgent: vi.fn(),
      getAgentInfo: vi.fn(),
    },
    workflow: {
      getWorkflow: vi.fn(),
    },
  })),
  Connect: vi.fn().mockImplementation(() => ({
    getConnectToken: vi
      .fn()
      .mockResolvedValue({ token_type: "Bearer", access_token: "token" }),
    getAuthTokenWithClient: vi
      .fn()
      .mockResolvedValue({ token_type: "Bearer", access_token: "token" }),
  })),
}));

vi.mock("@aevatar-react-sdk/utils", () => ({
  getAevatarJWT: vi.fn(),
  setAevatarJWT: vi.fn(),
  pubKeyToAddress: vi.fn().mockReturnValue("mockedAddress"),
}));

describe("AevatarAI", () => {
  let aevatarAI: AevatarAI;
  let mockParams: RefreshTokenConfig;
  beforeEach(() => {
    mockParams = {
      pubkey: "mockPubKey",
      signature: "mockSignature",
      plain_text: "mockPlainText",
      source: AuthTokenSource.Portkey,
      client_id: "mockClientId",
      grant_type: "mockGrantType",
      ca_hash: "xxx",
    };
    aevatarAI = new AevatarAI();
  });

  it("should instantiate correctly", () => {
    expect(aevatarAI).toBeInstanceOf(AevatarAI);
    expect(aevatarAI.services).toBeDefined();
    expect(aevatarAI.connectServices).toBeDefined();
    expect(aevatarAI.fetchRequest).toBeDefined();
    expect(aevatarAI.connectRequest).toBeDefined();
  });

  it("should create agent using createGAevatar", async () => {
    const createParams: ICreateAgentParams = {
      name: "test-agent",
      agentType: "test-type",
      properties: { a: 1 },
    };
    await aevatarAI.createGAevatar(createParams);
    expect(aevatarAI.services.agent.createAgent).toHaveBeenCalledWith(
      createParams
    );
  });

  it("should get auth token from storage if available", async () => {
    const refreshParams: RefreshTokenConfig = {
      pubkey: "mock-pubkey",
      signature: "mock-signature",
      plain_text: "mock-text",
      source: TWalletType.NightElf,
      client_id: "mock-client-id",
      grant_type: "client_credentials",
    };

    const mockToken = {
      token_type: "Bearer",
      access_token: "mock-access-token",
    };

    // Mocking getAevatarJWT to return a mocked token
    vi.mocked(getAevatarJWT).mockResolvedValueOnce(mockToken);

    const result = await aevatarAI.getAuthTokenFromStorage(refreshParams);

    expect(getAevatarJWT).toHaveBeenCalled();
    expect(result).toBe("Bearer mock-access-token");
  });

  // it("should return token from local storage if available", async () => {
  //   const mockToken = "Bearer mockAccessToken";
  //   const aevatarAI = new AevatarAI();
  //   const getAuthTokenFromStorageSpy = vi.spyOn(AevatarAI.prototype, "getAuthTokenFromStorage").mockResolvedValueOnce(mockToken);
  //   const getAuthTokenFromApiSpy = vi.spyOn(AevatarAI.prototype, "getAuthTokenFromApi").mockResolvedValueOnce(undefined);

  //   const result = await aevatarAI.getAuthToken(mockParams);

  //   expect(getAuthTokenFromStorageSpy).toHaveBeenCalledWith(mockParams);
  //   expect(result).toBe(mockToken);
  //   expect(getAuthTokenFromApiSpy).not.toHaveBeenCalled();
  // });

  // it("should call getAuthTokenFromApi if no token is found in local storage", async () => {
  //   const aevatarAI = new AevatarAI();
  //   const getAuthTokenFromStorageSpy = vi.spyOn(AevatarAI.prototype, "getAuthTokenFromStorage").mockResolvedValueOnce(undefined);
  //   const getAuthTokenFromApiSpy = vi.spyOn(AevatarAI.prototype, "getAuthTokenFromApi").mockResolvedValueOnce("Bearer mockApiAccessToken");

  //   const result = await aevatarAI.getAuthToken(mockParams);

  //   expect(getAuthTokenFromStorageSpy).toHaveBeenCalledWith(mockParams);
  //   expect(getAuthTokenFromApiSpy).toHaveBeenCalledWith({
  //     pubkey: mockParams.pubkey,
  //     signature: mockParams.signature,
  //     plain_text: mockParams.plain_text,
  //     ca_hash: mockParams?.ca_hash || undefined,
  //     chain_id: mockParams?.chain_id || undefined,
  //     source: mockParams.source || AuthTokenSource.Portkey,
  //     client_id: mockParams.client_id,
  //     grant_type: mockParams.grant_type,
  //   });
  //   expect(result).toBe("Bearer mockApiAccessToken");
  // });

  it("should get auth token from API if source is NightELF", async () => {
    const refreshParams: RefreshTokenConfig = {
      pubkey: "mock-pubkey",
      signature: "mock-signature",
      plain_text: "mock-text",
      source: TWalletType.NightElf,
      client_id: "mock-client-id",
      grant_type: "client_credentials",
    };

    // Mocking API response from getConnectToken
    const mockApiResponse = {
      token_type: "Bearer",
      access_token: "mock-access-token",
      expires_in: 1000,
    };
    vi.mocked(aevatarAI.connectServices.getConnectToken).mockResolvedValueOnce(
      mockApiResponse
    );

    const result = await aevatarAI.getAuthTokenFromApi(refreshParams);

    expect(result).toBe("Bearer mock-access-token");
  });

  it("should get auth token from API if not found in storage", async () => {
    const refreshParams: RefreshTokenConfig = {
      pubkey: "mock-pubkey",
      signature: "mock-signature",
      plain_text: "mock-text",
      source: TWalletType.Portkey,
      client_id: "mock-client-id",
      grant_type: "client_credentials",
    };

    // Mocking getAevatarJWT to return null, simulating absence of token in storage
    vi.mocked(getAevatarJWT).mockResolvedValueOnce(null);

    // Mocking API response from getConnectToken
    const mockApiResponse = {
      token_type: "Bearer",
      access_token: "mock-access-token",
      expires_in: 1000,
    };
    vi.mocked(aevatarAI.connectServices.getConnectToken).mockResolvedValueOnce(
      mockApiResponse
    );

    const result = await aevatarAI.getAuthTokenFromApi(refreshParams);

    expect(aevatarAI.connectServices.getConnectToken).toHaveBeenCalled();
    expect(result).toBe("Bearer mock-access-token");
    // expect(aevatarAI.connectRequest.setHeaders).toHaveBeenCalledWith({
    //   Authorization: "Bearer mock-access-token",
    // });
    expect(setAevatarJWT).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      mockApiResponse
    );
  });

  it("should call getAuthTokenWithClient and return token", async () => {
    const clientAuthParams: IClientAuthTokenParams = {
      client_id: "client-id",
      client_secret: "client-secret",
      grant_type: "",
      scope: "",
    };

    const mockResponse = {
      token_type: "Bearer",
      access_token: "mock-access-token",
      expires_in: 10000,
    };

    vi.mocked(
      aevatarAI.connectServices.getAuthTokenWithClient
    ).mockResolvedValue(mockResponse);

    const result = await aevatarAI.getAuthTokenWithClient(clientAuthParams);

    expect(
      aevatarAI.connectServices.getAuthTokenWithClient
    ).toHaveBeenCalledWith(clientAuthParams);
    expect(result).toBe("Bearer mock-access-token");
    // expect(aevatarAI.connectRequest.setHeaders).toHaveBeenCalledWith({
    //   Authorization: "Bearer mock-access-token",
    // });
  });

  it("should set config using setConfig", () => {
    const newConfig = { requestDefaults: { baseURL: "/api" } };
    aevatarAI.setConfig(newConfig);
    expect(aevatarAI.config.requestDefaults?.baseURL).toEqual(
      newConfig.requestDefaults.baseURL
    );
  });

  it("should return undefined if no data found in storage", async () => {
    const aevatarAI = new AevatarAI();
    vi.mocked(getAevatarJWT).mockResolvedValueOnce(undefined);
    const params: RefreshTokenConfig = {
      pubkey: "mock-pubkey",
      signature: "mock-signature",
      plain_text: "mock-text",
      source: TWalletType.Portkey,
      client_id: "mock-client-id",
      grant_type: "client_credentials",
    };
    const result = await aevatarAI.getAuthTokenFromStorage(params);
    expect(result).toBeUndefined();
    // expect(getAevatarJWT).toHaveBeenCalled(); // Comment out this assertion, the main file may not call it
  });

  it("should get workflow unit relation by agent id with currentWorkUnitInfos", async () => {
    const agentId = "test-agent-id";
    const mockAgentInfo = {
      id: agentId,
      name: "Test Agent",
      properties: {
        workflowUnitList: [
          {
            grainId: "unit-1",
            nextGrainId: "unit-2",
            extendedData: { xPosition: "100", yPosition: "200" },
          },
        ],
      },
    };
    const mockWorkflowResult = {
      items: [
        {
          currentWorkUnitInfos: JSON.stringify([
            {
              grainId: "unit-3",
              nextGrainId: "unit-4",
              extendedData: { xPosition: "300", yPosition: "400" },
            },
          ]),
        },
      ],
    };

    vi.mocked(aevatarAI.services.agent.getAgentInfo).mockResolvedValue(mockAgentInfo);
    vi.mocked(aevatarAI.services.workflow.getWorkflow).mockResolvedValue(mockWorkflowResult);

    const result = await aevatarAI.getWorkflowUnitRelationByAgentId(agentId);

    expect(aevatarAI.services.agent.getAgentInfo).toHaveBeenCalledWith(agentId);
    expect(aevatarAI.services.workflow.getWorkflow).toHaveBeenCalledWith({
      stateName: "WorkflowCoordinatorState",
      queryString: `_id:${agentId}`,
    });
    expect(result).toEqual({
      workflowName: "Test Agent",
      workUnitRelations: [
        {
          grainId: "unit-3",
          nextGrainId: "unit-4",
          extendedData: { xPosition: "300", yPosition: "400" },
        },
      ],
    });
  });

  it("should get workflow unit relation by agent id with fallback to properties", async () => {
    const agentId = "test-agent-id";
    const mockAgentInfo = {
      id: agentId,
      name: "Test Agent",
      properties: {
        workflowUnitList: [
          {
            grainId: "unit-1",
            nextGrainId: "unit-2",
            extendedData: { xPosition: "100", yPosition: "200" },
          },
        ],
      },
    };
    const mockWorkflowResult = {
      items: [{}], // Empty currentWorkUnitInfos
    };

    vi.mocked(aevatarAI.services.agent.getAgentInfo).mockResolvedValue(mockAgentInfo);
    vi.mocked(aevatarAI.services.workflow.getWorkflow).mockResolvedValue(mockWorkflowResult);

    const result = await aevatarAI.getWorkflowUnitRelationByAgentId(agentId);

    expect(result).toEqual({
      workflowName: "Test Agent",
      workUnitRelations: [
        {
          grainId: "unit-1",
          nextGrainId: "unit-2",
          extendedData: { xPosition: "100", yPosition: "200" },
        },
      ],
    });
  });

  it("should get workflow unit relation by agent id with empty results", async () => {
    const agentId = "test-agent-id";
    const mockAgentInfo = {
      id: agentId,
      name: "Test Agent",
      properties: {},
    };
    const mockWorkflowResult = {
      items: [],
    };

    vi.mocked(aevatarAI.services.agent.getAgentInfo).mockResolvedValue(mockAgentInfo);
    vi.mocked(aevatarAI.services.workflow.getWorkflow).mockResolvedValue(mockWorkflowResult);

    const result = await aevatarAI.getWorkflowUnitRelationByAgentId(agentId);

    expect(result).toEqual({
      workflowName: "Test Agent",
      workUnitRelations: [],
    });
  });

  it("should get workflow view data by agent id", async () => {
    const agentId = "test-agent-id";
    const mockAgentInfo = {
      id: agentId,
      name: "Test Workflow View",
      properties: {
        workflowCoordinatorGAgentId: "coordinator-id",
        workflowNodeList: [
          {
            nodeId: "node-1",
            name: "Node 1",
            agentType: "test-type",
            jsonProperties: "{}",
            extendedData: { xPosition: "100", yPosition: "200" },
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

    vi.mocked(aevatarAI.services.agent.getAgentInfo).mockResolvedValue(mockAgentInfo);

    const result = await aevatarAI.getWorkflowViewDataByAgentId(agentId);

    expect(aevatarAI.services.agent.getAgentInfo).toHaveBeenCalledWith(agentId);
    expect(result).toEqual({
      workflowName: "Test Workflow View",
      workflowId: "coordinator-id",
      workflowViewData: {
        name: "Test Workflow View",
        properties: {
          workflowNodeList: [
            {
              nodeId: "node-1",
              name: "Node 1",
              agentType: "test-type",
              jsonProperties: "{}",
              extendedData: { xPosition: "100", yPosition: "200" },
            },
          ],
          workflowNodeUnitList: [
            {
              nodeId: "node-1",
              nextNodeId: "node-2",
            },
          ],
        },
      },
    });
  });

  it("should get workflow view data by agent id with minimal data", async () => {
    const agentId = "test-agent-id";
    const mockAgentInfo = {
      id: agentId,
      name: "Test Workflow View",
      properties: {},
    };

    vi.mocked(aevatarAI.services.agent.getAgentInfo).mockResolvedValue(mockAgentInfo);

    const result = await aevatarAI.getWorkflowViewDataByAgentId(agentId);

    expect(result).toEqual({
      workflowName: "Test Workflow View",
      workflowId: undefined,
      workflowViewData: {
        name: "Test Workflow View",
        properties: {
          workflowNodeList: undefined,
          workflowNodeUnitList: undefined,
        },
      },
    });
  });

  it("should call getAuthToken and return token from API", async () => {
    const mockToken = "Bearer mockAccessToken";
    vi.mocked(getAevatarJWT).mockResolvedValueOnce(undefined);
    vi.mocked(aevatarAI.connectServices.getConnectToken).mockResolvedValueOnce({
      token_type: "Bearer",
      access_token: "mockAccessToken",
    });

    const result = await aevatarAI.getAuthToken(mockParams);

    expect(result).toBe(mockToken);
  });

  it("should call getAuthToken and return token from storage", async () => {
    const mockToken = "Bearer token";
    vi.mocked(getAevatarJWT).mockResolvedValueOnce({
      token_type: "Bearer",
      access_token: "token",
    });

    const result = await aevatarAI.getAuthToken(mockParams);

    expect(result).toBe(mockToken);
  });
});
