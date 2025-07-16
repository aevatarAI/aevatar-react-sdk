import { useCallback } from "react";
import { useWorkflow } from ".";

export function useWorkflowDispatch() {
  const [, { dispatch }] = useWorkflow();
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  return useCallback(dispatch, [dispatch]);
}
