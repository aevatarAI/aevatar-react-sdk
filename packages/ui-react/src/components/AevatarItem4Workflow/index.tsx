import type { IAgentInfoDetail } from "@aevatar-react-sdk/services";
import AevatarCardInner from "./AevatarCardInner";
import { Handle, Position } from "@xyflow/react";
import type { TNodeDataClick } from "../Workflow/types";

interface IAevatarItem4WorkflowProps {
  id: string;
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
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: "#53FF8A",
          border: "1px solid #B9B9B9",
          width: 10,
          height: 10,
        }}
      />
      <AevatarCardInner
        agentInfo={agentInfo}
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
          background: "#53FF8A",
          border: "1px solid #B9B9B9",
          width: 10,
          height: 10,
        }}
      />
    </>
  );
}
