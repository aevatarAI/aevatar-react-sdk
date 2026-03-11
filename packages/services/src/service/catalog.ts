// ─────────────────────────────────────────────────────────────
// CatalogService — workflow catalog, LLM status, primitives
// Maps to: GET /api/workflow-catalog
//          GET /api/llm/status
//          GET /api/primitives
// ─────────────────────────────────────────────────────────────

import type { IBaseRequest } from "@aevatar-react-sdk/types";
import type {
  WorkflowCatalogItem,
  LlmStatusResponse,
  PrimitiveCatalogItem,
} from "@aevatar-react-sdk/types";
import { BaseService } from "../types";
import type { ICatalogService } from "../types/catalog";

export class CatalogService<T extends IBaseRequest = IBaseRequest>
  extends BaseService<T>
  implements ICatalogService
{
  getWorkflowCatalog(): Promise<WorkflowCatalogItem[]> {
    return this._request.send({
      method: "GET",
      url: "/api/workflow-catalog",
    });
  }

  getLlmStatus(): Promise<LlmStatusResponse> {
    return this._request.send({
      method: "GET",
      url: "/api/llm/status",
    });
  }

  getPrimitives(): Promise<PrimitiveCatalogItem[]> {
    return this._request.send({
      method: "GET",
      url: "/api/primitives",
    });
  }
}
