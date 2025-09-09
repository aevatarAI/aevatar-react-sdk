import "./index.css";
import clsx from "clsx";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useCallback, useEffect, useMemo } from "react";
import { useToast } from "../../hooks/use-toast";
import NewAevatarItemIcon from "../../assets/svg/new-aevatarItem.svg?react";
import NewAevatarItemHoverIcon from "../../assets/svg/new-aevatarItem-hover.svg?react";
import AevatarItemIcon from "../../assets/svg/aevatarItem.svg?react";
import { useDrag } from "react-dnd";
import { useDnD, type IDragItem } from "../Workflow/DnDContext";
interface IAevatarTypeItemProps {
  agentType?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
  propertyJsonSchema?: string;
  onDragStart?: (event: React.DragEvent<HTMLDivElement>) => void;
  draggable?: boolean;
  defaultValues?: Record<string, any[]>;
}
export default function AevatarTypeItem(props: IAevatarTypeItemProps) {
  const {
    agentType,
    description,
    className,
    disabled,
    propertyJsonSchema,
    defaultValues,
  } = props;
  const { toast } = useToast();
  const [, setDragItem] = useDnD();
  const dragData: IDragItem = useMemo(
    () => ({
      nodeType: "new",
      agentInfo: agentType
        ? { agentType, propertyJsonSchema, defaultValues }
        : undefined,
    }),
    [agentType, propertyJsonSchema, defaultValues]
  );

  const [{ isDragging }, dragRef] = useDrag<
    IDragItem,
    unknown,
    { isDragging: boolean }
  >({
    type: "AEVATAR_TYPE_ITEM",
    item: dragData,
    canDrag: !disabled,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: () => {
      setDragItem(null);
    },
  });

  useEffect(() => {
    if (isDragging) {
      setDragItem(dragData);
    }
  }, [isDragging, dragData, setDragItem]);

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
            ref={dragRef}
            data-testid="aevatar-type-item-root"
            className={clsx(
              "sdk:relative sdk:min-w-[124px] sdk:max-w-[124px] sdk:h-[45px] sdk:cursor-grab sdk:active:cursor-grabbing sdk:group sdk:no-user-select",
              disabled && "sdk:cursor-not-allowed sdk:opacity-50",
              isDragging && "sdk:opacity-50",
              className
            )}
            onClick={onAevatarItemClick}>
            <NewAevatarItemIcon
              className={clsx(
                "sdk:absolute sdk:group-hover:hidden",
                disabled && "sdk:hidden! sdk:opacity-50"
              )}
            />
            <NewAevatarItemHoverIcon
              className={clsx(
                "sdk:absolute sdk:group-hover:block sdk:hidden",
                disabled && "sdk:hidden! sdk:opacity-50"
              )}
            />
            <AevatarItemIcon
              className={clsx(
                "sdk:absolute sdk:hidden",
                disabled && "sdk:block! sdk:opacity-50"
              )}
            />

            <div className=" sdk:text-center sdk:px-[16px] sdk:py-[16px] sdk:relative sdk:flex sdk:flex-col ">
              <div
                className={clsx(
                  "sdk:text-[11px] sdk:font-outfit sdk:text-[var(--sdk-muted-foreground)] sdk:text-center sdk:w-full sdk:truncate",
                                      disabled && "sdk:text-[var(--sdk-muted-foreground)] sdk:opacity-50"
                )}>
                {agentType?.split(".")?.pop() || ""}
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent
          className={clsx(
            "sdk:z-1000 sdk:text-[10px] sdk:font-outfit sdk:text-[var(--sdk-muted-foreground)] sdk:bg-[var(--sdk-color-bg-primary)] sdk:p-[4px]",
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
