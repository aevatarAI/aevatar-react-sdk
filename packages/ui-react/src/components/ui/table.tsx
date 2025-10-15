import * as React from "react";
import { cn } from "../../lib/utils";

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="sdk:relative sdk:w-full sdk:overflow-auto sdk:border sdk:border-solid sdk:rounded-lg sdk:border-[var(--sdk-color-border-primary)]">
    <table
      ref={ref}
      className={cn("sdk:w-full sdk:caption-bottom sdk:text-sm", className)}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      "[&_tr]:sdk:border-b sdk:text-[var(--sdk-color-text-foreground)] sdk:text-xs sdk:font-bold sdk:font-geist sdk:border-b sdk:border-solid",
      "sdk:border-[var(--sdk-color-border-primary)]",
      className
    )}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:sdk:border-0 sdk:relative", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "sdk:border-t sdk:bg-[var(--sdk-bg-muted)]/50 sdk:font-medium sdk:last:[&>tr]:sdk:border-b-0",
      className
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "sdk:transition-colors sdk:hover:bg-muted/50 sdk:border-b sdk:border-solid sdk:data-[state=selected]:bg-muted sdk:text-[var(--sdk-color-text-primary)] sdk:text-sm sdk:font-medium sdk:font-geist",
      "sdk:border-[var(--sdk-color-border-primary)]",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "sdk:font-geist sdk:text-sm sdk:font-semibold sdk:py-3 sdk:leading-normal sdk:text-[var(--sdk-color-text-foreground)] sdk:text-left sdk:align-middle sdk:font-semibold [&:has([role=checkbox])]:pr-0",
      "sdk:border-[var(--sdk-color-border-primary)]",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "sdk:py-[18px] sdk:text-sm sdk:font-geist sdk:align-middle [&:has([role=checkbox])]:sdk:pr-0",
      "sdk:border-[var(--sdk-color-border-primary)]",
      className
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn(
      "sdk:mt-4 sdk:text-sm sdk:text-[var(--sdk-muted-foreground)]",
      "sdk:border-[var(--sdk-color-border-primary)]",
        className
    )}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
