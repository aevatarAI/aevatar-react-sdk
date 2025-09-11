"use client";

import * as LabelPrimitive from "@radix-ui/react-label";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../lib/utils";

const Root: React.ElementType = LabelPrimitive.Root;

const labelVariants = cva(
          "sdk:text-[var(--sdk-muted-foreground)] sdk:text-xs sdk:font-bold sdk:font-outfit sdk:mb-[10px] sdk:block sdk:leading-none sdk:peer-disabled:cursor-not-allowed sdk:peer-disabled:opacity-70"
);

const Label: React.ElementType = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & {
    className?: string;
  } & VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <Root ref={ref} className={cn(labelVariants(), className)} {...props} />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
