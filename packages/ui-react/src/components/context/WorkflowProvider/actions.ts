import type { IAgentInfoDetail } from "@aevatar-react-sdk/services";
import { basicActions } from "../utils";
import type { ExecutionLogItem } from "@aevatar-react-sdk/types";

export const WorkflowActions = {
  setSelectedAgentLogs: "SET_SELECTED_AGENT_LOGS",
  setSelectedAgent: "SET_SELECTED_AGENT",
  setExecutionLogsData: "SET_EXECUTION_LOGS_DATA",
  setIsRunning: "SET_IS_RUNNING",
  destroy: "DESTROY",
};

export type WorkflowState = {
  selectedAgent?: {
    agent: Partial<IAgentInfoDetail>;
    isNew?: boolean;
    nodeId: string;
  };
  executionLogsData?: ExecutionLogItem[];
  isRunning: boolean;
  selectedAgentLogs?: ExecutionLogItem;
};

export const basicWorkflow = {
  setSelectedAgentLogs: {
    type: WorkflowActions.setSelectedAgentLogs,
    actions: (selectedAgentLogs: ExecutionLogItem) =>
      basicActions(WorkflowActions.setSelectedAgentLogs, {
        selectedAgentLogs,
      }),
  },
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
  setIsRunning: {
    type: WorkflowActions.setIsRunning,
    actions: (isRunning: boolean) =>
      basicActions(WorkflowActions.setIsRunning, {
        isRunning,
      }),
  },
  destroy: {
    type: WorkflowActions.destroy,
    actions: () => basicActions(WorkflowActions.destroy),
  },
};
