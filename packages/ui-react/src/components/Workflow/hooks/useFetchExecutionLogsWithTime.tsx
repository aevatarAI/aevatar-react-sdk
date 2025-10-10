import { aevatarAI } from "../../../utils";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { IS_NULL_ID } from "../../../constants";
import type { IFetchExecutionLogsResponse } from "@aevatar-react-sdk/services";

const fetchExecutionLogsWithTime = async ({
  workflowId,
  pageIndex,
  pageSize,
}: {
  workflowId: string;
  pageIndex: number;
  pageSize: number;
}): Promise<IFetchExecutionLogsResponse[]> => {
  const results: IFetchExecutionLogsResponse[] = [];
  if (!workflowId || workflowId === IS_NULL_ID) return results;
  try {
    const response = await aevatarAI.services.workflow.fetchExecutionLogs({
      stateName: "WorkflowExecutionRecordState",
      queryString: `workflowId:${workflowId} AND startTime:[now-30d/d TO now]`,
      pageIndex,
      pageSize,
      sortFields: "roundId:Desc",
    });

    console.log(response, "response==fetchExecutionLogsWithTime");
    return response.items;
  } catch (e) {
    console.error(e);
    return results;
  }
};

export const useFetchExecutionLogsWithTime = ({
  workflowId,
  pageIndex,
  pageSize,
}: {
  workflowId: string;
  pageIndex: number;
  pageSize: number;
}) => {
  const [hasRefetched, setHasRefetched] = useState(false);
  return useQuery({
    queryKey: ["executionLogsByTime", { workflowId }],
    queryFn: () => {
      return fetchExecutionLogsWithTime({ workflowId, pageIndex, pageSize });
    },
    refetchInterval: () => {
      // Only refetch once after 10 seconds
      if (!hasRefetched) {
        setHasRefetched(true);
        return 5000;
      }
      return false; // Disable further refetching
    },
    enabled: !!workflowId,
  });
};
