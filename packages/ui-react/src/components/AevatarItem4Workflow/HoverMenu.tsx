import type React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui";
import clsx from "clsx";
import More from "../../assets/svg/more.svg?react";
import { useState } from "react";

export default function HoverMenu({
  triggerClassName,
  onDelete,
}: {
  triggerClassName?: string;
  className?: string;
  onDelete: (e: React.MouseEvent<HTMLDivElement>) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="sdk:relative sdk:pb-[2px] sdk:pt-[26px]">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild={true}>
          <div
            className={clsx(
              "sdk:bg-[var(--sdk-bg-accent)] sdk:border sdk:border-[var(--sdk-border-foreground)] sdk:rounded-[4px] sdk:p-[2px]",
              triggerClassName,
              isOpen && "sdk:block!"
            )}>
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
            <div
              className={clsx(
                "sdk:bg-[var(--sdk-bg-accent)] sdk:rounded-[2px] sdk:p-[5px] sdk:flex sdk:items-center sdk:justify-center",
                isOpen && "sdk:bg-[var(--sdk-bg-accent)]"
              )}
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}>
              <More className="sdk:w-2.5 sdk:h-2.5" />
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
              onClick={onDelete}
              className={clsx(
                "sdk:cursor-pointer sdk:text-center sdk:text-[14px] sdk:font-outfit sdk:font-light sdk:text-[var(--sdk-color-text-primary)] sdk:hover:text-[var(--sdk-color-text-primary)] sdk:p-[10px]",
                "sdk:hover:bg-[var(--sdk-bg-accent)]",
                "select-item-wrapper"
              )}>
              delete
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
