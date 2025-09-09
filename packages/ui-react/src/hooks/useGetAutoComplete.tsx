import { useQuery } from "@tanstack/react-query";
import { aevatarAI } from "../utils";

export const useGetAutoComplete = (query: string) => {
  return useQuery({
    queryKey: ["autocomplete", { query }],
    queryFn: () => {
      return aevatarAI.services.workflow.fetchAutoComplete({
        userGoal: "generate workflow",
      });
    },
    enabled: !!query,
  });
};
