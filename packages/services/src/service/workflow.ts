import { BaseService } from "../types";
import type { IBaseRequest } from "@aevatar-react-sdk/types";
import type {
  ICreateWorkflowProps,
  ICreateWorkflowResult,
  IEditWorkflowProps,
  ISimulateWorkflowProps,
  IWorkflowService,
  IWorkUnitRelationsItem,
} from "../types/workflow";

export class WorkflowService<T extends IBaseRequest = IBaseRequest>
  extends BaseService<T>
  implements IWorkflowService
{
  create(params: ICreateWorkflowProps): Promise<ICreateWorkflowResult> {
    return this._request.send({
      method: "POST",
      url: "/api/agent/workflow",
      params,
    });
  }

  simulate(params: ISimulateWorkflowProps): Promise<string> {
    return this._request.send({
      method: "POST",
      url: "/api/agent/workflow/simulate",
      params,
    });
  }

  edit(params: IEditWorkflowProps): Promise<string> {
    return this._request.send({
      method: "PUT",
      url: "/api/agent/workflow",
      params,
    });
  }

  getWorkflow(workflowGranId: string): Promise<IWorkUnitRelationsItem[]> {
    return this._request.send({
      method: "GET",
      url: `/api/agent/workflow?workflowGranId=${workflowGranId}`,
    });
  }
}
