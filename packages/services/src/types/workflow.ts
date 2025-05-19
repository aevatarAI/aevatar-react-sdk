export interface IWorkUnitRelationsItem {
  grainId: string;
  nextGrainId: string;
  xPosition: number;
  yPosition: number;
}

export interface ICreateWorkflowProps {
  workUnitRelations: IWorkUnitRelationsItem[];
}

export interface ICreateWorkflowResult {
  workflowGrainId: string;
  errorMessage: string;
}

export interface ISimulateWorkflowProps {
  workflowGrainId: string;
  workUnitRelations: IWorkUnitRelationsItem[];
}

export interface IEditWorkflowProps {
  workflowGrainId: string;
  workUnitRelations: IWorkUnitRelationsItem[];
}

export interface IWorkflowService {
  create(props: ICreateWorkflowProps): Promise<ICreateWorkflowResult>;
  simulate(props: ISimulateWorkflowProps): Promise<string>;
  edit(props: IEditWorkflowProps): Promise<string>;
  getWorkflow(workflowGranId: string): Promise<IWorkUnitRelationsItem[]>;
}
