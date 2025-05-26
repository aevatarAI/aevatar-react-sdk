import type { IAgentInfo, IAgentInfoDetail, IUpdateAgentInfo } from "./agent";

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
  GrainId: string;
  NextGrainId: string;
  ExtendedData: Record<string, string> & IWorkflowUnitPosition;
}

export interface ICreateWorkflowProps {
  name: string;
  properties: {
    WorkflowUnitList: IWorkflowUnitListItem[];
  };
}

export interface ISimulateWorkflowProps {
  workflowGrainId: string;
  workUnitRelations: IWorkUnitRelationsItem[];
}

export interface IResetWorkflowEventProperties {
  WorkflowUnitList: IWorkflowUnitListItem[];
}

export interface IEditWorkflowProps {
  agentId: string;
  eventProperties: IResetWorkflowEventProperties;
}

export interface IStartWorkflowProps {
  agentId: string;
  eventProperties: any;
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

export interface IWorkflowService {
  create(props: ICreateWorkflowProps): Promise<IAgentInfo>;
  simulate(props: ISimulateWorkflowProps): Promise<string>;
  edit(id: string, props: IUpdateAgentInfo): Promise<IAgentInfoDetail>;
  editPublishEvent(props: IEditWorkflowProps): Promise<IAgentInfo>;
  getWorkflow<T = any>(
    query: IGetWorkflowQuery
  ): Promise<IGetWorkflowResult<T>>;
  start<T = any>(props: IStartWorkflowProps): Promise<T>;
}
