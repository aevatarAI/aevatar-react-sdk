import DataTable from "../ui/DataTable";
import { Button } from "../ui/button";
import AddIcon from "../../assets/svg/add.svg?react";
import NoWorkflows from "../../assets/svg/no-workflows.svg?react";
import { useMemo, useState } from "react";
import clsx from "clsx";
import DeleteWorkflowConfirm from "../DeleteWorkflowConfirm";
import type {
  IAgentInfoDetail,
  IWorkflowCoordinatorState,
} from "@aevatar-react-sdk/services";
import { workflowColumns } from "./columns";

import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select";
import { Ellipsis } from "lucide-react";

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
  onDuplicateWorkflow: (workflow: IWorkflowCoordinatorState & IAgentInfoDetail) => void;
}

const actionItemCls =
  "sdk:font-normal sdk:text-[14px] sdk:leading-[18px] sdk:text-[var(--sdk-color-text-primary)] sdk:hover:text-[var(--sdk-primary-foreground-text)] sdk:font-geist sdk:normal-case";

export const emptyNode = (
  <div className="sdk:flex sdk:flex-col sdk:gap-4 sdk:items-center sdk:justify-center sdk:h-[394px] sdk:text-center sdk:w-full">
    <div className="sdk:relative sdk:shrink-0 sdk:w-24 sdk:h-24">
      <NoWorkflows />
    </div>
    <div
      className="sdk:flex sdk:flex-col sdk:font-sourcecodepro sdk:font-normal sdk:justify-center sdk:leading-[0]  sdk:min-w-full sdk:relative sdk:shrink-0 sdk:text-[var(--sdk-muted-foreground)] sdk:text-[12px] sdk:text-center"
      style={{ width: "min-content" }}>
      <p className="sdk:block sdk:leading-normal">No workflows created yet</p>
    </div>
  </div>
);

enum ActionType {
  OpenWorkflow = "openWorkflow",
  ViewExecutions = "ViewExecutions",
  DuplicateWorkflow = "DuplicateWorkflow",
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
  onDuplicateWorkflow,
}: WorkflowListInnerProps) {
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const tableData = useMemo(
    () =>
      workflowsList?.map((item) => ({
        ...item,
        name: (
          // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
          <div
            className="sdk:text-[14px] sdk:pl-[15px] sdk:font-geist sdk:font-semibold sdk:hover:underline sdk:hover:decoration-[var(--sdk-color-text-primary)] sdk:cursor-pointer"
            onClick={() => onEditWorkflow?.(item.id)}>
            {item?.name ?? "-"}
          </div>
        ),
        operation: (
          <div className="sdk:flex sdk:items-center sdk:justify-end sdk:pr-[15px]">
            <Select
              value={null}
              dir="rtl"
              onValueChange={(value) => {
                console.log("value===", value);
                if (value === ActionType.OpenWorkflow) {
                  onEditWorkflow?.(item.id);
                } else if (value === ActionType.DuplicateWorkflow) {
                  onDuplicateWorkflow?.(item);
                } else if (value === ActionType.ViewExecutions) {
                  onViewExecutions?.(item.id);
                } else if (value === ActionType.DeleteWorkflow) {
                  setDeleteItemId(item.id);
                }
              }}>
              <SelectTrigger
                className={clsx(
                  "sdk:normal-case sdk:gap-[5px]  sdk:cursor-pointer",
                  "sdk:border-none sdk:px-[18px]",
                  "sdk:md:max-w-[200px] sdk:max-w-[192px]"
                )}
                // biome-ignore lint/complexity/noUselessFragments: <explanation>
                downIcon={<></>}>
                <Ellipsis className="sdk:text-[var(--sdk-color-text-primary)]" />
              </SelectTrigger>
              <SelectContent
                align="end"
                className="sdk:md:w-[200px] sdk:w-[192px] sdk:right-0 sdk:-top-[4px] sdk:p-0 sdk:md:p-0 sdk:bg-transparent">
                <div className="sdk:p-[8px_8px_4px_10px] sdk:md:p-[8px_8px_4px_10px] sdk:bg-[var(--sdk-color-bg-primary)]">
                  <SelectItem
                    className={clsx(
                      actionItemCls,
                      "aevatar-workflow-action-select-open"
                    )}
                    value={ActionType.OpenWorkflow}>
                    Open Workflow
                  </SelectItem>
                  {/* <SelectItem
                  className={clsx(
                    actionItemCls,
                    "aevatar-workflow-action-select-view"
                  )}
                  value={ActionType.ViewExecutions}>
                  view executions
                </SelectItem> */}
                  <SelectItem
                    className={clsx(
                      actionItemCls,
                      "aevatar-workflow-action-select-view"
                    )}
                    value={ActionType.DuplicateWorkflow}>
                    Duplicate
                  </SelectItem>
                  <SelectItem
                    className={clsx(
                      actionItemCls,
                      "sdk:text-[var(--sdk-warning-color)] sdk:hover:text-[var(--sdk-warning-color)]",
                      "aevatar-workflow-action-select-delete"
                    )}
                    value={ActionType.DeleteWorkflow}>
                    Delete
                  </SelectItem>
                </div>
              </SelectContent>
            </Select>
          </div>
        ),
      })),
    [workflowsList, onEditWorkflow, onViewExecutions, onDuplicateWorkflow]
  );

  return (
    <div
      className={clsx(
        "sdk:flex sdk:flex-col sdk:gap-[30px] sdk:items-start sdk:w-full sdk:box-border sdk:bg-[var(--sdk-bg-background)] sdk:h-full sdk:overflow-y-auto",
        className
      )}
      id="node-6202_82359">
      <div
        className="sdk:flex sdk:flex-row sdk:items-center sdk:w-full sdk:justify-between sdk:box-border"
        id="node-6202_82360">
        <div
          className="sdk:font-geist sdk:font-semibold sdk:text-[18px] sdk:text-[var(--sdk-color-text-primary)]"
          id="node-6202_82361">
          <p>Workflows</p>
        </div>
        <div>
          <Button
            variant="primary"
            className="sdk:text-[12px] sdk:font-geist sdk:font-semibold sdk:flex sdk:items-center sdk:gap-[5px] sdk:cursor-pointer"
            onClick={onNewWorkflow}>
            <AddIcon style={{ width: 14, height: 14 }} />
            New Workflow
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
