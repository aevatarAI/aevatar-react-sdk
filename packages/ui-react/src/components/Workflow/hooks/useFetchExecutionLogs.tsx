import { useCallback, useEffect, useState } from "react";
import { aevatarAI } from "../../../utils";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";

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
const fetchExecutionLogs = async (
  stateName: string,
  workflowId: string,
  roundId: number
) => {
  const results = [];

  try {
    const response = await aevatarAI.services.workflow.fetchExecutionLogs({
      stateName,
      workflowId,
      roundId,
    });

    console.log({ response });

    if (!response?.items || response.items.length === 0) {
      return results;
    }

    const records = response?.items?.flatMap((d: any) =>
      JSON.parse(d?.workUnitRecords)
    );
    const agentStates = response?.items?.flatMap((d: any) =>
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

      const agentName = agentDetailsData?.[i]?.items?.[0]?.name || "-";

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

    return results.reverse();
  } catch (e) {
    console.error(e);
    return results;
  }
};

interface IFetchExecutionLogsProps {
  stateName: string;
  workflowId: string;
  roundId: number;
}

export const useFetchExecutionLogs = ({
  stateName,
  workflowId,
  roundId,
}: IFetchExecutionLogsProps) => {
  console.log({ stateName, workflowId, roundId });
  return useQuery({
    queryKey: ["executionLogs", { stateName, workflowId, roundId }],
    queryFn: () => {
      return fetchExecutionLogs(stateName, workflowId, roundId);
    },
  });
};

// export const useFetchExecutionLogs = ({
//   stateName,
//   workflowId,
//   roundId,
// }: IFetchExecutionLogsProps) => {
//   const [isLoading, setIsLoading] = useState(false);
//   const [data, setData] = useState([]);
//   const [error, setError] = useState("");
//   const [trigger, setTrigger] = useState(0);

//   const refetch = useCallback(() => {
//     console.log({ trigger });
//     setTrigger((prev) => prev + 1);
//   }, [trigger]);

//   const fetchData = useCallback(async () => {
//     try {
//       setIsLoading(true);
//       setError("");

//       const response = await aevatarAI.services.workflow.fetchExecutionLogs({
//         stateName,
//         workflowId,
//         roundId,
//       });

//       if (response?.items.length > 0) {
//         const results = [];
//         const records = response?.items?.flatMap((d: any) =>
//           JSON.parse(d?.workUnitRecords)
//         );
//         const agentStates = response?.items?.flatMap((d: any) =>
//           JSON.parse(d?.workUnitInfos)
//         );

//         const promises = agentStates?.map((agentState) => {
//           return aevatarAI.services.workflow.fetchAgentDetails({
//             formattedBusinessAgentGrainId: agentState.grainId,
//             stateName: "creatorGagentstate",
//           });
//         });

//         const agentDetailsData = await Promise.all(promises);

//         for (let i = 0; i < records.length; i++) {
//           const record = records?.[i];
//           const agentState = agentStates?.[i];

//           const inputData = JSON.parse(record.inputData);
//           const outputData = JSON.parse(record.outputData);
//           const executionTime = dayjs(record.endTime).diff(
//             dayjs(record.startTime)
//           );

//           const agentName = agentDetailsData?.[i]?.items?.[0]?.name || "-";

//           const result = {
//             agentName,
//             status: transformStatus(record.status),
//             inputData,
//             outputData,
//             executionTime,
//             agentState,
//           };
//           results.push(result);
//         }
//         setData(results.reverse());
//       }
//     } catch (e) {
//       console.error(e);
//       setError("There was an error fetching data");
//     } finally {
//       setIsLoading(false);
//     }
//   }, [stateName, workflowId, roundId]);

//   useEffect(() => {
//     console.log({ trigger });
//     fetchData();
//   }, [fetchData, trigger]);

//   return { isLoading, data, error, refetch };
// };
