import type {
  IAgentInfoDetail,
  IWorkflowNode,
  IWorkflowNodeUnit,
  IWorkflowUnitListItem,
} from "@aevatar-react-sdk/services";

export const getWorkflowViewDataByUnit = (
  gaevatarList: IAgentInfoDetail[],
  workUnitRelations: IWorkflowUnitListItem[]
) => {
  console.log(workUnitRelations, "workUnitRelations===");
  const gaevatarListMap = new Map<string, IAgentInfoDetail>();
  gaevatarList.forEach((item) => {
    gaevatarListMap.set(item.businessAgentGrainId, item);
  });
  const workflowNodeMap = new Map<string, IWorkflowNode>();
  const workflowNodeUnitList: IWorkflowNodeUnit[] = [];
  workUnitRelations.forEach((item) => {
    const grainId = item.grainId;
    const agentInfo = gaevatarListMap.get(grainId);
    const _workflowNode = {
      nodeId: grainId,
      name: agentInfo?.name,
      agentType: agentInfo?.agentType,
      properties: agentInfo?.properties,
      extendedData: {
        xPosition: String(item.extendedData.xPosition),
        yPosition: String(item.extendedData.yPosition),
      },
    };
    const _workflowNodeUnit = {
      nodeId: grainId,
      nextNodeId: item.nextGrainId || "",
    };
    workflowNodeMap.set(grainId, _workflowNode);
    workflowNodeUnitList.push(_workflowNodeUnit);
  });
  return {
    workflowNodeList: Array.from(workflowNodeMap.values()),
    workflowNodeUnitList,
  };
};
