import { aevatarAI } from "../utils";
import { useEffect, useState } from "react";

interface IGetWorkflowDetailsProps {
  stateName: string;
  ids: string;
  others?: string;
}

export const useGetWorkflowDetails = ({
  stateName,
  ids,
  others,
}: IGetWorkflowDetailsProps) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ids || !stateName) return;

    const fetch = async () => {
      try {
        setIsLoading(true);
        const response = await aevatarAI.services.workflow.getWorkflow({
          stateName,
          queryString: others ? `_id:${ids}${others}` : `_id:${ids}`,
        });

        if (response) {
          setData(response.items);
        }
      } catch (_) {
        setError("There was an error fetching...");
      } finally {
        setIsLoading(false);
      }
    };

    fetch();
  }, [stateName, ids, others]);

  return { data, isLoading, error };
};
