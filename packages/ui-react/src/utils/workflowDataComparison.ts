import type { IWorkflowViewDataParams } from "@aevatar-react-sdk/services";

/**
 * Compare workflow data precisely by checking key fields
 * @param viewData Current workflow view data
 * @param preViewData Previous workflow view data
 * @returns true if the key data is equal, false otherwise
 */
export const isWorkflowDataEqual = (
  viewData: IWorkflowViewDataParams,
  preViewData: IWorkflowViewDataParams | null | undefined
): boolean => {
  // Handle case when preViewData is empty or null
  const isPreViewDataEmpty =
    !preViewData ||
    (!preViewData.properties && !preViewData.name) ||
    Object.keys(preViewData).length === 0;

  if (isPreViewDataEmpty) {
    // Check if viewData is also empty (no nodes and units)
    const viewNodeList = viewData.properties?.workflowNodeList || [];
    const viewUnitList = viewData.properties?.workflowNodeUnitList || [];
    return viewNodeList.length === 0 && viewUnitList.length === 0;
  }

  // Compare name
  if (viewData.name !== preViewData.name) {
    return false;
  }

  // Compare workflowNodeList
  const viewNodeList = viewData.properties?.workflowNodeList || [];
  const preNodeList = preViewData.properties?.workflowNodeList || [];

  if (viewNodeList.length !== preNodeList.length) {
    return false;
  }

  for (let i = 0; i < viewNodeList.length; i++) {
    const viewNode = viewNodeList[i];
    const preNode = preNodeList[i];

    if (
      viewNode.nodeId !== preNode.nodeId ||
      viewNode.name !== preNode.name ||
      viewNode.agentType !== preNode.agentType ||
      JSON.stringify(viewNode.extendedData) !==
        JSON.stringify(preNode.extendedData) ||
      viewNode.jsonProperties !== preNode.jsonProperties
    ) {
      return false;
    }
  }

  // Compare workflowNodeUnitList
  const viewUnitList = viewData.properties?.workflowNodeUnitList || [];
  const preUnitList = preViewData.properties?.workflowNodeUnitList || [];

  if (viewUnitList.length !== preUnitList.length) {
    return false;
  }

  for (let i = 0; i < viewUnitList.length; i++) {
    if (JSON.stringify(viewUnitList[i]) !== JSON.stringify(preUnitList[i])) {
      return false;
    }
  }

  return true;
};
