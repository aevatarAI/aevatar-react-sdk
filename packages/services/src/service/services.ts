import type { IBaseRequest } from "@aevatar-react-sdk/types";
import type { IServices } from "../types/services";
import { AgentService } from "./agent";
import type { IAgentService } from "../types";
import type { IWorkflowService } from "../types/workflow";
import type { IChatService } from "../types/chat";
import type { ICatalogService } from "../types/catalog";
import { WorkflowService } from "./workflow";
import { ChatService } from "./chat";
import { CatalogService } from "./catalog";

export class Services<T extends IBaseRequest = IBaseRequest>
  implements IServices
{
  readonly agent: IAgentService;
  readonly workflow: IWorkflowService;
  readonly chat: IChatService;
  readonly catalog: ICatalogService;

  constructor(request: T) {
    this.agent = new AgentService(request);
    this.workflow = new WorkflowService(request);
    this.chat = new ChatService(request);
    this.catalog = new CatalogService(request);
  }
}
