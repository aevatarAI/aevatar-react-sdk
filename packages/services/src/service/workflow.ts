import {
  BaseService,
  type IAgentInfoDetail,
  type IUpdateAgentInfo,
  type IAgentInfo,
} from "../types";
import type { IBaseRequest } from "@aevatar-react-sdk/types";
import type {
  ICreateWorkflowProps,
  IEditWorkflowProps,
  ISimulateWorkflowProps,
  IWorkflowService,
  IStartWorkflowProps,
  IGetWorkflowQuery,
  IGetWorkflowResult,
  IGenerateWorkflowProps
} from "../types/workflow";

export class WorkflowService<T extends IBaseRequest = IBaseRequest>
  extends BaseService<T>
  implements IWorkflowService
{
  edit(id: string, props: IUpdateAgentInfo): Promise<IAgentInfoDetail> {
    return this._request.send({
      method: "PUT",
      url: `/api/agent/${id}`,
      params: props,
    });
  }

  create(params: ICreateWorkflowProps): Promise<IAgentInfo> {
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

  simulate(params: ISimulateWorkflowProps): Promise<string> {
    return this._request.send({
      method: "POST",
      url: "/api/agent/workflow/simulate",
      params,
    });
  }

  editPublishEvent(params: IEditWorkflowProps): Promise<IAgentInfo> {
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
    query: IGetWorkflowQuery
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

  start<T = any>(params: IStartWorkflowProps): Promise<T> {
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
      params
    }) 
  }
}
