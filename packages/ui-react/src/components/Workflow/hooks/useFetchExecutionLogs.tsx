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

export enum EnumExecutionLogStatus {
  Pending = 0,
  Running = 1,
  Success = 2,
  Failed = 3,
}

const transformStatus = (status: number): ExecutionLogStatus => {
  switch (status) {
    case EnumExecutionLogStatus.Pending:
      return "pending";
    case EnumExecutionLogStatus.Running:
      return "running";
    case EnumExecutionLogStatus.Success:
      return "success";
    case EnumExecutionLogStatus.Failed:
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

const fetchLatestExecutionLogs = async (
  stateName: string,
  workflowId: string
): Promise<FetchExecutionLogsResponse> => {
  const results: ExecutionLogItem[] = [];
  if (!workflowId || workflowId === IS_NULL_ID) return results;
  try {
    const response = await aevatarAI.services.workflow.fetchLatestExecutionLogs(
      {
        stateName,
        workflowId,
      }
    );

    if (!response?.items || response.items.length === 0) {
      return results;
    }

    const records = response?.items?.flatMap((d: any) =>
      JSON.parse(d?.workUnitRecords)
    );
    const agentStates: AgentState[] = response?.items?.flatMap((d: any) =>
      JSON.parse(d?.workUnitInfos)
    );

    for (let i = 0; i < records.length; i++) {
      try {
        const record = records?.[i];
        const agentState = agentStates?.[i];

        // Validate required data
        if (!record) {
          console.warn(`Record at index ${i} is null or undefined`);
          continue;
        }

        // Safely parse JSON data with fallbacks
        let inputData = {};
        let outputData = {};
        let currentStateSnapshot = {};

        const status = transformStatus(
          record.status ?? EnumExecutionLogStatus.Failed
        ); // Default to failed if no status
        try {
          inputData = record.inputData ? JSON.parse(record.inputData) : {};
        } catch (e) {
          console.warn(`Failed to parse inputData at index ${i}:`, e);
          inputData = {};
        }

        try {
          currentStateSnapshot = record.currentStateSnapshot
            ? JSON.parse(record.currentStateSnapshot)
            : {};
        } catch (e) {
          console.warn(
            `Failed to parse currentStateSnapshot at index ${i}:`,
            e
          );
          currentStateSnapshot = {};
        }

        try {
          outputData = record.outputData ? JSON.parse(record.outputData) : {};
        } catch (e) {
          console.warn(`Failed to parse outputData at index ${i}:`, e);
          outputData = {};
        }

        // Validate and calculate time values
        const startTime = record.startTime;
        const endTime =
          record.status === EnumExecutionLogStatus.Running ||
          record.status === EnumExecutionLogStatus.Pending
            ? record.endTime ?? new Date().toISOString()
            : record.endTime;

        // Calculate duration safely
        let duration = 0;
        try {
          const startDate = new Date(startTime);
          const endDate = new Date(endTime);

          if (dayjs(startTime).isValid() && dayjs(endTime).isValid()) {
            const timeDiff = endDate.getTime() - startDate.getTime();
            duration = Math.max(0, timeDiff / 1000); // Ensure non-negative duration
          }
        } catch (e) {
          console.warn(`Failed to calculate duration at index ${i}:`, e);
          duration = 0;
        }

        // Calculate execution time safely
        let executionTime = 0;
        try {
          const start = dayjs(startTime);
          const end = dayjs(endTime);
          if (start.isValid() && end.isValid()) {
            executionTime = end.diff(start);
          }
        } catch (e) {
          console.warn(`Failed to calculate executionTime at index ${i}:`, e);
          executionTime = 0;
        }

        const failureSummary = record?.failureSummary || null;

        const result: ExecutionLogItem = {
          status,
          startTime,
          endTime,
          duration,
          inputData,
          currentStateSnapshot,
          outputData,
          executionTime,
          agentState: agentState || null,
          failureSummary,
          grainId: record.workUnitGrainId || null,
        };
        results.push(result);
      } catch (e) {
        console.error(`Failed to process record at index ${i}:`, e);
      }
    }

    return results.reverse();
  } catch (e) {
    console.error(e);
    return results;
  }
};

interface IFetchExecutionLogsProps extends FetchExecutionLogsParams {}

export const useLatestExecutionLogs = ({
  stateName,
  workflowId,
}: IFetchExecutionLogsProps) => {
  const [hasRefetched, setHasRefetched] = useState(false);
  return useQuery({
    queryKey: ["executionLogs", { stateName, workflowId }],
    queryFn: () => {
      return fetchLatestExecutionLogs(stateName, workflowId);
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
