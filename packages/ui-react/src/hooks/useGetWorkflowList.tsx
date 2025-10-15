import { aevatarAI } from "../utils";
import { useEffect, useState } from "react";

interface IGetWorkflowListProps {
  name?: string;
  status?: string;
  pageIndex?: number;
  pageSize?: number;
  agentType?: string;
}

export const useGetWorkflowList = ({
  name,
  status,
  pageIndex = 0,
  pageSize = 100,
  agentType = "Aevatar.GAgents.GroupChat.WorkflowCoordinator.WorkflowCoordinatorGAgent",
}: IGetWorkflowListProps) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        setIsLoading(true);
        const response = await aevatarAI.services.agent.getAgents({
          name,
          status,
          pageIndex,
          pageSize,
          agentType,
        });

        if (response) {
          setData(response);
        }
      } catch (_) {
        setError("There was an error fetching...");
      } finally {
        setIsLoading(false);
      }
    };

    fetch();
  }, [name, status, pageIndex, pageSize, agentType]);

  return { data, isLoading, error };
};
