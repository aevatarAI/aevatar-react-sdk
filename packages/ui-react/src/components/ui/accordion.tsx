"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

const Accordion: React.ElementType = AccordionPrimitive.Root;
const AccordionPrimitiveItem: React.ElementType = AccordionPrimitive.Item;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitiveItem
    ref={ref}
    className={cn("sdk:bg-[var(--sdk-bg-accent)] sdk:p-[8px]", className)}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

const AccordionPrimitiveHeader: React.ElementType = AccordionPrimitive.Header;
const AccordionPrimitiveTrigger: React.ElementType = AccordionPrimitive.Trigger;
const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitiveTrigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> &
    React.HTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitiveHeader className="flex">
    <AccordionPrimitiveTrigger
      ref={ref}
      className={cn(
        "sdk:flex sdk:flex-1 sdk:items-center sdk:justify-between sdk:font-medium sdk:transition-all sdk:[&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}>
      {children}
      <ChevronDown className="sdk:h-4 sdk:w-4 sdk:shrink-0 sdk:transition-transform sdk:duration-200" />
    </AccordionPrimitiveTrigger>
  </AccordionPrimitiveHeader>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionPrimitiveContent: React.ElementType = AccordionPrimitive.Content;
const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitiveContent>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitiveContent>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitiveContent
    ref={ref}
    className="sdk:overflow-hidden sdk:text-sm sdk:transition-all sdk:pt-[8px] sdk:[data-state=closed]:animate-accordion-up [data-state=open]:animate-accordion-down"
    {...props}>
    <div className={cn("sdk:pb-4 sdk:pt-0", className)}>{children}</div>
  </AccordionPrimitiveContent>
));

AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
