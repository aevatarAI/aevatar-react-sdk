import type { IAgentInfoDetail } from "@aevatar-react-sdk/services";
import { basicActions } from "../utils";

export const WorkflowActions = {
  setSelectedAgent: "SET_SELECTED_AGENT",
  destroy: "DESTROY",
};

export type WorkflowState = {
  selectedAgent?: {
    agent: Partial<IAgentInfoDetail>;
    isNew?: boolean;
    nodeId: string;
  };
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
  destroy: {
    type: WorkflowActions.destroy,
    actions: () => basicActions(WorkflowActions.destroy),
  },
};
