import type { IAgentInfoDetail } from "@aevatar-react-sdk/services";
import AevatarCardInner from "./AevatarCardInner";
import { Handle, Position } from "@xyflow/react";
import type { TNodeDataClick } from "../Workflow/types";
import { useWorkflow } from "../context/WorkflowProvider";

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
  const [{ selectedAgent }] = useWorkflow();
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: "var(--sdk-success-color)",
          border: "1px solid var(--sdk-muted-foreground)",
          width: 10,
          height: 10,
        }}
      />
      <AevatarCardInner
        agentInfo={agentInfo}
        selected={selectedAgent?.nodeId === nodeId}
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
          border: "1px solid var(--sdk-muted-foreground)",
          width: 10,
          height: 10,
        }}
      />
    </>
  );
}
