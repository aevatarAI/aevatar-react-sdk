import type { IAgentInfoDetail } from "@aevatar-react-sdk/services";
import AevatarCardInner from "./AevatarCardInner";
import { Handle, Position } from "@xyflow/react";
import type { TNodeDataClick } from "../Workflow/types";
import { useWorkflow } from "../context/WorkflowProvider";
import { useCallback, useMemo } from "react";
import { basicWorkflow } from "../context/WorkflowProvider/actions";

interface IAevatarItem4WorkflowProps {
  id: string;
  selected?: boolean;
  data: {
    agentInfo?: IAgentInfoDetail;
    deleteNode: (nodeId: string) => void;
    onClick: TNodeDataClick;
    isNew?: boolean;
  };
}

export default function AevatarItem4Workflow({
  id: nodeId,
  data,
}: IAevatarItem4WorkflowProps) {
  const { isNew, onClick, deleteNode, agentInfo } = data;
  const [{ selectedAgent, executionLogsData, isRunning }, { dispatch }] =
    useWorkflow();
  const currentAgentLogs = useMemo(() => {
    return executionLogsData?.find(
      (agent) =>
        agent?.grainId ===
        `${data?.agentInfo?.agentType}/${(data?.agentInfo?.id ?? "")?.replace(
          /-/g,
          ""
        )}`
    );
  }, [executionLogsData, data?.agentInfo?.id, data?.agentInfo?.agentType]);

  const onShowLogsDialog = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      dispatch(basicWorkflow.setSelectedAgentLogs.actions(currentAgentLogs));
    },
    [dispatch, currentAgentLogs]
  );

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: "var(--sdk-success-color)",
          border: "1px solid var(--sdk-color-border-primary)",
          width: 10,
          height: 10,
          zIndex: 1,
        }}
      />
      <AevatarCardInner
        agentInfo={agentInfo}
        selected={selectedAgent?.nodeId === nodeId}
        agentLogs={currentAgentLogs}
        isNew={isNew}
        disabled={isRunning}
        onClick={onClick}
        deleteNode={deleteNode}
        nodeId={nodeId}
        onShowLogsDialog={onShowLogsDialog}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="b"
        style={{
          background: "var(--sdk-success-color)",
          border: "1px solid var(--sdk-color-border-primary)",
          width: 10,
          height: 10,
        }}
      />
    </>
  );
}
