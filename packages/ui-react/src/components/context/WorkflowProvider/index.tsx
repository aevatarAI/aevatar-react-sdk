import type React from "react";
import { createContext, useContext, useMemo, useReducer } from "react";
import { basicWorkflow, type WorkflowState } from "./actions";
import type { BasicActions } from "../utils";
import { Toaster } from "../../ui/toaster";

const INITIAL_STATE = {
  selectedAgent: undefined,
};
const WorkflowContext = createContext<any>(INITIAL_STATE);

export function useWorkflow(): [WorkflowState, BasicActions] {
  const context = useContext(WorkflowContext);
  return context;
}

function reducer(state: any, { type, payload }: any) {
  switch (type) {
    case basicWorkflow.destroy.type: {
      return INITIAL_STATE;
    }
    case basicWorkflow.setSelectedAgent.type: {
      return {
        ...state,
        selectedAgent: payload.selectedAgent,
      };
    }
    default: {
      return Object.assign({}, state, payload);
    }
  }
}

export interface ProviderProps {
  // theme?: Theme;
  children: React.ReactNode;
  hiddenGAevatarType?: string[];
}
export default function WorkflowProvider({ children }: ProviderProps) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  return (
    <WorkflowContext.Provider
      value={useMemo(() => [{ ...state }, { dispatch }], [state])}>
      {children}
      <Toaster />
    </WorkflowContext.Provider>
  );
}
