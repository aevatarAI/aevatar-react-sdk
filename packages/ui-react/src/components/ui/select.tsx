"use client";

import DownIcon from "../../assets/svg/down.svg?react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import React from "react";
import { cn } from "../../lib/utils";
import "./select.css";

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectPrimitiveTrigger: React.ElementType = SelectPrimitive.Trigger;
const SelectPrimitiveIcon: React.ElementType = SelectPrimitive.Icon;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> &
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <SelectPrimitiveTrigger
      ref={ref}
      className={cn(
        "sdk:flex sdk:font-outfit sdk:min-h-10 sdk:w-full sdk:items-center sdk:justify-center sdk:gap-[10px] sdk:border sdk:border-[#303030] sdk:bg-background sdk:px-3 sdk:py-2 sdk:text-sm sdk:ring-offset-background sdk:placeholder:text-muted-foreground sdk:focus:outline-none sdk:disabled:cursor-not-allowed sdk:disabled:opacity-50",
        "sdk:text-white sdk:text-center sdk:font-outfit sdk:text-xs sdk:font-semibold sdk:leading-normal sdk:lowercase",
        className
      )}
      {...props}>
      <span
        className="sdk:block sdk:w-full sdk:whitespace-normal sdk:break-all sdk:[overflow-wrap:anywhere]"
      >
        {children}
      </span>
      <SelectPrimitiveIcon
        asChild
        className={props["aria-disabled"] ? "hidden" : undefined}>
        <DownIcon />
      </SelectPrimitiveIcon>
    </SelectPrimitiveTrigger>
  );
});
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectPrimitiveScrollUpButton: React.ElementType =
  SelectPrimitive.ScrollUpButton;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton> &
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <SelectPrimitiveScrollUpButton
    ref={ref}
    className={cn(
      "sdk:flex sdk:cursor-default sdk:items-center sdk:justify-center sdk:py-1",
      className
    )}
    {...props}>
    <ChevronUp className="sdk:h-4 sdk:w-4" />
  </SelectPrimitiveScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectPrimitiveDownButton: React.ElementType =
  SelectPrimitive.ScrollDownButton;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton> &
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <SelectPrimitiveDownButton
    ref={ref}
    className={cn(
      "sdk:flex sdk:cursor-default sdk:items-center sdk:justify-center sdk:py-1",
      className
    )}
    {...props}>
    <ChevronDown className="sdk:h-4 sdk:w-4" />
  </SelectPrimitiveDownButton>
));
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName;

const SelectPrimitiveContent: React.ElementType = SelectPrimitive.Content;

const SelectPrimitiveViewport: React.ElementType = SelectPrimitive.Viewport;
const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> &
    React.HTMLAttributes<HTMLDivElement>& {
      align?: "center" | "start" | "end";
    }
>(({ className, children, position = "popper", align= 'center', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitiveContent
      ref={ref}
      className={cn(
        "sdk:relative sdk:font-outfit sdk:max-h-[248px] sdk:overflow-auto sdk:z-50  sdk:bg-[#303030] sdk:text-popover-foreground sdk:shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        "sdk:border-none sdk:w-[319px] sdk:md:w-[329px] sdk:p-[20px] sdk:md:p-[16px] sdk:md:px-[22px]",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      align={align}
      {...props}>
      {/* <SelectScrollUpButton /> */}
      <SelectPrimitiveViewport
        className={cn(
          position === "popper" && "sdk:h-[var(--radix-select-trigger-height)]"
        )}>
        {children}
      </SelectPrimitiveViewport>
      {/* <SelectScrollDownButton /> */}
    </SelectPrimitiveContent>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectPrimitiveLabel: React.ElementType = SelectPrimitive.Label;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label> &
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <SelectPrimitiveLabel
    ref={ref}
    className={cn(
      "sdk:py-1.5 sdk:pl-8 sdk:pr-2 sdk:text-sm sdk:font-semibold",
      className
    )}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectPrimitiveItem: React.ElementType = SelectPrimitive.Item;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> &
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitiveItem
    ref={ref}
    className={cn(
      "sdk:relative sdk:cursor-pointer sdk:select-none sdk:items-center sdk:text-sm sdk:outline-none sdk:focus:bg-accent sdk:focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      "sdk:text-[#B9B9B9] sdk:text-center sdk:font-outfit sdk:text-[12px] sdk:font-bold sdk:leading-normal sdk:lowercase sdk:py-[7px]",
      "select-item-wrapper",
      className
    )}
    {...props}>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitiveItem>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectPrimitiveSeparator: React.ElementType = SelectPrimitive.Separator;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator> &
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <SelectPrimitiveSeparator
    ref={ref}
    className={cn("sdk:-mx-1 sdk:my-1 sdk:h-px sdk:bg-muted", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
