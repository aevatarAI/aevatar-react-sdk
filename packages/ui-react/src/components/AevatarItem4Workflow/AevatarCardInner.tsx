import type { IAgentInfoDetail } from "@aevatar-react-sdk/services";
import Delete from "../../assets/svg/delete.svg?react";
import "./index.css";
import { useCallback, useMemo } from "react";
import DeleteWorkflowGAevatar from "../DeleteWorkflowGAevatar";
import { jsonSchemaParse } from "../../utils/jsonSchemaParse";
import type { JSONSchemaType } from "../types";
import clsx from "clsx";
import type { TNodeDataClick } from "../Workflow/types";
export interface IAevatarCardInnerProps {
  className?: string;
  isNew?: boolean;
  onClick?: TNodeDataClick;
  deleteNode: (nodeId: string) => void;
  nodeId?: string;
  agentInfo?: IAgentInfoDetail;
}

export default function AevatarCardInner({
  className,
  isNew,
  onClick,
  deleteNode,
  nodeId,
  agentInfo,
}: IAevatarCardInnerProps) {
  const handleDeleteClick = useCallback(
    (e: any) => {
      e.stopPropagation();
      deleteNode(nodeId);
    },
    [deleteNode, nodeId]
  );

  const propertiesInfo = useMemo(
    () => jsonSchemaParse(agentInfo?.propertyJsonSchema, agentInfo?.properties),
    [agentInfo]
  );

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
    <div
      data-testid='aevatar-card'
      onClick={() => {
        onClick?.(agentInfo, isNew, nodeId);
      }}>
      <div
        className={`sdk:aevatar-item-background sdk:w-[234px] sdk:cutCorner sdk:hover:border sdk:hover:cutCorner-border sdk:workflow-common-border ${className}`}>
        <div className="sdk:pb-[12px] sdk:pt-[16px] sdk:pr-[14px] sdk:pl-[14px] sdk:border-b sdk:border-[var(--sdk-border-color)] sdk:border-solid">
          <div className="sdk:flex sdk:justify-between sdk:items-center sdk:pb-[9px]">
            <div className="sdk:flex sdk:font-syne sdk:text-white sdk:text-[15px] sdk:font-semibold sdk:leading-normal sdk:lowercase ">{`${
              agentInfo?.name ?? "agent name"
            }`}</div>

            {isNew ? (
              <DeleteWorkflowGAevatar handleDeleteClick={handleDeleteClick} />
            ) : (
              <Delete
                className="sdk:cursor-pointer"
                onClick={handleDeleteClick}
              />
            )}
          </div>
          <div className="sdk:font-pro sdk:text-[#B9B9B9] sdk:text-[11px] sdk:font-normal sdk:leading-normal sdk:lowercase sdk:truncate">
            {agentInfo?.agentType ?? "--"}
          </div>
        </div>
        <div className="sdk:pb-[16px] sdk:pt-[12px] sdk:pr-[14px] sdk:pl-[14px] sdk:flex sdk:flex-col sdk:items-start sdk:gap-[12px] sdk:self-stretch">
          {(propertiesInfo ?? []).map((item: [string, JSONSchemaType<any>]) => (
            <div key={item?.[0]} className={clsx(isNew && "sdk:w-full")}>
              <div className="sdk:text-[var(--sdk-gray-text)] sdk:text-[11px] sdk:pb-[10px]">
                {item[0]}
              </div>
              <div
                className={clsx(
                  (!isNew || item?.[1].value) &&
                    "sdk:flex sdk:flex-wrap sdk:gap-[10px]"
                )}>
                {/* {
                propertiesValue(item?.[1]).map((info) => ( */}
                <div
                  className={clsx(
                    "sdk:p-[4px] sdk:bg-[var(--sdk-border-color)] sdk:text-[12px] sdk:text-white ",
                    isNew && !item?.[1].value && "sdk:h-[23px] sdk:w-full",
                    isNew &&
                      !item?.[1].value &&
                      item?.[1].enum &&
                      "sdk:w-[100px]!"
                  )}>
                  {item?.[1].value ?? ""}
                </div>
                {/* ))
                } */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
