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
        <div className="flex w-[100%] gap-0 justify-center items-center">
          <Button
            id="date"
            variant="ghost"
            className={cn(
              "w-fit font-outfit font-light text-[14px] max-[768px]:px-[0px]",
              !date && "text-muted-foreground"
            )}
          >
            <Clock />
            <span>{dayjs().format("YYYY-MM-DD HH:mm")}</span>
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
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
