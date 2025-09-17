import type { IAgentInfoDetail } from "@aevatar-react-sdk/services";
import SuccessCheck from "../../assets/svg/successCheck.svg?react";
import Hypotenuse from "../../assets/svg/hypotenuse.svg?react";
import ErrorIcon from "../../assets/svg/errorIcon.svg?react";
import "./index.css";
import { useCallback, useMemo } from "react";
import { jsonSchemaParse } from "../../utils/jsonSchemaParse";
import type { JSONSchemaType } from "../types";
import clsx from "clsx";
import type { TNodeDataClick } from "../Workflow/types";
import HoverMenu from "./HoverMenu";
import type { ExecutionLogStatus } from "@aevatar-react-sdk/types";
import Loading from "../../assets/svg/loading.svg?react";
export interface IAevatarCardInnerProps {
  className?: string;
  isNew?: boolean;
  onClick?: TNodeDataClick;
  deleteNode: (nodeId: string) => void;
  nodeId?: string;
  agentInfo?: IAgentInfoDetail & { defaultValues?: Record<string, any[]> };
  selected?: boolean;
  agentStatus?: ExecutionLogStatus;
}

export default function AevatarCardInner({
  className = "",
  isNew,
  onClick,
  deleteNode,
  nodeId,
  agentInfo,
  selected,
  agentStatus,
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

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
    <div
      data-testid="aevatar-card"
      className="sdk:group sdk:relative"
      onClick={(e) => {
        onClick?.(agentInfo, isNew, nodeId);
      }}>
      <HoverMenu
        triggerClassName="sdk:group-hover:block sdk:hidden sdk:absolute sdk:-top-0 sdk:right-[0px]"
        onDelete={handleDeleteClick}
      />
      <div
        className={clsx(
          "sdk:aevatar-item-background sdk:w-[234px]  sdk:border sdk:border-[var(--sdk-color-bg-primary)]  sdk:group-hover:border-[var(--sdk-border-foreground)]",
          selected && "sdk:border-[var(--sdk-border-foreground)]! ",
          "sdk:border-b-[var(--sdk-bg-accent)]!",
          "sdk:max-h-[300px] sdk:overflow-y-auto",
          className
        )}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}>
        <div className="sdk:pb-[12px] sdk:pt-[16px] sdk:pr-[14px] sdk:pl-[14px] sdk:border-b sdk:border-[var(--sdk-border-color)] sdk:border-solid">
          <div className="sdk:flex sdk:justify-between sdk:items-center sdk:pb-[9px]">
            <div
              className="sdk:font-geist sdk:text-[var(--sdk-color-text-primary)] sdk:text-[15px] sdk:font-semibold sdk:leading-normal sdk:truncate sdk:max-w-[calc(100%-32px)]" /* Single line, overflow ellipsis */
            >{`${agentInfo?.name || "agent name"}`}</div>

            {agentStatus === "success" && (
              <SuccessCheck
                className="sdk:text-[var(--sdk-bg-background)]"
                width={14}
                height={14}
              />
            )}
            {agentStatus === "failed" && (
              <ErrorIcon className="sdk:text-[var(--sdk-bg-background)]" />
            )}
            {(agentStatus === "pending" || agentStatus === "running") && (
              <Loading
                key={"save"}
                className={clsx("aevatarai-loading-icon")}
                style={{ width: 14, height: 14 }}
              />
            )}
          </div>
          <div className="sdk:font-geist sdk:text-[var(--sdk-muted-foreground)] sdk:text-[12px] sdk:font-normal sdk:leading-normal sdk:truncate">
            {agentInfo?.agentType
              ? agentInfo?.agentType?.split(".")?.pop()
              : "--"}
          </div>
        </div>
        <div className="sdk:font-geist sdk:pb-[6px] sdk:pt-[12px] sdk:pr-[14px] sdk:pl-[14px] sdk:flex sdk:flex-col sdk:items-start sdk:gap-[12px] sdk:self-stretch">
          {(propertiesInfo ?? []).map((item: [string, JSONSchemaType<any>]) => {
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
                    (!isNew || value) && "sdk:flex sdk:flex-wrap sdk:gap-[10px]"
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
          })}
        </div>
      </div>
      <div className="sdk:h-[14px] sdk:relative sdk:flex ">
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
      </div>
    </div>
  );
}
