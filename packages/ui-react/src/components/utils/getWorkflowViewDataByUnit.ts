import type {
  IAgentInfoDetail,
  IWorkflowNode,
  IWorkflowNodeUnit,
  IWorkflowUnitListItem,
} from "@aevatar-react-sdk/services";
import type { INode } from "../Workflow/types";

export const getWorkflowViewDataByUnit = (
  gaevatarList: IAgentInfoDetail[],
  workUnitRelations: IWorkflowUnitListItem[],
  nodeList: INode[]
) => {
  const gaevatarListMap = new Map<string, IAgentInfoDetail>();
  gaevatarList.forEach((item) => {
    gaevatarListMap.set(item.id, item);
  });
  const workflowNodeMap = new Map<string, IWorkflowNode>();
  const workflowNodeUnitList: IWorkflowNodeUnit[] = [];
  workUnitRelations.forEach((item) => {
    const nodeId = item.grainId;
    let _workflowNode: Partial<IWorkflowNode> = {
      nodeId,
    };
    let agentInfo = gaevatarListMap.get(nodeId);

    if (!agentInfo || agentInfo.id === nodeId) {
      agentInfo = nodeList.find((item) => item.id === nodeId)?.data?.agentInfo;
    }

    if (agentInfo?.id !== nodeId) _workflowNode.agentId = agentInfo.id;

    _workflowNode = {
      ..._workflowNode,
      name: agentInfo?.name,
      agentType: agentInfo?.agentType,
      properties: agentInfo?.properties ?? {},
      extendedData: {
        xPosition: String(item.extendedData.xPosition),
        yPosition: String(item.extendedData.yPosition),
      },
    };

    const _workflowNodeUnit: IWorkflowNodeUnit = {
      nodeId,
    };

    if (item.nextGrainId) _workflowNodeUnit.nextNodeId = item.nextGrainId;
    if ("publisherGrainId" in _workflowNode.properties) {
      // biome-ignore lint/performance/noDelete: <explanation>
      delete _workflowNode.properties.publisherGrainId;
    }
    if ("correlationId" in _workflowNode.properties) {
      // biome-ignore lint/performance/noDelete: <explanation>
      delete _workflowNode.properties.correlationId;
    }
    workflowNodeMap.set(nodeId, _workflowNode as IWorkflowNode);
    if (_workflowNodeUnit.nextNodeId && _workflowNodeUnit.nodeId)
      workflowNodeUnitList.push(_workflowNodeUnit);
  });
  return {
    workflowNodeList: Array.from(workflowNodeMap.values()),
    workflowNodeUnitList,
  };
};
