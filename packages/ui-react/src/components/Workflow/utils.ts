import type {
  IAgentInfoDetail,
  IAgentsConfiguration,
  IWorkflowViewDataParams,
} from "@aevatar-react-sdk/services";
import type { Edge, INode, TDeleteNode, TNodeDataClick } from "./types";
import { IS_NULL_ID } from "../../constants";
let id = 0;
const getId = () => `edge_id_${id++}`;

export const generateWorkflowGraph = (
  workflowViewData: IWorkflowViewDataParams,
  agentInfos: IAgentInfoDetail[],
  gaevatarTypeList: IAgentsConfiguration[],
  onClick: TNodeDataClick,
  deleteNode: TDeleteNode,
): { nodes: INode[]; edges: Edge[] } => {
  const nodes: INode[] = [];
  const edges: Edge[] = [];

  const agentInfoMap: Map<string, IAgentInfoDetail> = new Map();
  for (const agent of agentInfos) {
    agentInfoMap.set(agent.id, agent);
  }

  // First, create all nodes from workflowNodeList
  for (const workflowNode of workflowViewData.properties.workflowNodeList) {
    const nodeAgentId =
      !workflowNode?.agentId || workflowNode?.agentId === IS_NULL_ID
        ? workflowNode.nodeId
        : workflowNode.agentId;

    const nodeId = workflowNode.nodeId;

    const jsonSchema = gaevatarTypeList.find(
      (v) => v.agentType === workflowNode.agentType,
    )?.propertyJsonSchema;

    let agentInfo = agentInfoMap.get(nodeAgentId);
    const jsonProperties = workflowNode.jsonProperties
      ? workflowNode.jsonProperties
      : JSON.stringify(agentInfo?.properties ?? {});

    if (!agentInfo) {
      agentInfo = {
        id: nodeAgentId,
        businessAgentGrainId: nodeAgentId,
        agentGuid: nodeAgentId,
        propertyJsonSchema: jsonSchema,
        ...workflowNode,
        properties: JSON.parse(jsonProperties),
      };
    }
    
    if (
      !agentInfo.properties ||
      Object.keys(agentInfo.properties).length === 0
    ) {
      agentInfo.properties = JSON.parse(jsonProperties);
    }

    agentInfo.propertyJsonSchema = jsonSchema;

    nodes.push({
      id: nodeId,
      type: "ScanCard",
      position: {
        x: Number(workflowNode.extendedData?.xPosition),
        y: Number(workflowNode.extendedData?.yPosition),
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
  }

  // Then, create edges from workflowNodeUnitList
  for (const nodeUnit of workflowViewData.properties.workflowNodeUnitList) {
    if (nodeUnit.nextNodeId) {
      const sourceAgentId =
        !nodeUnit?.nodeId || nodeUnit?.nodeId === IS_NULL_ID
          ? nodeUnit.nodeId
          : nodeUnit.nodeId;
      const targetAgentId =
        !nodeUnit?.nextNodeId || nodeUnit?.nextNodeId === IS_NULL_ID
          ? nodeUnit.nextNodeId
          : nodeUnit.nextNodeId;

      // Create edge between source and target nodes
      edges.push({
        id: `edge__${sourceAgentId}__${targetAgentId}__${getId()}`,
        type: "bezier",
        source: sourceAgentId,
        sourceHandle: "b",
        target: targetAgentId,
        style: {
          strokeWidth: 2,
          stroke: "var(--sdk-muted-foreground)",
        },
      });
    }
  }

  return { nodes, edges };
};
