import "./index.css";
import AevatarItemIcon from "../../assets/svg/aevatarItem.svg?react";
import AevatarItemHoverIcon from "../../assets/svg/aevatarItem-hover.svg?react";
import NewAevatarItemIcon from "../../assets/svg/new-aevatarItem.svg?react";
import NewAevatarItemHoverIcon from "../../assets/svg/new-aevatarItem-hover.svg?react";
import clsx from "clsx";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useCallback } from "react";
import { useToast } from "../../hooks/use-toast";

interface IProps {
  isnew?: boolean;
  agentType?: string;
  disabled?: boolean;
  name?: string;
  className?: string;
  onDragStart?: (event: React.DragEvent<HTMLDivElement>) => void;
  draggable?: boolean;
}
export default function AevatarItem(props: IProps) {
  const {
    isnew,
    agentType,
    name,
    onDragStart,
    draggable,
    disabled,
    className,
  } = props;
  const { toast } = useToast();
  const onAevatarItemClick = useCallback(() => {
    toast({
      description:
        "drag and drop g-agents onto the canvas to build your workflow",
    });
  }, [toast]);

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
    <div
      className={clsx(
        "sdk:relative sdk:w-[124px] sdk:h-[45px] sdk:cursor-grab sdk:active:cursor-grabbing sdk:group",
        disabled && "sdk:cursor-not-allowed! opacity-50",
        className
      )}
      onDragStart={onDragStart}
      onClick={onAevatarItemClick}
      draggable={disabled ? false : draggable}>
      {isnew ? (
        <>
          <NewAevatarItemIcon
            className={clsx(
              "sdk:absolute sdk:group-hover:hidden",
              disabled && "sdk:block!"
            )}
          />
          <NewAevatarItemHoverIcon
            className={clsx(
              "sdk:absolute sdk:group-hover:block sdk:hidden",
              disabled && "sdk:hidden!"
            )}
          />
          <div
            className={clsx(
              "sdk:px-[17px] sdk:pt-[16px] sdk:pb-[15px] sdk:relative sdk:flex "
            )}>
            <p
              className={clsx(
                "sdk:workflow-new-aevatar-item",
                disabled && "sdk:workflow-new-aevatar-item-disabled"
              )}>
              + new agent
            </p>
          </div>
        </>
      ) : (
        <>
          <AevatarItemIcon
            className={clsx(
              "sdk:absolute sdk:group-hover:hidden",
              disabled && "sdk:block!"
            )}
          />
          <AevatarItemHoverIcon
            className={clsx(
              "sdk:absolute sdk:group-hover:block sdk:hidden",
              disabled && "sdk:hidden!"
            )}
          />
          <div className="sdk:px-[15px] sdk:py-[7px] sdk:relative sdk:flex sdk:flex-col ">
            <TooltipProvider delayDuration={0}>
              <Tooltip open={name.length < 20 ? false : undefined}>
                <TooltipTrigger asChild>
                  <div className="sdk:workflow-aevatar-item-name sdk:truncate">
                    {name}
                  </div>
                </TooltipTrigger>
                <TooltipContent className='sdk:z-1000 sdk:max-w-[200px]' side="left">{name}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider delayDuration={0}>
              <Tooltip open={agentType.length < 20 ? false : undefined}>
                <TooltipTrigger asChild>
                  <div className="sdk:workflow-aevatar-item-id sdk:truncate">
                    {agentType}
                  </div>
                </TooltipTrigger>
                <TooltipContent className='sdk:z-1000 sdk:max-w-[200px]' side="left">{agentType}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </>
      )}
    </div>
  );
}
