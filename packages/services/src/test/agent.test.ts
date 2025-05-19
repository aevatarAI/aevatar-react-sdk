import { describe, it, expect, vi, beforeEach } from "vitest";
import type { IBaseRequest } from "@aevatar-react-sdk/types";
import type {
  IAgentInfoDetail,
  IUpdateAgentInfo,
  IAddSubAgentsParams,
  IAddSubAgentsResponse,
  IRemoveSubAgentsParams,
  IRemoveSubAgentsResponse,
  IAgentRelationship,
  IAgentsConfiguration,
  IAgentInfo,
  ICreateAgentParams,
  IGetAgentsParams,
  IAgentParams,
} from "../types/agent";
import { AgentService } from "../service/agent";

describe("AgentService", () => {
  let agentService: AgentService<IBaseRequest>;
  let mockRequest: { send: any };

  beforeEach(() => {
    mockRequest = {
      send: vi.fn(),
    };
    agentService = new AgentService(mockRequest as any);
  });

  it("should get agent info correctly", async () => {
    const mockResponse: IAgentInfoDetail = {
      id: "1",
      name: "Agent1",
      businessAgentGrainId: "2",
      agentGuid: "",
      agentType: "",
      properties: {
        a: 1,
      },
      grainId: ""
    };
    mockRequest.send.mockResolvedValue(mockResponse);

    const result = await agentService.getAgentInfo("1");
    expect(mockRequest.send).toHaveBeenCalledWith({
      method: "GET",
      url: "/api/agent",
      params: { guid: "1" },
    });
    expect(result).toEqual(mockResponse);
  });

  it("should update agent info correctly", async () => {
    const mockResponse: IAgentInfoDetail = {
      id: "1",
      name: "Updated Agent",
      businessAgentGrainId: "",
      agentGuid: "",
      agentType: "",
      properties: { a: 1 },
    };
    const updateParams: IUpdateAgentInfo = { name: "Updated Agent" };
    mockRequest.send.mockResolvedValue(mockResponse);

    const result = await agentService.updateAgentInfo("1", updateParams);
    expect(mockRequest.send).toHaveBeenCalledWith({
      method: "PUT",
      url: "/api/agent/1",
      params: updateParams,
    });
    expect(result).toEqual(mockResponse);
  });

  it("should delete agent correctly", async () => {
    mockRequest.send.mockResolvedValue(undefined);

    await agentService.deleteAgent("1");
    expect(mockRequest.send).toHaveBeenCalledWith({
      method: "DELETE",
      url: "/api/agent/1",
    });
  });

  it("should add subagents correctly", async () => {
    const mockResponse: IAddSubAgentsResponse = {
      id: "1",
      subAgents: ["111", "12222", "3333"],
    };
    const addParams: IAddSubAgentsParams = {
      subAgents: ["111", "12222", "3333"],
    };
    mockRequest.send.mockResolvedValue(mockResponse);

    const result = await agentService.addSubAgents("1", addParams);
    expect(mockRequest.send).toHaveBeenCalledWith({
      method: "POST",
      url: "/api/agent/1/add-subagent",
      params: addParams,
    });
    expect(result).toEqual(mockResponse);
  });

  it("should remove subagents correctly", async () => {
    const mockResponse: IRemoveSubAgentsResponse = {
      id: "1",
      subAgents: ["111", "12222", "3333"],
    };
    const removeParams: IRemoveSubAgentsParams = {
      removedSubAgents: ["111", "12222", "3333"],
    };
    mockRequest.send.mockResolvedValue(mockResponse);

    const result = await agentService.removeSubAgents("1", removeParams);
    expect(mockRequest.send).toHaveBeenCalledWith({
      method: "POST",
      url: "/api/agent/1/remove-subagent",
      params: removeParams,
    });
    expect(result).toEqual(mockResponse);
  });

  it("should remove all subagents correctly", async () => {
    mockRequest.send.mockResolvedValue(undefined);

    await agentService.removeAllSubAgent("1");
    expect(mockRequest.send).toHaveBeenCalledWith({
      method: "POST",
      url: "/api/agent/1/remove-all-subagent",
    });
  });

  it("should get agent relationship correctly", async () => {
    const mockResponse: IAgentRelationship = {
      parentAgent: "1",
      subAgents: ["111", "12222", "3333"],
    };
    mockRequest.send.mockResolvedValue(mockResponse);

    const result = await agentService.getAgentRelationship("1");
    expect(mockRequest.send).toHaveBeenCalledWith({
      method: "GET",
      url: "/api/agent/1/relationship",
    });
    expect(result).toEqual(mockResponse);
  });

  it("should get all agents configuration correctly", async () => {
    const mockAgentParams: IAgentParams[] = [
      {
        name: "Agent One",
        type: "Type A",
      },
      {
        name: "Agent Two",
        type: "Type B",
      },
    ];

    const mockAgentsConfiguration: IAgentsConfiguration[] = [
      {
        agentType: "Type A",
        fullName: "Agent Type A Full Name",
        agentParams: mockAgentParams,
      },
      {
        agentType: "Type B",
        fullName: "Agent Type B Full Name",
        agentParams: null,
      },
    ];
    const mockResponse: IAgentsConfiguration[] = mockAgentsConfiguration;
    mockRequest.send.mockResolvedValue(mockResponse);

    const result = await agentService.getAllAgentsConfiguration();
    expect(mockRequest.send).toHaveBeenCalledWith({
      method: "GET",
      url: "/api/agent/all-agents",
    });
    expect(result).toEqual(mockResponse);
  });

  it("should get agents correctly", async () => {
    const mockResponse: IAgentInfo[] = [
      {
        id: "1",
        agentGuid: "guid",
        agentType: "Type A",
        name: "Type A",
        properties: { a: 1 },
        businessAgentGrainId: "businessAgentGrainId",
      },
    ];
    const params: IGetAgentsParams = {
      userAddress: "userAddress",
      pageIndex: 0,
      pageSize: 20,
    };
    mockRequest.send.mockResolvedValue(mockResponse);

    const result = await agentService.getAgents(params);
    expect(mockRequest.send).toHaveBeenCalledWith({
      method: "GET",
      url: "/api/agent/atomic-agents",
      params,
    });
    expect(result).toEqual(mockResponse);
  });

  it("should create agent correctly", async () => {
    const mockResponse: IAgentInfo = {
      id: "1",
      agentGuid: "guid",
      agentType: "Type A",
      name: "Type A",
      properties: { a: 1 },
      businessAgentGrainId: "businessAgentGrainId",
    };
    const createParams: ICreateAgentParams = {
      name: "New Agent",
      agentType: "Type A",
      properties: { a: 1 },
    };
    mockRequest.send.mockResolvedValue(mockResponse);

    const result = await agentService.createAgent(createParams);
    expect(mockRequest.send).toHaveBeenCalledWith({
      method: "POST",
      url: "/api/agent/agent",
      params: createParams,
    });
    expect(result).toEqual(mockResponse);
  });
});
