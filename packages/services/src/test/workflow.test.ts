import { describe, it, expect, vi, beforeEach } from "vitest";
import type { IBaseRequest } from "@aevatar-react-sdk/types";
import type {
  IAgentInfo,
  IAgentInfoDetail,
  IUpdateAgentInfo,
} from "../types/agent";
import type {
  ICreateWorkflowParams,
  IEditWorkflowParams,
  ISimulateWorkflowParams,
  IStartWorkflowParams,
  IGetWorkflowQuery,
  IGetWorkflowResult,
  IGenerateWorkflowProps,
  IWorkflowViewDataParams,
  IWorkflowViewUpdateDataParams,
  IWorkflowItem,
} from "../types/workflow";
import { WorkflowService } from "../service/workflow";

describe("WorkflowService", () => {
  let workflowService: WorkflowService<IBaseRequest>;
  let mockRequest: { send: any };

  beforeEach(() => {
    mockRequest = {
      send: vi.fn(),
    };
    workflowService = new WorkflowService(mockRequest as any);
  });

  describe("createWorkflowViewData", () => {
    it("should create workflow view data correctly", async () => {
      const mockResponse: IAgentInfo = {
        id: "1",
        name: "Workflow View",
        businessAgentGrainId: "2",
        agentGuid: "guid-1",
        agentType: "WorkflowViewGAgent",
        properties: { test: "value" },
      };
      const params: IWorkflowViewDataParams = {
        name: "Test Workflow View",
        properties: {
          workflowNodeList: [],
          workflowNodeUnitList: [],
        },
      };
      mockRequest.send.mockResolvedValue(mockResponse);

      const result = await workflowService.createWorkflowViewData(params);
      
      expect(mockRequest.send).toHaveBeenCalledWith({
        method: "POST",
        url: "/api/agent",
        params: {
          ...params,
          agentType:
            "Aevatar.GAgents.GroupChat.GAgent.Coordinator.WorkflowView.WorkflowViewGAgent",
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it("should handle create workflow view data error", async () => {
      const params: IWorkflowViewDataParams = {
        name: "Test Workflow View",
        properties: {
          workflowNodeList: [],
          workflowNodeUnitList: [],
        },
      };
      mockRequest.send.mockRejectedValue(new Error("Network error"));

      await expect(workflowService.createWorkflowViewData(params)).rejects.toThrow("Network error");
    });
  });

  describe("updateWorkflowViewData", () => {
    it("should update workflow view data correctly", async () => {
      const mockResponse: IAgentInfo = {
        id: "1",
        name: "Updated Workflow View",
        businessAgentGrainId: "2",
        agentGuid: "guid-1",
        agentType: "WorkflowViewGAgent",
        properties: { test: "updated" },
      };
      const params: IWorkflowViewDataParams = {
        name: "Updated Workflow View",
        properties: {
          workflowNodeList: [],
          workflowNodeUnitList: [],
        },
      };
      mockRequest.send.mockResolvedValue(mockResponse);

      const result = await workflowService.updateWorkflowViewData("1", params);
      
      expect(mockRequest.send).toHaveBeenCalledWith({
        method: "PUT",
        url: "/api/agent/1",
        params: {
          ...params,
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it("should handle update workflow view data error", async () => {
      const params: IWorkflowViewDataParams = {
        name: "Updated Workflow View",
        properties: {
          workflowNodeList: [],
          workflowNodeUnitList: [],
        },
      };
      mockRequest.send.mockRejectedValue(new Error("Update failed"));

      await expect(workflowService.updateWorkflowViewData("1", params)).rejects.toThrow("Update failed");
    });
  });

  describe("publishWorkflowViewData", () => {
    it("should publish workflow view data correctly", async () => {
      const mockResponse: IAgentInfo = {
        id: "1",
        name: "Published Workflow View",
        businessAgentGrainId: "2",
        agentGuid: "guid-1",
        agentType: "WorkflowViewGAgent",
        properties: { published: true },
      };
      mockRequest.send.mockResolvedValue(mockResponse);

      const result = await workflowService.publishWorkflowViewData("1");
      
      expect(mockRequest.send).toHaveBeenCalledWith({
        method: "POST",
        url: "/api/workflow-view/1/publish-workflow",
      });
      expect(result).toEqual(mockResponse);
    });

    it("should handle publish workflow view data error", async () => {
      mockRequest.send.mockRejectedValue(new Error("Publish failed"));

      await expect(workflowService.publishWorkflowViewData("1")).rejects.toThrow("Publish failed");
    });
  });

  describe("edit", () => {
    it("should edit workflow correctly", async () => {
      const mockResponse: IAgentInfoDetail = {
        id: "1",
        name: "Edited Workflow",
        businessAgentGrainId: "2",
        agentGuid: "guid-1",
        agentType: "WorkflowCoordinatorGAgent",
        properties: { edited: true },
      };
      const params: IUpdateAgentInfo = { name: "Edited Workflow" };
      mockRequest.send.mockResolvedValue(mockResponse);

      const result = await workflowService.edit("1", params);
      
      expect(mockRequest.send).toHaveBeenCalledWith({
        method: "PUT",
        url: "/api/agent/1",
        params,
      });
      expect(result).toEqual(mockResponse);
    });

    it("should handle edit workflow error", async () => {
      const params: IUpdateAgentInfo = { name: "Edited Workflow" };
      mockRequest.send.mockRejectedValue(new Error("Edit failed"));

      await expect(workflowService.edit("1", params)).rejects.toThrow("Edit failed");
    });
  });

  describe("create", () => {
    it("should create workflow correctly", async () => {
      const mockResponse: IAgentInfo = {
        id: "1",
        name: "New Workflow",
        businessAgentGrainId: "2",
        agentGuid: "guid-1",
        agentType: "WorkflowCoordinatorGAgent",
        properties: { created: true },
      };
      const params: ICreateWorkflowParams = {
        name: "New Workflow",
        properties: {
          workflowUnitList: [],
        },
      };
      mockRequest.send.mockResolvedValue(mockResponse);

      const result = await workflowService.create(params);
      
      expect(mockRequest.send).toHaveBeenCalledWith({
        method: "POST",
        url: "/api/agent",
        params: {
          agentType:
            "Aevatar.GAgents.GroupChat.WorkflowCoordinator.WorkflowCoordinatorGAgent",
          ...params,
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it("should handle create workflow error", async () => {
      const params: ICreateWorkflowParams = {
        name: "New Workflow",
        properties: {
          workflowUnitList: [],
        },
      };
      mockRequest.send.mockRejectedValue(new Error("Create failed"));

      await expect(workflowService.create(params)).rejects.toThrow("Create failed");
    });
  });

  describe("simulate", () => {
    it("should simulate workflow correctly", async () => {
      const mockResponse = "simulation-result-id";
      const params: ISimulateWorkflowParams = {
        workflowGrainId: "workflow-1",
        workUnitRelations: [
          {
            grainId: "unit-1",
            nextGrainId: "unit-2",
            xPosition: 100,
            yPosition: 200,
          },
        ],
      };
      mockRequest.send.mockResolvedValue(mockResponse);

      const result = await workflowService.simulate(params);
      
      expect(mockRequest.send).toHaveBeenCalledWith({
        method: "POST",
        url: "/api/agent/workflow/simulate",
        params,
      });
      expect(result).toEqual(mockResponse);
    });

    it("should handle simulate workflow error", async () => {
      const params: ISimulateWorkflowParams = {
        workflowGrainId: "workflow-1",
        workUnitRelations: [],
      };
      mockRequest.send.mockRejectedValue(new Error("Simulation failed"));

      await expect(workflowService.simulate(params)).rejects.toThrow("Simulation failed");
    });
  });

  describe("editPublishEvent", () => {
    it("should edit publish event correctly", async () => {
      const mockResponse: IAgentInfo = {
        id: "1",
        name: "Event Edited",
        businessAgentGrainId: "2",
        agentGuid: "guid-1",
        agentType: "WorkflowCoordinatorGAgent",
        properties: { eventEdited: true },
      };
      const params: IEditWorkflowParams = {
        agentId: "agent-1",
        eventProperties: {
          workflowUnitList: [],
        },
      };
      mockRequest.send.mockResolvedValue(mockResponse);

      const result = await workflowService.editPublishEvent(params);
      
      expect(mockRequest.send).toHaveBeenCalledWith({
        method: "POST",
        url: "/api/agent/publishEvent",
        params: {
          eventType:
            "Aevatar.GAgents.GroupChat.WorkflowCoordinator.GEvent.ResetWorkflowEvent",
          ...params,
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it("should handle edit publish event error", async () => {
      const params: IEditWorkflowParams = {
        agentId: "agent-1",
        eventProperties: {
          workflowUnitList: [],
        },
      };
      mockRequest.send.mockRejectedValue(new Error("Event edit failed"));

      await expect(workflowService.editPublishEvent(params)).rejects.toThrow("Event edit failed");
    });
  });

  describe("getWorkflow", () => {
    it("should get workflow with all parameters correctly", async () => {
      const mockResponse: IGetWorkflowResult<IWorkflowItem> = {
        totalCount: 2,
        items: [
          {
            termToWorkUnitGrainId: '{"term1": "unit1"}',
            children: '["child1", "child2"]',
            workflowStatus: "1",
            currentWorkUnitInfos: '["info1"]',
            ctime: "2023-01-01T00:00:00Z",
            term: 1,
            blackboardId: "blackboard-1",
            backupWorkUnitInfos: '["backup1"]',
            version: 1,
          },
        ],
      };
      const query: IGetWorkflowQuery = {
        stateName: "workflow-state",
        queryString: "test query",
        state: "active",
        pageIndex: 0,
        pageSize: 10,
        sortFields: ["name", "createdAt"],
      };
      mockRequest.send.mockResolvedValue(mockResponse);

      const result = await workflowService.getWorkflow(query);
      
      expect(mockRequest.send).toHaveBeenCalledWith({
        method: "GET",
        url: "/api/query/es?stateName=workflow-state&queryString=test+query&state=active&pageIndex=0&pageSize=10&sortFields=name%2CcreatedAt",
      });
      expect(result).toEqual(mockResponse);
    });

    it("should get workflow with minimal parameters correctly", async () => {
      const mockResponse: IGetWorkflowResult<IWorkflowItem> = {
        totalCount: 1,
        items: [],
      };
      const query: IGetWorkflowQuery = {
        stateName: "workflow-state",
      };
      mockRequest.send.mockResolvedValue(mockResponse);

      const result = await workflowService.getWorkflow(query);
      
      expect(mockRequest.send).toHaveBeenCalledWith({
        method: "GET",
        url: "/api/query/es?stateName=workflow-state",
      });
      expect(result).toEqual(mockResponse);
    });

    it("should handle get workflow error", async () => {
      const query: IGetWorkflowQuery = {
        stateName: "workflow-state",
      };
      mockRequest.send.mockRejectedValue(new Error("Get workflow failed"));

      await expect(workflowService.getWorkflow(query)).rejects.toThrow("Get workflow failed");
    });
  });

  describe("start", () => {
    it("should start workflow correctly", async () => {
      const mockResponse = { status: "started", workflowId: "workflow-1" };
      const params: IStartWorkflowParams = {
        agentId: "agent-1",
        eventProperties: { startData: "test" },
      };
      mockRequest.send.mockResolvedValue(mockResponse);

      const result = await workflowService.start(params);
      
      expect(mockRequest.send).toHaveBeenCalledWith({
        method: "POST",
        url: "/api/agent/publishEvent",
        params: {
          eventType:
            "Aevatar.GAgents.GroupChat.WorkflowCoordinator.GEvent.StartWorkflowCoordinatorEvent",
          ...params,
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it("should handle start workflow error", async () => {
      const params: IStartWorkflowParams = {
        agentId: "agent-1",
        eventProperties: { startData: "test" },
      };
      mockRequest.send.mockRejectedValue(new Error("Start workflow failed"));

      await expect(workflowService.start(params)).rejects.toThrow("Start workflow failed");
    });
  });

  describe("generate", () => {
    it("should generate workflow correctly", async () => {
      const mockResponse = { generatedWorkflow: "workflow-data" };
      const params: IGenerateWorkflowProps = {
        userGoal: "Create a workflow for data processing",
      };
      mockRequest.send.mockResolvedValue(mockResponse);

      const result = await workflowService.generate(params);
      
      expect(mockRequest.send).toHaveBeenCalledWith({
        method: "POST",
        url: "/api/workflow/generate",
        params,
      });
      expect(result).toEqual(mockResponse);
    });

    it("should handle generate workflow error", async () => {
      const params: IGenerateWorkflowProps = {
        userGoal: "Create a workflow for data processing",
      };
      mockRequest.send.mockRejectedValue(new Error("Generate workflow failed"));

      await expect(workflowService.generate(params)).rejects.toThrow("Generate workflow failed");
    });
  });
}); 