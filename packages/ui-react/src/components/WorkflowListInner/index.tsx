import DataTable from "../ui/DataTable";
import { Button } from "../ui/button";
import AddIcon from "../../assets/svg/add.svg?react";
import NoWorkflows from "../../assets/svg/no-workflows.svg?react";
import Setting from "../../assets/svg/setting.svg?react";
import DownIcon from "../../assets/svg/down-icon.svg?react";
import { useMemo, useState } from "react";
import clsx from "clsx";
import DeleteWorkflowConfirm from "../DeleteWorkflowConfirm";
import type {
  IAgentInfoDetail,
  IWorkflowCoordinatorState,
} from "@aevatar-react-sdk/services";
import { workflowColumns } from "./columns";

import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select";

interface WorkflowListInnerProps {
  workflowsList: (IWorkflowCoordinatorState & IAgentInfoDetail)[];
  loading?: boolean;
  className?: string;

  onEditWorkflow?: (workflowId: string) => void;
  onDeleteWorkflow: (
    workflow: IWorkflowCoordinatorState & IAgentInfoDetail
  ) => void;
  onViewExecutions?: (workflowId: string) => void;
  onNewWorkflow: () => void;
}

const actionItemCls =
  "sdk:font-normal sdk:text-[14px] sdk:leading-[18px] sdk:text-white sdk:font-outfit sdk:normal-case";

export const emptyNode = (
  <div className="sdk:flex sdk:flex-col sdk:gap-4 sdk:items-center sdk:justify-center sdk:h-[394px] sdk:text-center sdk:w-full">
    <div className="sdk:relative sdk:shrink-0 sdk:w-24 sdk:h-24">
      <NoWorkflows />
    </div>
    <div
      className="sdk:flex sdk:flex-col sdk:font-sourcecodepro sdk:font-normal sdk:justify-center sdk:leading-[0] sdk:lowercase sdk:min-w-full sdk:relative sdk:shrink-0 sdk:text-[#b9b9b9] sdk:text-[12px] sdk:text-center"
      style={{ width: "min-content" }}>
      <p className="sdk:block sdk:leading-normal">No workflows created yet</p>
    </div>
  </div>
);

enum ActionType {
  OpenWorkflow = "openWorkflow",
  ViewExecutions = "ViewExecutions",
  DeleteWorkflow = "deleteWorkflow",
}

export default function WorkflowListInner({
  workflowsList = [],
  loading,
  className,

  onEditWorkflow,
  onDeleteWorkflow,
  onViewExecutions,
  onNewWorkflow,
}: WorkflowListInnerProps) {
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const tableData = useMemo(
    () =>
      workflowsList?.map((item) => ({
        ...item,
        name: (
          // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
          <div
            className="sdk:text-[14px] sdk:pl-[15px] sdk:font-outfit sdk:font-semibold sdk:hover:underline sdk:hover:decoration-[#fff] sdk:cursor-pointer"
            onClick={() => onEditWorkflow?.(item.id)}>
            {item?.name ?? "-"}
          </div>
        ),
        operation: (
          <div className="sdk:flex sdk:items-center sdk:justify-end sdk:pr-[15px]">
            <Select
              value={null}
              onValueChange={(value) => {
                console.log("value===", value);
                if (value === ActionType.OpenWorkflow) {
                  onEditWorkflow?.(item.id);
                } else if (value === ActionType.ViewExecutions) {
                  onViewExecutions?.(item.id);
                } else if (value === ActionType.DeleteWorkflow) {
                  setDeleteItemId(item.id);
                }
              }}>
              <SelectTrigger
                className={clsx(
                  "sdk:normal-case sdk:gap-[5px] sdk:w-[106px] sdk:cursor-pointer sdk:bg-white sdk:text-[#000]",
                  "sdk:border-none sdk:px-[18px]",
                  "sdk:leading-[15px]",
                  "sdk:min-h-[30px]"
                )}
                downIcon={<DownIcon />}>
                <span className="sdk:flex sdk:items-center sdk:gap-[5px] sdk:text-[#303030]">
                  <Setting
                    role="img"
                    className="sdk:text-[#303030] sdk:w-[14px] sdk:h-[14px]"
                  />
                  actions
                </span>
              </SelectTrigger>
              <SelectContent
                align="end"
                className="sdk:md:w-[259px] sdk:w-[192px] sdk:left-0 sdk:-top-[4px] sdk:p-[8px_8px_20px_10px] sdk:md:p-[8px_8px_20px_10px] sdk:bg-[#141415]">
                <SelectItem
                  className={clsx(
                    actionItemCls,
                    "aevatar-workflow-action-select-open"
                  )}
                  value={ActionType.OpenWorkflow}>
                  open workflow
                </SelectItem>
                <SelectItem
                  className={clsx(
                    actionItemCls,
                    "aevatar-workflow-action-select-view"
                  )}
                  value={ActionType.ViewExecutions}>
                  view executions
                </SelectItem>
                <SelectItem
                  className={clsx(
                    actionItemCls,
                    "sdk:text-[#FF2E2E] sdk:hover:text-[#FF2E2E]",
                    "aevatar-workflow-action-select-delete"
                  )}
                  value={ActionType.DeleteWorkflow}>
                  delete
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        ),
      })),
    [workflowsList, onEditWorkflow, onViewExecutions]
  );

  return (
    <div
      className={clsx(
        "sdk:flex sdk:flex-col sdk:gap-[30px] sdk:items-start sdk:w-full sdk:box-border sdk:bg-[#000] sdk:h-full sdk:overflow-y-auto",
        className
      )}
      id="node-6202_82359">
      <div
        className="sdk:flex sdk:flex-row sdk:items-center sdk:w-full sdk:justify-between sdk:box-border"
        id="node-6202_82360">
        <div
          className="sdk:font-outfit sdk:font-semibold sdk:text-[18px] sdk:bg-gradient-to-r sdk:from-white sdk:to-[#999] sdk:bg-clip-text sdk:text-transparent sdk:lowercase"
          id="node-6202_82361"
          style={{ WebkitTextFillColor: "transparent" }}>
          <p>Workflows</p>
        </div>
        <div>
          <Button
            className="sdk:text-white sdk:text-[12px] sdk:font-outfit sdk:font-semibold sdk:flex sdk:items-center sdk:gap-[5px] sdk:hover:text-black sdk:cursor-pointer"
            onClick={onNewWorkflow}>
            <AddIcon style={{ width: 14, height: 14 }} />
            new workflow
          </Button>
        </div>
      </div>

      <div className="sdk:w-full">
        <DataTable
          className={clsx(!loading && tableData?.length && "sdk:min-w-[600px]")}
          tableHeadClassName={"sdk:first:pl-[15px]"}
          columns={workflowColumns}
          data={tableData}
          loading={loading}
          emptyNode={emptyNode}
        />
      </div>
      <DeleteWorkflowConfirm
        open={!!deleteItemId}
        onOpenChange={() => {
          setDeleteItemId(null);
        }}
        handleConfirm={() => {
          console.log(deleteItemId, "deleteItemId==");
          const deleteItem = workflowsList.find(
            (item) => item.id === deleteItemId
          );
          if (deleteItem) {
            onDeleteWorkflow?.(deleteItem);
          }
        }}
      />
    </div>
  );
}
