import type { IWorkflowCoordinatorState } from "@aevatar-react-sdk/services";
import { useCallback } from "react";
import { aevatarAI } from "../utils";

export const useWorkflowState = () => {
  const getWorkflowState = useCallback(async (workflowAgentId: string) => {
    try {
      const queryString = `_id:${workflowAgentId}`;
      const workflowList =
        await aevatarAI.services.workflow.getWorkflow<IWorkflowCoordinatorState>(
          {
            stateName: "WorkflowCoordinatorState",
            queryString,
          }
        );
      if (!workflowList.items.length) throw "workflow not found";
      return workflowList.items?.[0];
    } catch (error) {
      // Re-throw the error to maintain the original error handling behavior
      // biome-ignore lint/complexity/noUselessCatch: <explanation>
      throw error;
    }
  }, []);
  return {
    getWorkflowState,
  };
};
