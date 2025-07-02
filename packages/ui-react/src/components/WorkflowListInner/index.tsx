import DataTable from "../ui/DataTable";
import { type IWorkflow, workflowColumns } from "./columns";
import { Button } from "../ui/button";
import AddIcon from "../../assets/svg/add.svg?react";
import Edit from "../../assets/svg/edit.svg?react";
import Delete from "../../assets/svg/delete.svg?react";
import NoWorkflows from "../../assets/svg/no-workflows.svg?react";

import { useMemo } from "react";
import clsx from "clsx";
import DeleteWorkflowConfirm from "../DeleteWorkflowConfirm";

interface WorkflowListInnerProps {
  workflowsList: IWorkflow[];
  loading?: boolean;
  className?: string;

  onEditWorkflow: (workflow: IWorkflow) => void;
  onDeleteWorkflow: (workflow: IWorkflow) => void;
  onNewWorkflow: () => void;
}

export default function WorkflowListInner({
  workflowsList,
  loading,
  className,

  onEditWorkflow,
  onDeleteWorkflow,
  onNewWorkflow,
}: WorkflowListInnerProps) {
  const tableData = useMemo(
    () =>
      workflowsList.map((item) => ({
        ...item,
        operation: (
          <div className="sdk:flex sdk:flex-row sdk:gap-[7px] sdk:h-[45px] sdk:w-[50px] sdk:items-center sdk:justify-center">
            <Edit
              className="sdk:cursor-pointer sdk:text-[#606060] sdk:w-[14px] sdk:h-[14px]"
              onClick={() => onEditWorkflow(item)}
            />

            <DeleteWorkflowConfirm
              handleConfirm={() => onDeleteWorkflow(item)}
            />
          </div>
        ),
      })),
    [workflowsList, onEditWorkflow, onDeleteWorkflow]
  );

  const emptyNode = useMemo(() => {
    return (
      <div className="sdk:flex sdk:flex-col sdk:gap-4 sdk:items-center sdk:justify-center sdk:h-[394px] sdk:text-center sdk:w-full">
        <div className="sdk:relative sdk:shrink-0 sdk:w-24 sdk:h-24">
          <NoWorkflows />
        </div>
        <div
          className="sdk:flex sdk:flex-col sdk:font-sourcecodepro sdk:font-normal sdk:justify-center sdk:leading-[0] sdk:lowercase sdk:min-w-full sdk:relative sdk:shrink-0 sdk:text-[#b9b9b9] sdk:text-[12px] sdk:text-center"
          style={{ width: "min-content" }}>
          <p className="sdk:block sdk:leading-normal">
            No workflows created yet
          </p>
        </div>
      </div>
    );
  }, []);

  return (
    <div
      className={clsx(
        "sdk:flex sdk:flex-col sdk:gap-[30px] sdk:items-start sdk:w-full sdk:box-border sdk:bg-[#000]",
        className
      )}
      id="node-6202_82359">
      <div
        className="sdk:flex sdk:flex-row sdk:items-center sdk:w-full sdk:justify-between sdk:box-border"
        id="node-6202_82360">
        <div
          className="sdk:font-syne sdk:font-semibold sdk:text-[18px] sdk:bg-gradient-to-r sdk:from-white sdk:to-[#999] sdk:bg-clip-text sdk:text-transparent sdk:lowercase"
          id="node-6202_82361"
          style={{ WebkitTextFillColor: "transparent" }}>
          <p>Workflows</p>
        </div>
        <div>
          <Button
            className="sdk:text-white sdk:text-[12px] sdk:font-syne sdk:font-semibold sdk:flex sdk:items-center sdk:gap-[5px] sdk:hover:text-black sdk:cursor-pointer"
            onClick={onNewWorkflow}>
            <AddIcon style={{ width: 14, height: 14 }} />
            new workflow
          </Button>
        </div>
      </div>
      <div className="sdk:w-full">
        <DataTable
          className={clsx(!loading && tableData.length && "sdk:min-w-[600px]")}
          tableHeadClassName={"sdk:first:pl-[15px]"}
          columns={workflowColumns}
          data={tableData}
          loading={loading}
          emptyNode={emptyNode}
        />
      </div>
    </div>
  );
}
