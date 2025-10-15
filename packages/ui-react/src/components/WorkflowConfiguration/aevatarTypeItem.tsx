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
import { useDrag } from "react-dnd";
import { useDnD, type IDragItem } from "../Workflow/DnDContext";
import AevatarTypeItemVisual from "./AevatarTypeItemVisual";

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

  const [{ isDragging  }, dragRef, previewRef] = useDrag<
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
          <AevatarTypeItemVisual
            agentType={agentType}
            disabled={disabled}
            onClick={onAevatarItemClick}
            dragRef={dragRef}
            className={className}
            previewRef={previewRef}
          />
        </TooltipTrigger>
        <TooltipContent
          className={clsx(
            "sdk:z-1000 sdk:text-[10px] sdk:font-geist sdk:text-[var(--sdk-muted-foreground)] sdk:bg-[var(--sdk-color-bg-primary)] sdk:p-[4px]",
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
