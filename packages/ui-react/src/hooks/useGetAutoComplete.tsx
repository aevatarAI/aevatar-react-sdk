import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { aevatarAI } from "../utils";

export const useGetAutoComplete = (query: string, enabled = true) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 1000);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  const queryEnabled =
    enabled &&
    !!debouncedQuery &&
    debouncedQuery.length >= 15 &&
    debouncedQuery.length < 250;

  return useQuery({
    queryKey: ["autocomplete", { query: debouncedQuery }],
    queryFn: () => {
      return aevatarAI.services.workflow.fetchAutoComplete({
        userGoal: debouncedQuery,
      });
    },
    enabled: queryEnabled,
  });
};
