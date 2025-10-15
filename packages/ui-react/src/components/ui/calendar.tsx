"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type * as React from "react";
import { DayPicker } from "react-day-picker";
import { buttonVariants } from "./button";
import { cn } from "../../lib/utils";

function Calendar({
  className,
  classNames,
  showOutsideDays = false,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 bg-[var(--sdk-color-border-primary)] min-w-[560px]", className)}
      classNames={{
        months:
          "flex flex-col sm:flex-row gap-4 font-geist font-bold justify-center",
        month: "flex flex-col gap-4",
        caption: "flex justify-center pt-1 relative items-center w-full",
        caption_label: "text-sm font-semibold lowercase font-semibold",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 border border-[var(--sdk-color-border-primary)] border-solid cursor-pointer hover:bg-[var(--sdk-color-border-primary)]"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse",
        head_row: "flex",
        head_cell:
          "text-[var(--sdk-muted-foreground)] rounded-md w-9 font-normal text-[0.8rem] lowercase",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md min-w-[36px] px-0",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "size-9 p-0 font-normal aria-selected:opacity-100 font-geist text-[14px] cursor-pointer w-full h-9 hover:bg-[var(--sdk-color-border-primary)] hover:opacity-80"
        ),
        day_range_start:
          "day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_range_end:
          "day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-[var(--sdk-muted-foreground)] aria-selected:text-[var(--sdk-muted-foreground)]",
        day_disabled: "text-[var(--sdk-muted-foreground)] opacity-50",
        day_range_middle:
          "aria-selected:bg-[var(--sdk-color-border-primary)] aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        // Use Chevron instead of IconLeft/IconRight
        Chevron: ({ orientation }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight;
          return <Icon className="size-4 text-[var(--sdk-muted-foreground)]" />;
        },
      }}
      {...props}
    />
  );
}

export { Calendar };
