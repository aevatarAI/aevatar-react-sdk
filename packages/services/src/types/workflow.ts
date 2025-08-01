import type { IAgentInfo, IAgentInfoDetail, IUpdateAgentInfo } from "./agent";

export interface IGenerateWorkflowProps {
  userGoal: string;
}
export interface IWorkUnitRelationsItem {
  grainId: string;
  nextGrainId: string;
  xPosition: number;
  yPosition: number;
}

export interface IWorkflowUnitPosition {
  xPosition: string;
  yPosition: string;
}

export interface IWorkflowUnitListItem {
  grainId: string;
  nextGrainId: string;
  extendedData: Record<string, string> & IWorkflowUnitPosition;
}

export interface ICreateWorkflowParams {
  name: string;
  properties: {
    workflowUnitList: IWorkflowUnitListItem[];
  };
}

export interface ISimulateWorkflowParams {
  workflowGrainId: string;
  workUnitRelations: IWorkUnitRelationsItem[];
}

export interface IResetWorkflowEventProperties {
  workflowUnitList: IWorkflowUnitListItem[];
}

export interface IEditWorkflowParams {
  agentId: string;
  eventProperties: IResetWorkflowEventProperties;
}

export interface IStartWorkflowParams {
  agentId: string;
  eventProperties: any;
}

export enum WorkflowStatus {
  pending = "0",
  running = "1",
  failed = "2",
}

export interface IWorkflowCoordinatorState {
  lastRunningTime?: string;
  termToWorkUnitGrainId: Record<string, string>;
  children: string;
  workflowStatus: WorkflowStatus; // 0: pending 1；running 2：failed
  currentWorkUnitInfos: string;
  ctime: string;
  term: number;
  blackboardId: string;
  backupWorkUnitInfos: string;
  version: number;
}
export interface IGetWorkflowQuery {
  stateName: string;
  queryString?: string;
  state?: string;
  pageIndex?: number;
  pageSize?: number;
  sortFields?: string[];
}

export interface IWorkflowItem {
  /** JSON object string mapping terms to work unit grain IDs */
  termToWorkUnitGrainId: string;
  /** JSON array string, each item structure defined by backend */
  children: string;
  /** Workflow status as string */
  workflowStatus: string;
  /** JSON array string, each item structure defined by backend */
  currentWorkUnitInfos: string;
  /** ISO datetime string */
  ctime: string;
  /** Term number */
  term: number;
  /** Blackboard ID as string */
  blackboardId: string;
  /** JSON array string, each item structure defined by backend */
  backupWorkUnitInfos: string;
  /** Version number */
  version: number;
}

export interface IGetWorkflowResult<T = any> {
  totalCount: number;
  items: T[];
}

export interface IWorkflowNode {
  nodeId: string;
  agentId?: string;
  name: string;
  agentType: string;
  properties?: Record<string, any>;
  jsonProperties: string;
  extendedData: IWorkflowUnitPosition;
}

export interface IWorkflowNodeUnit {
  nodeId: string;
  nextNodeId?: string;
}

export interface IWorkflowViewDataParams {
  name: string;
  properties: {
    workflowNodeList: IWorkflowNode[];
    workflowNodeUnitList: IWorkflowNodeUnit[];
  };
}

export interface IWorkflowViewUpdateDataParams {
  name: string;
  properties: {
    workflowCoordinatorGAgentId: string;
    workflowNodeList: IWorkflowNode[];
    workflowNodeUnitList: IWorkflowNodeUnit[];
  };
}

export interface IWorkflowService {
  create(params: ICreateWorkflowParams): Promise<IAgentInfo>;
  simulate(params: ISimulateWorkflowParams): Promise<string>;
  edit(id: string, params: IUpdateAgentInfo): Promise<IAgentInfoDetail>;
  editPublishEvent(params: IEditWorkflowParams): Promise<IAgentInfo>;
  getWorkflow<T = any>(
    query: IGetWorkflowQuery
  ): Promise<IGetWorkflowResult<T>>;
  generate<T = any>(props: IGenerateWorkflowProps): Promise<T>;
  start<T = any>(params: IStartWorkflowParams): Promise<T>;
  createWorkflowViewData(params: IWorkflowViewDataParams): Promise<IAgentInfo>;
  updateWorkflowViewData(
    id: string,
    params: IWorkflowViewUpdateDataParams
  ): Promise<IAgentInfo>;
  publishWorkflowViewData(id: string): Promise<IAgentInfo>;
}
