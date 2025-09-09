import type { IAgentInfoDetail } from "@aevatar-react-sdk/services";
import { basicActions } from "../utils";
import type { ExecutionLogItem } from "@aevatar-react-sdk/types";

export const WorkflowActions = {
  setSelectedAgent: "SET_SELECTED_AGENT",
  setExecutionLogsData: "SET_EXECUTION_LOGS_DATA",
  destroy: "DESTROY",
};

export type WorkflowState = {
  selectedAgent?: {
    agent: Partial<IAgentInfoDetail>;
    isNew?: boolean;
    nodeId: string;
  };
  executionLogsData?: ExecutionLogItem[];
};

export const basicWorkflow = {
  setSelectedAgent: {
    type: WorkflowActions.setSelectedAgent,
    actions: (selectedAgent?: {
      agent: Partial<IAgentInfoDetail>;
      isNew?: boolean;
      nodeId: string;
    }) =>
      basicActions(WorkflowActions.setSelectedAgent, {
        selectedAgent,
      }),
  },
  setExecutionLogsData: {
    type: WorkflowActions.setExecutionLogsData,
    actions: (executionLogsData?: any[]) =>
      basicActions(WorkflowActions.setExecutionLogsData, {
        executionLogsData,
      }),
  },
  destroy: {
    type: WorkflowActions.destroy,
    actions: () => basicActions(WorkflowActions.destroy),
  },
};
