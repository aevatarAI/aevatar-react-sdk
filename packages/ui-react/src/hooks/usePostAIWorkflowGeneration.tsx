import { useCallback, useState } from "react";
import { useToast } from "./use-toast";
import { aevatarAI } from "../utils";

export const usePostAIWorkflowGeneration = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState();
  const [error, setError] = useState("");

  const refetch = useCallback(
    async (userGoal: string) => {
      if (!userGoal) return;

      try {
        setIsLoading(true);
        const response = await aevatarAI.services.workflow.generate({
          userGoal,
        });

        const results = await response.json();

        setData(results);
      } catch (_) {
        const description = "Error generating workflow";
        toast({ description });
        setError(description);
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  return { isLoading, data, refetch, error };
};
