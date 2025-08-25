import type { ColumnDef } from "@tanstack/react-table";
import clsx from "clsx";
import FailedIcon from "../../assets/svg/failed.svg?react";
import {
  type IAgentInfoDetail,
  type IWorkflowCoordinatorState,
  WorkflowStatus,
} from "@aevatar-react-sdk/services";
import dayjs from "../../utils/dayjs";

export const workflowStatusMap = {
  [WorkflowStatus.pending]: "pending",
  [WorkflowStatus.running]: "running",
  [WorkflowStatus.failed]: "failed",
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
      <div className="sdk:text-[12px]  sdk:font-outfit sdk:font-semibold">
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
  //     <div className="sdk:text-[14px] sdk:font-outfit sdk:font-semibold">
  //       {row.original.createdBy}
  //     </div>
  //   ),
  // },
  // {
  //   accessorKey: "lastUpdated",
  //   header: "last updated",
  //   cell: ({ row }) => (
  //     <div className="sdk:text-[12px]  sdk:font-outfit">
  //       {row.original.lastUpdated}
  //     </div>
  //   ),
  // },
  {
    accessorKey: "lastRun",
    header: "last run",
    cell: ({ row }) => (
      <div className="sdk:text-[12px]  sdk:font-outfit">
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
          "sdk:text-[14px]  sdk:font-outfit sdk:font-semibold ",
          row.original.workflowStatus === WorkflowStatus.failed &&
            "sdk:text-[#FF2E2E] sdk:flex sdk:flex-row sdk:gap-[4px] sdk:items-center"
        )}
      >
        {row.original.workflowStatus === WorkflowStatus.failed && (
          <FailedIcon className="sdk:w-[14px] sdk:h-[14px]" />
        )}
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
