import type { ColumnDef } from "@tanstack/react-table";
import clsx from "clsx";
import FailedIcon from "../../assets/svg/failed.svg?react";

export enum WorkflowStatus {
  failed = "failed",
  success = "success",
  pending = "pending",
  running = "running",
}

export const workflowStatusMap = {
  [WorkflowStatus.failed]: "failed",
  [WorkflowStatus.success]: "success",
  [WorkflowStatus.pending]: "pending",
  [WorkflowStatus.running]: "running",
};

export interface IWorkflow {
  name: string;
  created: string;
  createdBy: string;
  lastUpdated: string;
  lastRan: string;
  status: WorkflowStatus;
}

export interface IWorkflowTable extends IWorkflow {
  operation?: JSX.Element;
}

export const workflowColumns: ColumnDef<IWorkflowTable>[] = [
  {
    accessorKey: "name",
    header: "name",
    cell: ({ row }) => (
      <div className="sdk:text-[14px] sdk:pl-[15px] sdk:font-syne sdk:font-semibold">
        {row.original.name}
      </div>
    ),
  },
  {
    accessorKey: "created",
    header: "created",
    cell: ({ row }) => (
      <div className="sdk:text-[12px]  sdk:font-pro sdk:font-semibold">
        {row.original.created}
      </div>
    ),
  },
  {
    accessorKey: "createdBy",
    header: "created by",
    cell: ({ row }) => (
      <div className="sdk:text-[14px] sdk:font-syne sdk:font-semibold">
        {row.original.createdBy}
      </div>
    ),
  },
  {
    accessorKey: "lastUpdated",
    header: "last updated",
    cell: ({ row }) => (
      <div className="sdk:text-[12px]  sdk:font-pro">
        {row.original.lastUpdated}
      </div>
    ),
  },
  {
    accessorKey: "lastRan",
    header: "last ran",
    cell: ({ row }) => (
      <div className="sdk:text-[12px]  sdk:font-pro">
        {row.original.lastRan}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div
        className={clsx(
          "sdk:text-[14px]  sdk:font-syne sdk:font-semibold ",
          row.original.status === WorkflowStatus.failed &&
            "sdk:text-[#FF2E2E] sdk:flex sdk:flex-row sdk:gap-[4px] sdk:items-center"
        )}>
        {row.original.status === WorkflowStatus.failed && (
          <FailedIcon className="sdk:w-[14px] sdk:h-[14px]" />
        )}
        {workflowStatusMap[row.original.status]}
      </div>
    ),
  },
  {
    id: "operation",
    header: "",
    cell: ({ row }) => row.original.operation,
  },
];
