// ─────────────────────────────────────────────────────────────
// ICatalogService — workflow catalog, LLM status, primitives
// ─────────────────────────────────────────────────────────────

import type {
  WorkflowCatalogItem,
  LlmStatusResponse,
  PrimitiveCatalogItem,
} from "@aevatar-react-sdk/types";

export interface ICatalogService {
  getWorkflowCatalog(): Promise<WorkflowCatalogItem[]>;
  getLlmStatus(): Promise<LlmStatusResponse>;
  getPrimitives(): Promise<PrimitiveCatalogItem[]>;
}
