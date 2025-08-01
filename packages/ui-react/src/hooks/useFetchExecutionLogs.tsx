import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { aevatarAI } from "../utils";

const transformStatus = (status: number) => {
  switch (status) {
    case 0:
      return "pending";
    case 1:
      return "running";
    case 2:
      return "success";
    default:
      return "failed";
  }
};

interface FetchExecutionLogsProps {
  stateName: string;
  workflowId: string;
  roundId: number;
}

export const useFetchExecutionLogs = ({
  stateName,
  workflowId,
  roundId,
}: FetchExecutionLogsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchExecutionLogs = async () => {
      try {
        setIsLoading(true);

        const response = await aevatarAI.services.workflow.fetchExecutionLogs({
          stateName,
          workflowId,
          roundId,
        });

        const data = await response.json();

        if (data.code === "20000") {
          const results = [];
          const records = data?.data?.items?.flatMap((d: any) =>
            JSON.parse(d?.workUnitRecords)
          );

          const agentStates = data?.data?.items?.flatMap((d: any) =>
            JSON.parse(d?.workUnitInfos)
          );

          for (let i = 0; i < records.length; i++) {
            const record = records?.[i];
            const agentState = agentStates?.[i];

            const inputData = JSON.parse(record.inputData);
            const outputData = JSON.parse(record.outputData);
            const executionTime = dayjs(record.endTime).diff(
              dayjs(record.startTime)
            );

            const agentName =
              inputData?.find((d: any) => d?.AgentName)?.AgentName || "unknown";

            const result = {
              agentName,
              status: transformStatus(record.status),
              inputData,
              outputData,
              executionTime,
              agentState,
            };

            results.push(result);
          }
          setData(results);
        }
      } catch (e) {
        console.error(e);
        setError("There was an error fetching data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExecutionLogs();
  }, [stateName, workflowId, roundId]);

  return { isLoading, data, error };
};
