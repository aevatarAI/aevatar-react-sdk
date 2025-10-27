import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { aevatarAI } from "../utils";
import type {
  IGetWorkflowLogsProps,
  IGetWorkflowLogsItem,
  IGetWorkflowLogsLevel,
} from "@aevatar-react-sdk/services";

interface UseGetWorkflowLogsParams {
  workflowId: string;
  searchValue?: string;
  selectedLogLevel?: string;
  selectedRoundId?: string;
  selectedAgentGrainId?: string;
}

interface UseGetWorkflowLogsReturn {
  data: IGetWorkflowLogsItem[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  stop: () => void;
}

export const useGetWorkflowLogs = ({
  workflowId,
  searchValue = "",
  selectedLogLevel = "all",
  selectedRoundId = "",
  selectedAgentGrainId = "all",
}: UseGetWorkflowLogsParams): UseGetWorkflowLogsReturn => {
  const [data, setData] = useState<IGetWorkflowLogsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const shouldStopRef = useRef(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentIdDataRef = useRef<Record<string, IGetWorkflowLogsItem[]>>({});
  const queryKey = useMemo(
    () => `workflowLogs-${workflowId}-${selectedRoundId}`,
    [workflowId, selectedRoundId]
  );

  // Clear any existing polling interval
  const clearPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  const fetchLogs = useCallback(
    async (count = 0): Promise<void> => {
      if (!workflowId) {
        setError("WorkflowId is required");
        return;
      }
      setData([]);
      currentIdDataRef.current[queryKey] = [];
      shouldStopRef.current = false; // Reset stop flag for new query
      try {
        setError(null);
        const allLogs: IGetWorkflowLogsItem[] = [];
        let pageIndex = 0;
        const pageSize = 100;
        let hasMoreData = true;

        while (hasMoreData && !shouldStopRef.current) {
          // Build parameters, filtering out "all" values
          const params: IGetWorkflowLogsProps = {
            workflowId,
            pageIndex,
            pageSize,
          };

          // Only add parameters if they are not "all" or empty
          if (selectedLogLevel && selectedLogLevel !== "all") {
            params.level = selectedLogLevel as IGetWorkflowLogsLevel;
          }

          if (selectedRoundId) {
            params.roundId = Number.parseInt(selectedRoundId, 10);
          }

          if (selectedAgentGrainId && selectedAgentGrainId !== "all") {
            params.grainIdString = selectedAgentGrainId;
          }

          if (searchValue?.trim()) {
            params.messagePattern = searchValue.trim();
          }

          // Check stop condition before making the request
          if (shouldStopRef.current) {
            break;
          }

          const response: IGetWorkflowLogsItem[] =
            await aevatarAI.services.workflow.getWorkflowLogs(params);

          // Check stop condition after the request
          if (shouldStopRef.current) {
            break;
          }

          if (response) {
            allLogs.push(...response);

            // After first page, immediately update data and set loading to false
            if (pageIndex === 0) {
              setData([...allLogs]);
              currentIdDataRef.current[queryKey] = [...allLogs];
              if (response.length === 0 && !shouldStopRef.current) {
                if (count > 10) {
                  clearPolling();
                } else {
                  startPolling(count);
                }
              } else {
                clearPolling();
              }
            } else {
              clearPolling();
              // Update data for subsequent pages
              setData([...allLogs]);
              currentIdDataRef.current[queryKey] = [...allLogs];
            }

            // Check if there are more pages - if we got less than pageSize, we're done
            hasMoreData = response.length === pageSize;
            pageIndex++;
          } else {
            hasMoreData = false;
          }
        }

        // Data is already updated in the loop above
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch workflow logs";
        setError(errorMessage);
      } finally {
        // Ensure loading is set to false at the end
        setIsLoading(false);
      }
    },
    [
      workflowId,
      searchValue,
      selectedLogLevel,
      selectedRoundId,
      selectedAgentGrainId,
      clearPolling,
      queryKey,
    ]
  );

  // Auto-fetch when parameters change
  useEffect(() => {
    if (workflowId && selectedRoundId !== "") {
      shouldStopRef.current = true; // Stop any ongoing query
      clearPolling(); // Clear any existing polling
      setIsLoading(true);
      fetchLogs();
    }
  }, [workflowId, selectedRoundId, fetchLogs, clearPolling]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      clearPolling();
    };
  }, [clearPolling]);

  // Polling effect: poll every 3s when data is empty
  const startPolling = useCallback(
    (count = 0) => {
      // Clear any existing polling first
      clearPolling();

      // Start polling if data is empty and not loading
      if (
        workflowId &&
        currentIdDataRef.current[queryKey].length === 0 &&
        !isLoading &&
        !shouldStopRef.current &&
        selectedLogLevel === "all" &&
        selectedAgentGrainId === "all" &&
        searchValue === ""
      ) {
        pollingIntervalRef.current = setInterval(async () => {
          if (shouldStopRef.current) {
            clearPolling();
            return;
          }

          if (currentIdDataRef.current[queryKey].length > 0 || isLoading) {
            clearPolling();
            return;
          }
          const newCount = count + 1;
          await fetchLogs(newCount);
        }, 3000);
      }
    },
    [
      workflowId,
      isLoading,
      fetchLogs,
      selectedLogLevel,
      selectedAgentGrainId,
      searchValue,
      queryKey,
      clearPolling,
    ]
  );

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await fetchLogs();
  }, [fetchLogs]);

  const stop = useCallback(() => {
    shouldStopRef.current = true;
    clearPolling();
  }, [clearPolling]);

  return {
    data,
    isLoading,
    error,
    refresh,
    stop,
  };
};
