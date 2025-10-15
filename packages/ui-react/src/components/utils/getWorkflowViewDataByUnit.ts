import type {
  IAgentInfoDetail,
  IWorkflowNode,
  IWorkflowNodeUnit,
  IWorkflowUnitListItem,
} from "@aevatar-react-sdk/services";
import type { INode } from "../Workflow/types";
import { getPropertiesByDefaultValues } from "../../utils/jsonSchemaParse";

export const getWorkflowViewDataByUnit = (
  gaevatarList: IAgentInfoDetail[],
  workUnitRelations: IWorkflowUnitListItem[],
  nodeList: INode[]
) => {
  const gaevatarListMap = new Map<string, IAgentInfoDetail>();
  gaevatarList?.forEach((item) => {
    gaevatarListMap.set(item.id, item);
  });
  const workflowNodeMap = new Map<string, IWorkflowNode>();
  const workflowNodeUnitList: IWorkflowNodeUnit[] = [];
  workUnitRelations?.forEach((item) => {
    const nodeId = item.grainId;
    let _workflowNode: Partial<IWorkflowNode> = {
      nodeId,
    };
    let agentInfo = gaevatarListMap.get(nodeId);
    let defaultValues = agentInfo?.properties;
    if (!agentInfo || agentInfo.id === nodeId) {
      // defaultValues = (agentInfo as any)?.defaultValues ?? {};
      agentInfo = nodeList?.find((item) => item.id === nodeId)?.data?.agentInfo;
      defaultValues = agentInfo?.properties ?? {};
      if (Object.keys(defaultValues).length === 0) {
        defaultValues = getPropertiesByDefaultValues(
          (agentInfo as any)?.defaultValues
        );
      }
    }

    if (agentInfo?.id !== nodeId) _workflowNode.agentId = agentInfo?.id;

    let properties = agentInfo?.properties ?? {};
    if (Object.keys(properties).length === 0) {
      properties = defaultValues;
    }
    if ("publisherGrainId" in properties) {
      // biome-ignore lint/performance/noDelete: <explanation>
      delete properties.publisherGrainId;
    }
    if ("correlationId" in properties) {
      // biome-ignore lint/performance/noDelete: <explanation>
      delete properties.correlationId;
    }
    _workflowNode = {
      ..._workflowNode,
      name: agentInfo?.name,
      agentType: agentInfo?.agentType,
      jsonProperties: JSON.stringify(properties),
      extendedData: {
        xPosition: String(item.extendedData.xPosition),
        yPosition: String(item.extendedData.yPosition),
      },
    };

    const _workflowNodeUnit: IWorkflowNodeUnit = {
      nodeId,
    };

    if (item.nextGrainId) _workflowNodeUnit.nextNodeId = item.nextGrainId;

    workflowNodeMap.set(nodeId, _workflowNode as IWorkflowNode);
    if (_workflowNodeUnit.nextNodeId && _workflowNodeUnit.nodeId)
      workflowNodeUnitList.push(_workflowNodeUnit);
  });
  return {
    workflowNodeList: Array.from(workflowNodeMap.values()),
    workflowNodeUnitList,
  };
};
