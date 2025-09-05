import { aevatarAI } from "../../../utils";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useState } from "react";
import { IS_NULL_ID } from "../../../constants";
import type {
  ExecutionLogItem,
  ExecutionLogStatus,
  FetchExecutionLogsParams,
  FetchExecutionLogsResponse,
  AgentState,
} from "@aevatar-react-sdk/types";

const transformStatus = (status: number): ExecutionLogStatus => {
  switch (status) {
    case 0:
      return "pending";
    case 1:
      return "running";
    case 2:
      return "success";
    case 3:
      return "failed";
    default:
      return "failed";
  }
};

export const useGetAgentDetails = (agentId: string) => {
  return useQuery({
    queryKey: ["agentDetails", { agentId }],
    queryFn: () => {
      return aevatarAI.services.workflow.fetchAgentDetails({
        formattedBusinessAgentGrainId: agentId,
        stateName: "creatorGagentstate",
      });
    },
    enabled: !!agentId,
  });
};

const fetchExecutionLogs = async (
  stateName: string,
  workflowId: string,
  roundId: number
): Promise<FetchExecutionLogsResponse> => {
  const results: ExecutionLogItem[] = [];
  if (!workflowId || workflowId === IS_NULL_ID) return results;
  try {
    const response = await aevatarAI.services.workflow.fetchExecutionLogs({
      stateName,
      workflowId,
      roundId,
    });

    if (!response?.items || response.items.length === 0) {
      return results;
    }

    const records = response?.items?.flatMap((d: any) =>
      JSON.parse(d?.workUnitRecords)
    );
    const agentStates: AgentState[] = response?.items?.flatMap((d: any) =>
      JSON.parse(d?.workUnitInfos)
    );

    const promises = agentStates?.map((agentState) => {
      return aevatarAI.services.workflow.fetchAgentDetails({
        formattedBusinessAgentGrainId: agentState.grainId,
        stateName: "creatorGagentstate",
      });
    });

    const agentDetailsData = await Promise.all(promises);

    for (let i = 0; i < records.length; i++) {
      const record = records?.[i];
      const agentState = agentStates?.[i];

      const inputData = JSON.parse(record.inputData);
      const outputData = JSON.parse(record.outputData);
      const executionTime = dayjs(record.endTime).diff(dayjs(record.startTime));
      const failureSummary = record?.failureSummary;
      const agentName = agentDetailsData?.[i]?.items?.[0]?.name || "-";
      const agentId = agentDetailsData?.[i]?.items?.[0]?.id;
      const result: ExecutionLogItem = {
        agentName,
        status: transformStatus(record.status),
        inputData,
        outputData,
        executionTime,
        agentState,
        failureSummary,
        id: agentId,
      };
      results.push(result);
    }

    return results.reverse();
  } catch (e) {
    console.error(e);
    return results;
  }
};

interface IFetchExecutionLogsProps extends FetchExecutionLogsParams {}

export const useFetchExecutionLogs = ({
  stateName,
  workflowId,
  roundId,
}: IFetchExecutionLogsProps) => {
  const [hasRefetched, setHasRefetched] = useState(false);
  return useQuery({
    queryKey: ["executionLogs", { stateName, workflowId, roundId }],
    queryFn: () => {
      return fetchExecutionLogs(stateName, workflowId, roundId);
    },
    refetchInterval: () => {
      // Only refetch once after 10 seconds
      if (!hasRefetched) {
        setHasRefetched(true);
        return 5000;
      }
      return false; // Disable further refetching
    },
  });
};
