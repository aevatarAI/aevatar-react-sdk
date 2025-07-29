import type { IAgentInfoDetail } from "@aevatar-react-sdk/services";
import Delete from "../../assets/svg/delete.svg?react";
import Hypotenuse from "../../assets/svg/hypotenuse.svg?react";
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
  agentInfo?: IAgentInfoDetail & { defaultValues?: Record<string, any[]> };
  selected?: boolean;
}

export default function AevatarCardInner({
  className = "",
  isNew,
  onClick,
  deleteNode,
  nodeId,
  agentInfo,
  selected,
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
      ),
    [agentInfo, isNew]
  );

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
    <div
      data-testid="aevatar-card"
      className="sdk:group"
      onClick={(e) => {
        onClick?.(agentInfo, isNew, nodeId);
      }}>
      <div
        className={clsx(
          "sdk:aevatar-item-background sdk:w-[234px]  sdk:border sdk:border-[#141415]  sdk:group-hover:border-[#303030]",
          selected && "sdk:border-[#AFC6DD]! ",
          "sdk:border-b-[0px]!",
          className
        )}>
        <div className="sdk:pb-[12px] sdk:pt-[16px] sdk:pr-[14px] sdk:pl-[14px] sdk:border-b sdk:border-[var(--sdk-border-color)] sdk:border-solid">
          <div className="sdk:flex sdk:justify-between sdk:items-center sdk:pb-[9px]">
            <div
              className="sdk:font-outfit sdk:text-white sdk:text-[15px] sdk:font-semibold sdk:leading-normal sdk:truncate sdk:max-w-[calc(100%-32px)]" /* Single line, overflow ellipsis */
            >{`${agentInfo?.name ?? "agent name"}`}</div>

            {isNew ? (
              <DeleteWorkflowGAevatar handleDeleteClick={handleDeleteClick} />
            ) : (
              <Delete
                className="sdk:cursor-pointer sdk:text-[#606060]"
                onClick={handleDeleteClick}
              />
            )}
          </div>
          <div className="sdk:font-outfit sdk:text-[#B9B9B9] sdk:text-[12px] sdk:font-normal sdk:leading-normal sdk:truncate">
            {agentInfo?.agentType
              ? agentInfo?.agentType?.split(".")?.pop()
              : "--"}
          </div>
        </div>
        <div className="sdk:font-outfit sdk:pb-[6px] sdk:pt-[12px] sdk:pr-[14px] sdk:pl-[14px] sdk:flex sdk:flex-col sdk:items-start sdk:gap-[12px] sdk:self-stretch">
          {(propertiesInfo ?? []).map((item: [string, JSONSchemaType<any>]) => {
            // Extract property name and schema
            const [propName, schema] = item;

            const isArray = schema.type === "array";

            let value = schema.value;

            let valueList = [value];
            if (isNew) {
              valueList = [];
            } else if (value === undefined || value === null || value === "") {
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
            console.log(valueList, value, schema, propName, "valueList==");

            return (
              <div key={propName} className={clsx(isNew && "sdk:w-full")}>
                <div className="sdk:text-[#6F6F6F] sdk:text-[12px] sdk:pb-[10px]">
                  {propName}
                </div>
                <div
                  className={clsx(
                    (!isNew || value) && "sdk:flex sdk:flex-wrap sdk:gap-[10px]"
                  )}>
                  {/* Render array values if type is array, else render single value */}
                  {valueList.map((info) => {
                    // Prefer a unique value for key, fallback to propName+info
                    const key =
                      typeof info === "string" || typeof info === "number"
                        ? `${propName}-${info}`
                        : `${propName}-${JSON.stringify(info)}`;
                    return (
                      <div
                        key={key}
                        className={clsx(
                          "sdk:p-[4px] sdk:bg-[var(--sdk-border-color)] sdk:text-[12px] sdk:text-white "
                        )}>
                        {!info && (
                          <div
                            className={clsx(
                              "sdk:h-[23px] sdk:w-full sdk:bg-[#303030]",
                              "sdk:w-[100px]!"
                            )}
                          />
                        )}
                        {info && (
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
                  {isNew && valueList.length === 0 && (
                    <div
                      className={clsx(
                        "sdk:h-[23px] sdk:w-full sdk:bg-[#303030]",
                        schema.type !== "string" && "sdk:w-[100px]!"
                      )}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="sdk:h-[14px] sdk:relative sdk:flex ">
        <div
          className={clsx(
            " sdk:bg-[#141415] sdk:flex-1 sdk:border sdk:border-[#141415] sdk:group-hover:border-[#303030]",
            " sdk:border-t-[0px] sdk:border-r-[0px]",
            selected && "sdk:border-[#AFC6DD]!"
          )}
        />
        <Hypotenuse
          className={clsx(
            "sdk:w-[17px] sdk:h-[14px] sdk:text-[#141415]  sdk:group-hover:text-[#303030]",
            selected && "sdk:text-[#AFC6DD]!"
          )}
        />
      </div>
    </div>
  );
}
