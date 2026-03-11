import type { IAgentService } from "./index";
import type { IWorkflowService } from "./workflow";
import type { IChatService } from "./chat";
import type { ICatalogService } from "./catalog";

export interface IServices {
  readonly agent: IAgentService;
  readonly workflow: IWorkflowService;
  readonly chat?: IChatService;
  readonly catalog?: ICatalogService;
}
