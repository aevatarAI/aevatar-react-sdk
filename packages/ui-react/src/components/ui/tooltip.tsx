"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as React from "react";
import { cn } from "../../lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger: React.ElementType = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "sdk:z-50 sdk:overflow-hidden  sdk:bg-[var(--sdk-color-bg-primary)] sdk:p-[4px] sdk:text-[var(--sdk-muted-foreground)] sdk:font-outfit sdk:text-[12px] sdk:font-normal sdk:leading-normal sdk:lowercase sdk:text-popover-foreground sdk:shadow-md sdk:animate-in sdk:fade-in-0 sdk:zoom-in-95 data-[state=closed]:sdk:animate-out data-[state=closed]:sdk:fade-out-0 data-[state=closed]:sdk:zoom-out-95 data-[side=bottom]:sdk:slide-in-from-top-2 data-[side=left]:sdk:slide-in-from-right-2 data-[side=right]:sdk:slide-in-from-left-2 data-[side=top]:sdk:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
