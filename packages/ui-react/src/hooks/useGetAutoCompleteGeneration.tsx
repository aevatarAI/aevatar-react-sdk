import { useCallback, useState } from "react";
import { aevatarAI } from "../utils";

export const useGetAutoCompleteGeneration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [error, setError] = useState("");

  const refetch = useCallback(async (userGoal: string) => {
    if (!userGoal) return;

    try {
      setIsLoading(true);
      const response = await aevatarAI.services.workflow.autocomplete({
        userGoal,
      });

      setData(response?.completions);
    } catch (_) {
      const description = "Error generating autocomplete";

      setError(description);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, data, refetch, error };
};
