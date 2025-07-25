import type {
  IAgentInfoDetail,
  IWorkflowUnitListItem,
} from "@aevatar-react-sdk/services";
import type { Edge, INode, TDeleteNode, TNodeDataClick } from "./types";
let id = 0;
const getId = () => `edge_id_${id++}`;

export const generateWorkflowGraph = (
  grains: IWorkflowUnitListItem[],
  agentInfos: IAgentInfoDetail[],
  onClick: TNodeDataClick,
  deleteNode: TDeleteNode
): { nodes: INode[]; edges: Edge[] } => {
  const nodes: INode[] = [];
  const edges: Edge[] = [];

  const agentInfoMap: { [grainId: string]: IAgentInfoDetail } = {};
  for (const agent of agentInfos) {
    agentInfoMap[agent.businessAgentGrainId] = agent;
  }

  for (const grain of grains) {
    const agentInfo = agentInfoMap[grain.grainId];
    if (!agentInfo) {
      throw new Error(`No agentInfo found for grainId ${grain.grainId}`);
    }

    nodes.push({
      id: agentInfo.id,
      type: "ScanCard",
      position: {
        x: Number(grain.extendedData.xPosition),
        y: Number(grain.extendedData.yPosition),
      },
      data: {
        label: "ScanCard Node",
        agentInfo: agentInfo,
        isNew: false,
        onClick,
        deleteNode,
      },
      measured: {
        width: 234,
        height: 301,
      },
    });

    if (grain.nextGrainId) {
      const targetAgentInfo = agentInfoMap[grain.nextGrainId];
      if (!targetAgentInfo) {
        throw new Error(
          `No agentInfo found for nextGrainId ${grain.nextGrainId}`
        );
      }

      edges.push({
        id: `edge__${agentInfo.id}__${targetAgentInfo.id}__${getId()}`,
        type: "bezier",
        source: agentInfo.id,
        sourceHandle: "b",
        target: targetAgentInfo.id,
        style: {
          strokeWidth: 2,
          stroke: "#B9B9B9",
        },
      });
    }
  }

  return { nodes, edges };
};
