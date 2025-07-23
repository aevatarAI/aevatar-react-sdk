import clsx from "clsx";
import DataTable from "../ui/DataTable";
import { useGetWorkflowList } from "../../hooks/useGetWorkflowList";
import dayjs from "dayjs";
import AddIcon from "../../assets/svg/add.svg?react";
import { useGetWorkflowDetails } from "../../hooks/useGetWorkflowDetails";
import { emptyNode } from "../WorkflowListInner";
import { Button } from "../ui";
import FailedIcon from "../../assets/svg/failed.svg?react";
import { workflowStatusMap } from "../WorkflowListInner/columns";
import { WorkflowStatus } from "@aevatar-react-sdk/services";
import { EditExecutionsFilterDialog } from "../EditExecutionsFilterDialog";
import { useState } from "react";
interface IExecutionListProps {
  className?: string;
  onNewWorkflow?: () => void;
}

export const columns = [
  {
    accessorKey: "name",
    header: "Workflow",
    cell: ({ row }) => (
      <div className="min-w-[125px] text-[14px] font-semibold pl-[15px]">
        {row.original?.name}
      </div>
    ),
  },
  {
    accessorKey: "createTime",
    header: "started",
    cell: ({ row }) => (
      <div className="pr-[20px] md:pr-[30px] w-[175px] font-outfit">
        {dayjs.utc(row.original.createTime).local().format("MMM D, HH:mm:ss")}
      </div>
    ),
  },
  {
    accessorKey: "runTime",
    header: "run time",
    cell: ({ row }) => (
      <div className="pr-[20px] md:pr-[30px] w-[175px] font-outfit">
        {`${Math.abs(
          dayjs(row.original.lastRunningTime).diff(dayjs(row.original.ctime))
        )}ms`}
      </div>
    ),
  },
  {
    accessorKey: "workflowStatus",
    header: "status",
    cell: ({ row }) => {
      return (
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
          {workflowStatusMap[row.original.workflowStatus]}
        </div>
      );
    },
  },
  {
    id: "execId",
    header: "exec.id",
    cell: ({ row }) => row.original.blackboardId || "-",
  },
];

export default function ExecutionList({
  className,
  onNewWorkflow,
}: IExecutionListProps) {
  const stateName = "WorkflowCoordinatorState";
  const [filter, setFilter] = useState({
    pageIndex: 0,
    pageSize: 100,
  });

  const { data, isLoading } = useGetWorkflowList(filter);
  const ids = data?.map((datum) => datum.id).join(" OR ");

  const { data: workflowDetails, isLoading: isFetching } =
    useGetWorkflowDetails({ stateName, ids });

  const mergedData = data.map((datum) => {
    const matchingDetail = workflowDetails?.find(
      (detail) => detail.blackboardId === datum.id
    );

    return matchingDetail
      ? { ...datum, ...matchingDetail }
      : { ...datum, name: "unknown" };
  });

  return (
    <div
      className={clsx(
        "sdk:flex sdk:flex-col sdk:gap-[30px] sdk:items-start sdk:w-full sdk:box-border sdk:bg-[#000] sdk:h-full sdk:overflow-y-auto w-full",
        className
      )}
      id={crypto.randomUUID()}
    >
      <div className="flex flex-col w-full">
        <div
          className="sdk:flex sdk:flex-row sdk:items-center sdk:w-full sdk:justify-between sdk:box-border"
          id={crypto.randomUUID()}
        >
          <div
            className="sdk:font-outfit sdk:font-semibold sdk:text-[18px] sdk:bg-gradient-to-r sdk:from-white sdk:to-[#999] sdk:bg-clip-text sdk:text-transparent sdk:lowercase"
            id={crypto.randomUUID()}
            style={{ WebkitTextFillColor: "transparent" }}
          >
            <p>executions</p>
          </div>
          <div>
            <Button
              className="sdk:text-white sdk:text-[12px] sdk:font-outfit sdk:font-semibold sdk:flex sdk:items-center sdk:gap-[5px] sdk:hover:text-black sdk:cursor-pointer"
              onClick={onNewWorkflow}
            >
              <AddIcon style={{ width: 14, height: 14 }} />
              new workflow
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <EditExecutionsFilterDialog
              data={data}
              filter={filter}
              onChange={setFilter}
            />
          </div>
          <div>
            <span className="text-white text-[16px]">no active executions</span>
          </div>
        </div>
      </div>

      <div className="sdk:w-full">
        <DataTable
          className={clsx(
            !(isLoading || isFetching) &&
              mergedData?.length &&
              "sdk:min-w-[600px]"
          )}
          tableHeadClassName={"sdk:first:pl-[15px]"}
          columns={columns}
          data={mergedData}
          loading={isLoading || isFetching}
          emptyNode={emptyNode}
        />
      </div>
    </div>
  );
}
