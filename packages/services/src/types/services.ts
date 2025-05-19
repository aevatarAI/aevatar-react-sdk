import type { IAgentService } from "./index";
import type { IWorkflowService } from "./workflow";

export interface IServices {
  readonly agent: IAgentService;
  readonly workflow: IWorkflowService;
}
