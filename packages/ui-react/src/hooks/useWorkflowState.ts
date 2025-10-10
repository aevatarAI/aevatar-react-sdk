import { useCallback } from "react";
import { aevatarAI } from "../utils";
import type { IFetchExecutionLogsResponse } from "@aevatar-react-sdk/services";

export enum EnumExecutionRecordStatus {
  Pending = "0",
  Running = "1",
  Success = "2",
  Failed = "3",
}

export const useWorkflowState = () => {
  const getWorkflowState = useCallback(
    async (workflowId: string): Promise<IFetchExecutionLogsResponse | null> => {
      try {
        const response =
          await aevatarAI.services.workflow.fetchLatestExecutionLogs({
            stateName: "WorkflowExecutionRecordState",
            workflowId,
          });

        if (!response?.items || response.items.length === 0) {
          return null;
        }
        return response.items?.[0];
      } catch (error) {
        // Re-throw the error to maintain the original error handling behavior
        // biome-ignore lint/complexity/noUselessCatch: <explanation>
        throw error;
      }
    },
    []
  );
  return {
    getWorkflowState,
  };
};
