import type { ColumnDef } from "@tanstack/react-table";
import clsx from "clsx";
import {
  type IAgentInfoDetail,
  type IWorkflowCoordinatorState,
  WorkflowStatus,
} from "@aevatar-react-sdk/services";
import dayjs from "../../utils/dayjs";

export const workflowStatusMap = {
  [WorkflowStatus.pending]: "Pending",
  [WorkflowStatus.running]: "Running",
  [WorkflowStatus.failed]: "Failed",
};

export interface IWorkflowTable {
  name?: JSX.Element;
  operation?: JSX.Element;
}

export const workflowColumns: ColumnDef<
  IWorkflowTable & IWorkflowCoordinatorState & Omit<IAgentInfoDetail, "name">
>[] = [
  {
    accessorKey: "name",
    header: "name",
    cell: ({ row }) => row.original.name,
  },
  {
    accessorKey: "created",
    header: "created",
    cell: ({ row }) => (
      <div className="sdk:text-[12px]  sdk:font-geist sdk:font-semibold">
        {row.original.ctime
          ? dayjs.utc(row.original.ctime).local().format("YYYY-MM-DD HH:mm")
          : "-"}
      </div>
    ),
  },
  // {
  //   accessorKey: "createdBy",
  //   header: "created by",
  //   cell: ({ row }) => (
  //     <div className="sdk:text-[14px] sdk:font-geist sdk:font-semibold">
  //       {row.original.createdBy}
  //     </div>
  //   ),
  // },
  // {
  //   accessorKey: "lastUpdated",
  //   header: "last updated",
  //   cell: ({ row }) => (
  //     <div className="sdk:text-[12px]  sdk:font-geist">
  //       {row.original.lastUpdated}
  //     </div>
  //   ),
  // },
  {
    accessorKey: "lastRun",
    header: "last run",
    cell: ({ row }) => (
      <div className="sdk:text-[12px]  sdk:font-geist">
        {row.original.lastRunningTime
          ? dayjs
              .utc(row.original.lastRunningTime)
              .local()
              .format("YYYY-MM-DD HH:mm")
          : "-"}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div
        className={clsx(
          "sdk:text-[14px]  sdk:font-geist sdk:font-semibold sdk:leading-[16px] sdk:rounded-full sdk:inline-block  sdk:py-0.5 sdk:px-2.5",
          row.original.workflowStatus === WorkflowStatus.failed &&
            "sdk:bg-[var(--sdk-color-warning)] sdk:text-[var(--sdk-color-destructive-foreground)]",
          (row.original.workflowStatus === WorkflowStatus.running ||
            row.original.workflowStatus === WorkflowStatus.pending) &&
            "sdk:bg-[var(--sdk-color-pending-bg)] sdk:text-[var(--sdk-primary-foreground-text)]"
        )}>
        {workflowStatusMap[row.original.workflowStatus] ?? "-"}
      </div>
    ),
  },
  {
    id: "operation",
    header: "",
    cell: ({ row }) => row.original.operation,
  },
];
