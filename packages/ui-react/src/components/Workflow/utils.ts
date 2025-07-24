import type {
  IAgentInfoDetail,
  IWorkflowNode,
  IWorkflowUnitListItem,
  IWorkflowViewDataParams,
} from "@aevatar-react-sdk/services";
import type { Edge, INode, TDeleteNode, TNodeDataClick } from "./types";
let id = 0;
const getId = () => `edge_id_${id++}`;

export const generateWorkflowGraph = (
  workflowViewData: IWorkflowViewDataParams,
  agentInfos: IAgentInfoDetail[],
  onClick: TNodeDataClick,
  deleteNode: TDeleteNode
): { nodes: INode[]; edges: Edge[] } => {
  const nodes: INode[] = [];
  const edges: Edge[] = [];

  const agentInfoMap: Map<string, IAgentInfoDetail> = new Map();
  for (const agent of agentInfos) {
    agentInfoMap.set(agent.id, agent);
  }

  const workflowNodeListMap: Map<string, IWorkflowNode> = new Map();
  for (const node of workflowViewData.properties.workflowNodeList) {
    workflowNodeListMap.set(node.nodeId, node);
  }

  for (const node of workflowViewData.properties.workflowNodeUnitList) {
    const nodeAgent = workflowNodeListMap.get(node.nodeId);
    let agentInfo = agentInfoMap.get(nodeAgent?.nodeId);
    if (!agentInfo) {
      agentInfo = {
        ...nodeAgent,
        id: nodeAgent?.nodeId,
        businessAgentGrainId: nodeAgent?.nodeId,
        agentGuid: nodeAgent?.nodeId,
      };
    }

    nodes.push({
      id: agentInfo.id,
      type: "ScanCard",
      position: {
        x: Number(nodeAgent?.extendedData?.xPosition),
        y: Number(nodeAgent?.extendedData?.yPosition),
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

    if (node.nextNodeId) {
      const targetAgent = workflowNodeListMap.get(node.nextNodeId);
      let targetAgentInfo = agentInfoMap.get(targetAgent?.nodeId);
      if (!targetAgentInfo) {
        targetAgentInfo = {
          id: targetAgent?.nodeId,
          businessAgentGrainId: targetAgent?.nodeId,
          agentGuid: targetAgent?.nodeId,
          ...targetAgent,
        };
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
