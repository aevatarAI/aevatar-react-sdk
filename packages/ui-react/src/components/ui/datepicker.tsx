"use client";
import type * as React from "react";
import dayjs from "dayjs";
import { cn } from "../../lib/utils";
import Clock from "../../assets/svg/clock.svg?react";
import {
  Button,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui";
import { useState } from "react";
interface DatePickerWithRangeProps {
  date?: any;
  onDateChange?: (date: any) => void;
  className?: React.HTMLAttributes<HTMLDivElement>;
}

export const DatePickerWithoutRange: React.FC<DatePickerWithRangeProps> = ({
  onDateChange,
  className,
}) => {
  const [date, setDate] = useState("");

  return (
    <Popover>
      <PopoverTrigger>
        <div className="sdk:flex sdk:w-[100%] sdk:gap-0 sdk:justify-center sdk:items-center">
          <Button
            id="date"
            variant="ghost"
            className={cn(
              "sdk:w-fit sdk:font-outfit sdk:font-light sdk:text-[14px] sdk:max-[768px]:px-[0px]",
              !date && "text-[var(--sdk-muted-foreground)]"
            )}>
            <Clock />
            <span>{dayjs().format("YYYY-MM-DD HH:mm")}</span>
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="sdk:w-auto sdk:p-0" align="start">
        <Calendar
          mode="single"
          defaultMonth={new Date()}
          selected={new Date()}
          onSelect={onDateChange}
        />
      </PopoverContent>
    </Popover>
  );
};
