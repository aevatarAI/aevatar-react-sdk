import {
  BaseService,
  type IAgentInfoDetail,
  type IUpdateAgentInfo,
  type IAgentInfo,
} from "../types";
import type { IBaseRequest } from "@aevatar-react-sdk/types";
import type {
  ICreateWorkflowParams,
  IEditWorkflowParams,
  ISimulateWorkflowParams,
  IWorkflowService,
  IStartWorkflowParams,
  IGetWorkflowQuery,
  IGetWorkflowResult,
  IGenerateWorkflowProps,
  IWorkflowViewDataParams,
  IFetchExecutionLogsProps,
  IFetchAgentDetailsProps,
  IGetAIModelsProps,
} from "../types/workflow";

export class WorkflowService<T extends IBaseRequest = IBaseRequest>
  extends BaseService<T>
  implements IWorkflowService
{
  createWorkflowViewData(params: IWorkflowViewDataParams): Promise<IAgentInfo> {
    return this._request.send({
      method: "POST",
      url: "/api/agent",
      params: {
        ...params,
        agentType:
          "Aevatar.GAgents.GroupChat.GAgent.Coordinator.WorkflowView.WorkflowViewGAgent",
      },
    });
  }
  updateWorkflowViewData(
    id: string,
    params: IWorkflowViewDataParams,
  ): Promise<IAgentInfo> {
    return this._request.send({
      method: "PUT",
      url: `/api/agent/${id}`,
      params: {
        ...params,
      },
    });
  }
  publishWorkflowViewData(id: string): Promise<IAgentInfo> {
    return this._request.send({
      method: "POST",
      url: `/api/workflow-view/${id}/publish-workflow`,
    });
  }
  edit(id: string, params: IUpdateAgentInfo): Promise<IAgentInfoDetail> {
    return this._request.send({
      method: "PUT",
      url: `/api/agent/${id}`,
      params,
    });
  }

  create(params: ICreateWorkflowParams): Promise<IAgentInfo> {
    return this._request.send({
      method: "POST",
      url: "/api/agent",
      params: {
        agentType:
          "Aevatar.GAgents.GroupChat.WorkflowCoordinator.WorkflowCoordinatorGAgent",
        ...params,
      },
    });
  }

  simulate(params: ISimulateWorkflowParams): Promise<string> {
    return this._request.send({
      method: "POST",
      url: "/api/agent/workflow/simulate",
      params,
    });
  }

  editPublishEvent(params: IEditWorkflowParams): Promise<IAgentInfo> {
    return this._request.send({
      method: "POST",
      url: "/api/agent/publishEvent",
      params: {
        eventType:
          "Aevatar.GAgents.GroupChat.WorkflowCoordinator.GEvent.ResetWorkflowEvent",
        ...params,
      },
    });
  }

  getWorkflow<T = any>(
    query: IGetWorkflowQuery,
  ): Promise<IGetWorkflowResult<T>> {
    const params = new URLSearchParams();
    params.append("stateName", query.stateName);
    if (query.queryString) params.append("queryString", query.queryString);
    if (query.state) params.append("state", query.state);
    if (typeof query.pageIndex === "number")
      params.append("pageIndex", String(query.pageIndex));
    if (typeof query.pageSize === "number")
      params.append("pageSize", String(query.pageSize));
    if (query.sortFields && query.sortFields.length > 0)
      params.append("sortFields", query.sortFields.join(","));
    return this._request.send({
      method: "GET",
      url: `/api/query/es?${params.toString()}`,
    });
  }

  getAIModels<T = any>(_: IGetAIModelsProps): Promise<T> {
    return this._request.send({
      method: "GET",
      url: "/api/agent/agent-type-info-list",
    });
  }

  fetchAgentDetails<T = any>(query: IFetchAgentDetailsProps): Promise<T> {
    const params = new URLSearchParams({
      queryString: `formattedBusinessAgentGrainId:"${query.formattedBusinessAgentGrainId}"`,
      stateName: query.stateName,
    });

    return this._request.send({
      method: "GET",
      url: `/api/query/es?${params.toString()}`,
    });
  }

  fetchExecutionLogs<T = any>(query: IFetchExecutionLogsProps): Promise<T> {
    const params = new URLSearchParams({
      queryString: `workflowId:${query.workflowId}`,
      stateName: query.stateName,
      roundId: String(query.roundId),
    });

    return this._request.send({
      method: "GET",
      url: `/api/query/es?${params.toString()}`,
    });
  }

  start<T = any>(params: IStartWorkflowParams): Promise<T> {
    return this._request.send({
      method: "POST",
      url: "/api/agent/publishEvent",
      params: {
        eventType:
          "Aevatar.GAgents.GroupChat.WorkflowCoordinator.GEvent.StartWorkflowCoordinatorEvent",
        ...params,
      },
    });
  }

  generate<T = any>(params: IGenerateWorkflowProps): Promise<T> {
    return this._request.send({
      method: "POST",
      url: "/api/workflow/generate",
      params,
    });
  }
}
