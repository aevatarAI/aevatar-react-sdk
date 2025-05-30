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
  className = "",
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
      data-testid="aevatar-card"
      onClick={() => {
        onClick?.(agentInfo, isNew, nodeId);
      }}>
      <div
        className={`sdk:aevatar-item-background sdk:w-[234px] sdk:cutCorner sdk:border sdk:border-[#141415] sdk:cutCorner-border sdk:hover:border-[#303030] ${className}`}>
        <div className="sdk:pb-[12px] sdk:pt-[16px] sdk:pr-[14px] sdk:pl-[14px] sdk:border-b sdk:border-[var(--sdk-border-color)] sdk:border-solid">
          <div className="sdk:flex sdk:justify-between sdk:items-center sdk:pb-[9px]">
            <div
              className="sdk:font-syne sdk:text-white sdk:text-[15px] sdk:font-semibold sdk:leading-normal sdk:truncate sdk:max-w-[calc(100%-32px)]" /* Single line, overflow ellipsis */
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
          <div className="sdk:font-pro sdk:text-[#B9B9B9] sdk:text-[11px] sdk:font-normal sdk:leading-normal sdk:truncate">
            {agentInfo?.agentType ?? "--"}
          </div>
        </div>
        <div className="sdk:font-pro sdk:pb-[16px] sdk:pt-[12px] sdk:pr-[14px] sdk:pl-[14px] sdk:flex sdk:flex-col sdk:items-start sdk:gap-[12px] sdk:self-stretch">
          {(propertiesInfo ?? []).map((item: [string, JSONSchemaType<any>]) => {
            // Extract property name and schema
            const [propName, schema] = item;

            const isArray = schema.type === "array";

            let value = schema.value;

            if (schema.enum) {
              const valueIndex = schema.enum.indexOf(schema.value);
              value = schema["x-enumNames"]?.[valueIndex];
            }

            // Always treat value as an array for uniform rendering
            const valueList =
              isArray && Array.isArray(value)
                ? value
                : !isArray &&
                  value !== undefined &&
                  value !== null &&
                  value !== ""
                ? [value]
                : [];
            // Only filter out empty values and arrays when not isNew
            if (
              !isNew &&
              (valueList.length === 0 ||
                valueList.every(
                  (v) =>
                    v === undefined ||
                    v === null ||
                    v === "" ||
                    (Array.isArray(v) && v.length === 0)
                ))
            ) {
              return null;
            }
            return (
              <div key={propName} className={clsx(isNew && "sdk:w-full")}>
                <div className="sdk:text-[var(--sdk-gray-text)] sdk:text-[11px] sdk:pb-[10px]">
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
                        <pre
                          style={{
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-all",
                            margin: 0,
                          }}>
                          {/* If value is object, render as JSON string */}

                          {typeof info === "object"
                            ? JSON.stringify(info, null, 2)
                            : typeof info === "boolean"
                            ? info.toString() // Render boolean as string
                            : info}
                        </pre>
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
    </div>
  );
}
