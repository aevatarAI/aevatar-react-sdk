import type { IAgentInfoDetail } from "@aevatar-react-sdk/services";

import Hypotenuse from "../../assets/svg/hypotenuse.svg?react";
import "./index.css";
import { useCallback, useMemo, useState } from "react";
import { jsonSchemaParse } from "../../utils/jsonSchemaParse";
import type { JSONSchemaType } from "../types";
import clsx from "clsx";
import type { TNodeDataClick } from "../Workflow/types";
import HoverMenu from "./HoverMenu";
import type { ExecutionLogItem } from "@aevatar-react-sdk/types";
import AccordionLogs from "./AccordionLogs";
import { ChevronDown } from "lucide-react";
export interface IAevatarCardInnerProps {
  className?: string;
  isNew?: boolean;
  onClick?: TNodeDataClick;
  deleteNode: (nodeId: string) => void;
  nodeId?: string;
  agentInfo?: IAgentInfoDetail & { defaultValues?: Record<string, any[]> };
  selected?: boolean;
  agentLogs?: ExecutionLogItem;
  disabled?: boolean;
  onShowLogsDialog: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export default function AevatarCardInner({
  className = "",
  isNew,
  onClick,
  deleteNode,
  onShowLogsDialog,
  nodeId,
  agentInfo,
  selected,
  agentLogs,
  disabled,
}: IAevatarCardInnerProps) {
  const handleDeleteClick = useCallback(
    (e: any) => {
      e.stopPropagation();
      deleteNode(nodeId);
    },
    [deleteNode, nodeId]
  );

  const propertiesInfo = useMemo(
    () =>
      jsonSchemaParse(
        agentInfo?.propertyJsonSchema,
        agentInfo?.properties,
        isNew ? agentInfo?.defaultValues : undefined
      ).slice(0, 3), // Only take first 3 properties
    [agentInfo, isNew]
  );

  const [showMore, setShowMore] = useState(false);

  return (
    <div className="sdk:w-[234px]">
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
      <div
        data-testid="aevatar-card"
        className="sdk:group sdk:relative sdk:pb-[8px]"
        onClick={(e) => {
          onClick?.(agentInfo, isNew, nodeId);
        }}>
        <HoverMenu
          triggerClassName="sdk:group-hover:block sdk:hidden sdk:absolute sdk:-top-0 sdk:right-[0px]"
          disabled={disabled}
          onDelete={handleDeleteClick}
        />
        <div
          className={clsx(
            "sdk:aevatar-item-background sdk:border sdk:border-[var(--sdk-color-bg-primary)]  sdk:group-hover:border-[var(--sdk-border-foreground)]",
            selected && "sdk:border-[var(--sdk-border-foreground)]! ",
            // "sdk:border-b-[var(--sdk-bg-accent)]!",
            "sdk:pb-[6px]",
            "sdk:max-h-[300px] sdk:overflow-y-auto",
            className
          )}
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}>
          <div className="sdk:pb-[12px] sdk:pt-[16px] sdk:pr-[14px] sdk:pl-[14px]">
            <div className="sdk:pb-[9px]">
              <div
                className={clsx(
                  "sdk:font-geist sdk:text-[var(--sdk-color-text-primary)] sdk:text-base sdk:font-semibold sdk:leading-normal ",
                  "sdk:flex sdk:w-full sdk:items-center sdk:justify-between sdk:gap-[4px]"
                )}>
                {/* Single line, overflow ellipsis */}
                <span className="sdk:flex-1 sdk:truncate sdk:max-w-[calc(100%-32px)]">{`${
                  agentInfo?.name || "agent name"
                }`}</span>
                <ChevronDown
                  className={clsx(
                    "sdk:w-[16px] sdk:h-[16px] sdk:cursor-pointer sdk:transition-all sdk:duration-200 sdk:ease-in-out",
                    showMore && "sdk:rotate-180",
                    propertiesInfo.length <= 0 && "sdk:hidden"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMore((v) => !v);
                  }}
                />
              </div>
            </div>
            <div className="sdk:font-geist sdk:text-[var(--sdk-muted-foreground)] sdk:text-[12px] sdk:font-normal sdk:leading-normal sdk:truncate">
              {agentInfo?.agentType
                ? agentInfo?.agentType?.split(".")?.pop()
                : "--"}
            </div>
          </div>
          <div
            className={clsx(
              "sdk:font-geist sdk:pb-[6px] sdk:pt-[12px] sdk:pr-[14px] sdk:pl-[14px] sdk:flex sdk:flex-col sdk:items-start sdk:gap-[12px] sdk:self-stretch",
              " sdk:border-t sdk:border-[var(--sdk-border-color)] ",
              "sdk:hidden",
              showMore && "sdk:flex!"
            )}>
            {(propertiesInfo ?? []).map(
              (item: [string, JSONSchemaType<any>]) => {
                // Extract property name and schema
                const [propName, schema] = item;

                const isArray = schema.type === "array";

                let value = schema.value;

                let valueList = [value];
                if (value === undefined || value === null || value === "") {
                  valueList = [null];
                } else if (schema.enum) {
                  const valueIndex = schema.enum.indexOf(schema.value);

                  value = schema["x-enumNames"]?.[valueIndex];
                  valueList = [
                    typeof value === "string" ? value : JSON.stringify(value),
                  ];
                  // const firstThree = value?.slice(0, 3);
                  // const remainingCount = value?.length - 3;

                  // if (remainingCount > 0) {
                  //   valueList = [...firstThree, `+${remainingCount}`];
                  // } else {
                  //   valueList = [firstThree];
                  // }
                } else if (isArray) {
                  if (Array.isArray(value) && value.length > 0) {
                    valueList = [`${value.length} items`];
                  } else {
                    valueList = [null];
                  }
                } else if (typeof value === "object") {
                  valueList = [`${Object.keys(value).length} items`];
                } else if (
                  schema.type === "boolean" ||
                  typeof value === "boolean"
                ) {
                  valueList = [value.toString()];
                } else {
                  valueList = [value ?? ""];
                }

                return (
                  <div key={propName} className={clsx("sdk:w-full")}>
                    <div className="sdk:text-[var(--sdk-muted-foreground)] sdk:text-[12px] sdk:pb-[10px]">
                      {propName}
                    </div>
                    <div
                      className={clsx(
                        (!isNew || value) &&
                          "sdk:flex sdk:flex-wrap sdk:gap-[10px]"
                      )}>
                      {/* Render array values if type is array, else render single value */}
                      {valueList.map((info: string | null | number) => {
                        // Prefer a unique value for key, fallback to propName+info
                        const key =
                          typeof info === "string" || typeof info === "number"
                            ? `${propName}-${info}`
                            : `${propName}-${JSON.stringify(info)}`;
                        return (
                          <div
                            key={key}
                            className={clsx(
                              "sdk:p-[4px] sdk:bg-[var(--sdk-bg-black-light)] sdk:text-[12px] sdk:text-[var(--sdk-color-text-primary)] "
                            )}>
                            {!info && info !== 0 && (
                              <div
                                className={clsx(
                                  "sdk:h-[23px] sdk:w-full sdk:bg-[var(--sdk-bg-black-light)]",
                                  "sdk:w-[100px]!"
                                )}
                              />
                            )}
                            {(info || info === 0) && (
                              <pre
                                style={{
                                  whiteSpace: "pre-wrap",
                                  wordBreak: "break-all",
                                  margin: 0,
                                  display: "-webkit-box",
                                  WebkitLineClamp:
                                    typeof info === "object" ? "unset" : 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}>
                                {info}
                              </pre>
                            )}
                          </div>
                        );
                      })}
                      {/* When isNew and valueList is empty, render a placeholder div for visual consistency */}
                      {/* {isNew && valueList.length === 0 && (
                    <div
                      className={clsx(
                        "sdk:h-[23px] sdk:w-full sdk:bg-[var(--sdk-bg-black-light)]",
                        schema.type !== "string" && "sdk:w-[100px]!"
                      )}
                    />
                  )} */}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
        {/* <div className="sdk:h-[14px] sdk:relative sdk:flex ">
          <div
            className={clsx(
              " sdk:bg-[var(--sdk-bg-accent)] sdk:flex-1 sdk:border sdk:border-[var(--sdk-color-bg-primary)] sdk:group-hover:border-[var(--sdk-border-foreground)]",
              "sdk:border-t-[var(--sdk-bg-accent)]! sdk:border-r-[var(--sdk-bg-accent)]!",
              selected && "sdk:border-[var(--sdk-border-foreground)]!"
            )}
          />
          <Hypotenuse
            className={clsx(
              "sdk:w-[17px] sdk:h-[14px] sdk:text-[var(--sdk-color-bg-primary)]  sdk:group-hover:text-[var(--sdk-color-text-secondary)]",
              selected && "sdk:text-[var(--sdk-border-foreground)]!"
            )}
          />
        </div> */}
      </div>
      <div className="sdk:relative ">
        {agentLogs && (
          <AccordionLogs
            agentLogs={agentLogs}
            onShowLogsDialog={onShowLogsDialog}
          />
        )}
      </div>
    </div>
  );
}
