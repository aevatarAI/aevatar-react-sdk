import type { IBaseRequest } from "@aevatar-react-sdk/types";
import type { IServices } from "../types/services";
import { AgentService } from "./agent";
import type { IAgentService } from "../types";
import type { IWorkflowService } from "../types/workflow";
import { WorkflowService } from "./workflow";

export class Services<T extends IBaseRequest = IBaseRequest>
  implements IServices
{
  readonly agent: IAgentService;
  readonly workflow: IWorkflowService;

  constructor(request: T) {
    this.agent = new AgentService(request);
    this.workflow = new WorkflowService(request);
  }
}
