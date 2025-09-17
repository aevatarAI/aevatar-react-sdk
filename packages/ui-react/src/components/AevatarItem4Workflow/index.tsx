import type { IAgentInfoDetail } from "@aevatar-react-sdk/services";
import AevatarCardInner from "./AevatarCardInner";
import { Handle, Position } from "@xyflow/react";
import type { TNodeDataClick } from "../Workflow/types";
import { useWorkflow } from "../context/WorkflowProvider";
import { useMemo } from "react";

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
  selected,
  data,
}: IAevatarItem4WorkflowProps) {
  const { isNew, onClick, deleteNode, agentInfo } = data;
  const [{ selectedAgent, executionLogsData }] = useWorkflow();
  const currentAgentStatus = useMemo(() => {
    return executionLogsData?.find((agent) => agent?.id === data?.agentInfo?.id)
      ?.status;
  }, [executionLogsData, data?.agentInfo?.id]);
  console.log(
    currentAgentStatus,
    executionLogsData,
    data,
    "currentAgentStatus"
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
        agentStatus={currentAgentStatus}
        isNew={isNew}
        onClick={onClick}
        deleteNode={deleteNode}
        nodeId={nodeId}
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
