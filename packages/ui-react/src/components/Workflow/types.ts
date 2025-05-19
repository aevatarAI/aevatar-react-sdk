import type { IAgentInfoDetail } from "@aevatar-react-sdk/services";

export interface EdgeStyle {
  strokeWidth: number;
  stroke: string;
}

export interface Edge {
  type: string;
  source: string;
  sourceHandle: string;
  target: string;
  style: EdgeStyle;
  id: string;
}

export type TNodeDataClick = (
  data: Partial<IAgentInfoDetail>,
  isNew: boolean,
  nodeId: string
) => void;

export type TDeleteNode = (nodeId: string) => void;

export interface NodeData {
  label: string;
  agentInfo: IAgentInfoDetail;
  isNew: boolean;
  onClick: TNodeDataClick;
  deleteNode: TDeleteNode;
}

export interface Measured {
  width: number;
  height: number;
}

export interface INode {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  data: NodeData;
  measured: Measured;
}
