import type React from "react";
import { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "../ui";
import clsx from "clsx";
import More from "../../assets/svg/more.svg?react";
import { EllipsisVertical } from "lucide-react";

export default function WorkflowMenu({
  onDuplicate,
}: {
  onDuplicate?: (e: React.MouseEvent<HTMLDivElement>) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild={true}>
          <div
            className={clsx(
              "sdk:bg-[var(--sdk-bg-accent)] sdk:rounded-[4px]",
              isOpen && "sdk:block!"
            )}>
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
            <div
              className={clsx(
                "sdk:bg-[var(--sdk-bg-accent)] sdk:rounded-[2px] sdk:p-[8px] sdk:flex sdk:items-center sdk:justify-center",
                isOpen && "sdk:bg-[var(--sdk-bg-accent)]"
              )}
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}>
              <EllipsisVertical className="sdk:w-[14px] sdk:h-[14px]" />
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent
          asChild
          className="sdk:p-0 sdk:w-[200px] sdk:bg-[var(--sdk-color-bg-primary)] sdk:p-[9px_8px_9px_10px]!"
          align="end"
          side="bottom"
          sideOffset={0}>
          <div>
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(e);
              }}
              className={clsx(
                "sdk:cursor-pointer sdk:text-center sdk:text-[14px] sdk:font-geist sdk:font-light sdk:text-[var(--sdk-color-text-primary)] sdk:hover:text-[var(--sdk-color-text-primary)] sdk:p-[10px]",
                "sdk:hover:bg-[var(--sdk-bg-accent)]",
                "select-item-wrapper"
              )}>
              duplicate
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
