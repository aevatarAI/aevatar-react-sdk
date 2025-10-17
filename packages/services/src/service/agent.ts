import { BaseService } from "../types";
import type { IBaseRequest } from "@aevatar-react-sdk/types";
import type {
  IAddSubAgentsParams,
  IAddSubAgentsResponse,
  IAgentInfo,
  IAgentInfoDetail,
  IAgentRelationship,
  IAgentsConfiguration,
  IAgentService,
  ICreateAgentParams,
  IGetAgentsParams,
  IRemoveSubAgentsParams,
  IRemoveSubAgentsResponse,
  IUpdateAgentInfo,
} from "../types/agent";

export class AgentService<T extends IBaseRequest = IBaseRequest>
  extends BaseService<T>
  implements IAgentService
{
  getAgentInfo(id: string): Promise<IAgentInfoDetail> {
    return this._request.send({
      method: "GET",
      url: `/api/agent/${id}`,
    });
  }
  updateAgentInfo(
    id: string,
    params: IUpdateAgentInfo
  ): Promise<IAgentInfoDetail> {
    return this._request.send({
      method: "PUT",
      url: `/api/agent/${id}`,
      params,
    });
  }
  deleteAgent(id: string): Promise<void> {
    return this._request.send({
      method: "DELETE",
      url: `/api/agent/${id}`,
    });
  }
  addSubAgents(
    id: string,
    params: IAddSubAgentsParams
  ): Promise<IAddSubAgentsResponse> {
    return this._request.send({
      method: "POST",
      url: `/api/agent/${id}/add-subagent`,
      params,
    });
  }
  removeSubAgents(
    id: string,
    params: IRemoveSubAgentsParams
  ): Promise<IRemoveSubAgentsResponse> {
    return this._request.send({
      method: "POST",
      url: `/api/agent/${id}/remove-subagent`,
      params,
    });
  }
  removeAllSubAgent(id: string): Promise<void> {
    return this._request.send({
      method: "POST",
      url: `/api/agent/${id}/remove-all-subagent`,
    });
  }
  getAgentRelationship(id: string): Promise<IAgentRelationship> {
    return this._request.send({
      method: "GET",
      url: `/api/agent/${id}/relationship`,
    });
  }
  getAllAgentsConfiguration(): Promise<IAgentsConfiguration[]> {
    return this._request.send({
      method: "GET",
      url: "/api/agent/agent-type-info-list",
    });
  }
  getAgents(params: IGetAgentsParams): Promise<IAgentInfoDetail[]> {
    return this._request.send({
      method: "GET",
      url: "/api/agent/agent-list",
      params,
    });
  }
  createAgent(params: ICreateAgentParams): Promise<IAgentInfo> {
    return this._request.send({
      method: "POST",
      url: "/api/agent",
      params,
    });
  }
}
