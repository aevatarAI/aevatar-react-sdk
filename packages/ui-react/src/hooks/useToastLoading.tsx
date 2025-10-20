import Loading from "../assets/svg/loading.svg?react";
import clsx from "clsx";
import { useCallback } from "react";
import { useToast } from "./use-toast";

export const useToastLoading = () => {
  const { toast } = useToast();
  return useCallback(
    (message = "loading...") => {
      return toast({
        description: (
          <div className="flex gap-[8px]">
            <Loading
              className={clsx("aevatarai-loading-icon")}
              style={{ width: 14, height: 14 }}
            />
            <div className="text-[var(--color-foreground)] font-geist text-[13px] font-normal leading-normal">
              {message}
            </div>
          </div>
        ),
        duration: 0,
      });
    },
    [toast]
  );
};
