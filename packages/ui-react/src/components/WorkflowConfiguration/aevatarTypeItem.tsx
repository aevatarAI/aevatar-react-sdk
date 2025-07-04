import "./index.css";
import clsx from "clsx";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useCallback } from "react";
import { useToast } from "../../hooks/use-toast";
import NewAevatarItemIcon from "../../assets/svg/new-aevatarItem.svg?react";
import NewAevatarItemHoverIcon from "../../assets/svg/new-aevatarItem-hover.svg?react";

interface IAevatarTypeItemProps {
  agentType?: string;
  description?: string;
  className?: string;
  onDragStart?: (event: React.DragEvent<HTMLDivElement>) => void;
  draggable?: boolean;
}
export default function AevatarTypeItem(props: IAevatarTypeItemProps) {
  const { agentType, description, onDragStart, draggable, className } = props;
  const { toast } = useToast();
  const onAevatarItemClick = useCallback(() => {
    toast({
      description:
        "drag and drop g-agents onto the canvas to build your workflow",
    });
  }, [toast]);

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
          <div
            className={clsx(
              "sdk:relative sdk:min-w-[124px] sdk:max-w-[124px] sdk:h-[45px] sdk:cursor-grab sdk:active:cursor-grabbing sdk:group",
              className
            )}
            onDragStart={onDragStart}
            onClick={onAevatarItemClick}
            draggable={draggable}>
            <NewAevatarItemIcon
              className={clsx("sdk:absolute sdk:group-hover:hidden")}
            />
            <NewAevatarItemHoverIcon
              className={clsx("sdk:absolute sdk:group-hover:block sdk:hidden")}
            />
            <div className=" sdk:text-center sdk:px-[16px] sdk:py-[16px] sdk:relative sdk:flex sdk:flex-col ">
              <div className="sdk:text-[11px] sdk:font-pro sdk:text-[#B9B9B9] sdk:text-center sdk:w-full sdk:truncate">
                {agentType?.split(".")?.pop() || ""}
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent
          className={clsx(
            "sdk:z-1000 sdk:max-w-[200px] sdk:text-[10px] sdk:font-pro sdk:text-[#B9B9B9] sdk:bg-[#141415] sdk:p-[4px]",
            "sdk:whitespace-pre-wrap sdk:break-words sdk:text-left"
          )}
          align="end"
          alignOffset={-10}
          sideOffset={-20}
          side="right">
          {description ?? ""}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
