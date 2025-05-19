export interface ICreateAgentParams {
  agentType: string;
  name: string;
  properties: Record<string, any>;
}

export interface IAgentInfo {
  id: string;
  agentGuid: string;
  agentType: string;
  name: string;
  properties: Record<string, any>;
  businessAgentGrainId: string;
}

export interface IAgentInfoDetail extends IAgentInfo {
  businessAgentGrainId: string;
  // grainId?: string;
  propertyJsonSchema?: string;
}

export interface IGetAgentsParams {
  pageIndex: number;
  pageSize: number;
}

export interface IUpdateAgentInfo {
  name?: string;
  properties?: Record<string, any>;
}

export interface IAddSubAgentsParams {
  subAgents: string[];
}

export interface IAddSubAgentsResponse {
  id: string;
  subAgents: string[];
}

export interface IRemoveSubAgentsParams {
  removedSubAgents: string[];
}

export interface IRemoveSubAgentsResponse {
  id: string;
  subAgents: string[];
}

export interface IAgentRelationship {
  parentAgent: string;
  subAgents: string[];
}

export interface IAgentParams {
  name: string;
  type: string;
}

export interface IAgentsConfiguration {
  agentType: string;
  fullName: string;
  agentParams?: IAgentParams[];
  propertyJsonSchema?: string;
}

export interface IAgentService {
  createAgent(params: ICreateAgentParams): Promise<IAgentInfo>;
  getAgents(params: IGetAgentsParams): Promise<IAgentInfoDetail[]>;
  getAgentInfo(id: string): Promise<IAgentInfoDetail>;
  updateAgentInfo(
    id: string,
    params: IUpdateAgentInfo
  ): Promise<IAgentInfoDetail>;
  deleteAgent(id: string): Promise<void>;
  addSubAgents(
    id: string,
    params: IAddSubAgentsParams
  ): Promise<IAddSubAgentsResponse>;
  removeSubAgents(
    id: string,
    params: IRemoveSubAgentsParams
  ): Promise<IRemoveSubAgentsResponse>;
  removeAllSubAgent(id: string): Promise<void>;

  getAgentRelationship(id: string): Promise<IAgentRelationship>;

  getAllAgentsConfiguration(): Promise<IAgentsConfiguration[]>;
}
