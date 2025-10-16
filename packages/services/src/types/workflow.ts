import type { IAgentInfo, IAgentInfoDetail, IUpdateAgentInfo } from "./agent";

export interface IGenerateWorkflowProps {
  userGoal: string;
}

export interface IFetchAgentDetailsProps {
  formattedBusinessAgentGrainId: string;
  stateName: string;
}
export interface IFetchLatestExecutionLogsProps {
  stateName: string;
  workflowId: string;
}

export interface IFetchExecutionLogsProps {
  stateName: string;
  queryString: string;
  pageIndex: number;
  pageSize: number;
  sortFields: string;
}

export interface IFetchExecutionLogsResponse {
  workUnitRecords: string;
  children: string;
  ctime: string;
  startTime: string;
  workUnitInfos: string;
  endTime: string;
  roundId: number;
  version: number;
  workflowId: string;
  status: string;
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
  createTime: string;
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

export interface IGetAIModelsProps {
  [key: string]: string;
}
export interface IFetchAutoCompleteProps {
  userGoal: string;
}
export interface IRunWorkflowParams {
  viewAgentId: string;
  eventProperties: any;
}

export interface IRunWorkflowResponse {
  isSuccess: boolean;
  message: string;
  workflowId: string;
  publishedAgent: IAgentInfo;
}
export enum IGetWorkflowLogsLevel {
  Information = "Information",
  Warning = "Warning",
  Error = "Error",
  Debug = "Debug",
}
export interface IGetWorkflowLogsProps {
  workflowId: string;
  roundId?: number;
  grainId?: string;
  level?: IGetWorkflowLogsLevel;
  messagePattern?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface IGetWorkflowLogsResult {
  data: IGetWorkflowLogsItem[];
}

export interface IGetWorkflowLogsItem {
  timestamp: string;
  appLog: {
    message?: string;
    logId: string;
    time: string;
    level?: IGetWorkflowLogsLevel | null;
    exception: string | null;
    traceId: string;
    spanId: string;
    logCategory: string;
    workflowId: string;
    roundId?: number | null;
    grainId: string;
    sourceContext: string;
    application: string;
    environment: string;
    methodName: string;
  };
}

export interface IWorkflowService {
  simulate(params: ISimulateWorkflowParams): Promise<string>;
  edit(id: string, params: IUpdateAgentInfo): Promise<IAgentInfoDetail>;
  editPublishEvent(params: IEditWorkflowParams): Promise<IAgentInfo>;
  getWorkflow<T = any>(
    query: IGetWorkflowQuery
  ): Promise<IGetWorkflowResult<T>>;
  getAIModels<T = any>(props: IGetAIModelsProps): Promise<T>;
  fetchAutoComplete<T = any>(props: IFetchAutoCompleteProps): Promise<T>;
  fetchLatestExecutionLogs<T = IFetchExecutionLogsResponse>(
    props: IFetchLatestExecutionLogsProps
  ): Promise<{ items: T[]; totalCount: number }>;
  fetchExecutionLogs<T = IFetchExecutionLogsResponse>(
    props: IFetchExecutionLogsProps
  ): Promise<{ items: T[]; totalCount: number }>;
  fetchAgentDetails<T = any>(props: IFetchAgentDetailsProps): Promise<T>;
  generate<T = any>(props: IGenerateWorkflowProps): Promise<T>;
  start<T = any>(params: IStartWorkflowParams): Promise<T>;
  runWorkflow<T = IRunWorkflowResponse>(params: IRunWorkflowParams): Promise<T>;
  createWorkflowViewData(params: IWorkflowViewDataParams): Promise<IAgentInfo>;
  updateWorkflowViewData(
    id: string,
    params: IWorkflowViewUpdateDataParams
  ): Promise<IAgentInfo>;
  publishWorkflowViewData(id: string): Promise<IAgentInfo>;
  getWorkflowLogs(
    props: IGetWorkflowLogsProps
  ): Promise<IGetWorkflowLogsItem[]>;
}
