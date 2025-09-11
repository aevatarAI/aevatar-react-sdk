import clsx from "clsx";
import Hypotenuse from "../../assets/svg/hypotenuse.svg?react";

interface IAevatarTypeItemVisualProps {
  agentType?: string;
  disabled?: boolean;
  onClick?: () => void;
  dragRef?: React.Ref<HTMLDivElement>;
  previewRef?: React.Ref<HTMLDivElement>;
  className?: string;
}

export default function AevatarTypeItemVisual({
  agentType,
  disabled = false,
  onClick,
  dragRef,
  previewRef,
  className,
}: IAevatarTypeItemVisualProps) {
  return (
    <div>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
      <div
        ref={dragRef}
        data-testid="aevatar-type-item-root"
        className={clsx(
          "sdk:relative sdk:min-w-[124px] sdk:max-w-[124px] sdk:h-[45px] ",
          "sdk:cursor-grab sdk:active:cursor-grabbing sdk:group sdk:no-user-select",
          "sdk:border-0 sdk:bg-transparent sdk:p-0", // Reset button styles
          disabled && "sdk:cursor-not-allowed",
          className
        )}
        onClick={onClick}
        aria-label={`Agent type: ${agentType?.split(".")?.pop() || ""}`}>
        <div className="sdk:absolute sdk:w-[124px] sdk:left-0 sdk:top-0">
          <div
            className={clsx(
              "sdk:h-[14px] sdk:relative sdk:flex sidebar-item-bg-img ",
              disabled && "sdk:sidebar-item-bg-img-disabled"
            )}>
            <Hypotenuse
              className={clsx(
                "sdk:w-[17px] sdk:h-[14px] sdk:text-[var(--sdk-color-sidebar-border)]  sdk:rotate-180"
                // disabled && "sdk:text-[var(--sdk-border-foreground)]!"
              )}
            />
            <div
              className={clsx(
                " sdk:bg-[var(--sdk-bg-muted)] sdk:flex-1 ",
                "sdk:border-t sdk:border-r  sdk:border-[var(--sdk-color-sidebar-border)]"
                // disabled && "sdk:border-[var(--sdk-border-foreground)]!"
              )}
            />
          </div>
          <div
            className={clsx(
              "sdk:h-[31px] sdk:bg-[var(--sdk-bg-muted)] ",
              "sdk:border-l sdk:border-b sdk:border-r sdk:border-[var(--sdk-color-sidebar-border)]"
            )}
          />
        </div>
        <div className=" sdk:text-center sdk:px-[16px] sdk:py-[12px] sdk:relative sdk:flex sdk:flex-col ">
          <div
            className={clsx(
              "sdk:text-[11px] sdk:font-outfit sdk:text-[var(--sdk-muted-foreground)] sdk:text-center sdk:w-full sdk:truncate",
              disabled &&
                "sdk:text-[var(--sdk-muted-foreground)] sdk:opacity-50"
            )}>
            {agentType?.split(".")?.pop() || ""}
          </div>
        </div>
      </div>
    </div>
  );
}
