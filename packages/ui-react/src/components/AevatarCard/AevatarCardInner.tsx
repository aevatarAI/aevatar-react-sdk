import type { IAgentInfoDetail } from "@aevatar-react-sdk/services";
import Setting from "../../assets/svg/setting.svg?react";
import { useMemo } from "react";
import { jsonSchemaParse } from "../../utils/jsonSchemaParse";
import clsx from "clsx";
import CardLoading from "../CardLoading";

export interface IAevatarCardInnerProps {
  className?: string;
  onEditGaevatar: (id: string) => void;
}

export default function AevatarCardInner({
  className,
  properties,
  propertyJsonSchema,
  onEditGaevatar,
  ...props
}: IAevatarCardInnerProps & IAgentInfoDetail) {
  const propertiesInfo = useMemo(
    () => jsonSchemaParse(propertyJsonSchema, properties),
    [propertyJsonSchema, properties]
  );

  return (
    <div
      className={clsx(
        "sdk:w-full sdk:h-full sdk:flex sdk:flex-col",
        className
      )}>
      <div className="sdk:pb-[12px] sdk:pt-[12px] sdk:pr-[14px] sdk:pl-[14px] sdk:border-b sdk:border-[var(--sdk-bg-black-light)] sdk:border-solid">
        <div className="sdk:flex sdk:justify-between sdk:items-center">
          <div className="sdk:font-geist sdk:text-[var(--sdk-color-text-primary)] sdk:text-[15px] sdk:font-semibold  sdk:leading-[18px] sdk:whitespace-nowrap sdk:overflow-hidden sdk:text-ellipsis sdk:max-w-[calc(100%-32px)]">
            {/* Ensure name is single line with ellipsis on overflow and does not overlap setting button */}
            {`${props.name}`}
          </div>
          <Setting
            role="img"
            className="sdk:cursor-pointer sdk:text-[var(--sdk-muted-foreground)] sdk:lg:hover:text-[var(--sdk-color-text-primary)]"
            onClick={() => onEditGaevatar(props.id)}
          />
        </div>
      </div>
      <div className="sdk:pb-[6px] sdk:pt-[12px] sdk:pr-[14px] sdk:pl-[14px] sdk:flex sdk:flex-col sdk:items-start sdk:gap-[12px] sdk:self-stretch sdk:flex-1">
        {/* Render properties using enhanced logic: support array, enum, object, and filter empty values */}
        {(propertiesInfo ?? []).map((item: [string, any]) => {
          // Extract property name and schema
          const [propName, schema] = item;
          const isArray = schema.type === "array";

          let value = schema.value;

          // Handle enum display
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
          // Only render if valueList is not empty
          if (
            valueList.length === 0 ||
            valueList.every(
              (v) =>
                v === undefined ||
                v === null ||
                v === "" ||
                (Array.isArray(v) && v.length === 0)
            )
          ) {
            return null;
          }
          return (
            <div key={propName}>
              <div className="sdk:text-[var(--sdk-muted-foreground)] sdk:text-[12px] sdk:pb-[10px] sdk:font-geist">
                {propName}
              </div>
              <div className="sdk:flex sdk:flex-wrap sdk:gap-[10px]">
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
                      className="sdk:p-[4px] sdk:bg-[var(--sdk-bg-black-light)] sdk:text-[12px] sdk:text-[var(--sdk-color-text-primary)] sdk:font-geist">
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
              </div>
            </div>
          );
        })}
        {typeof propertyJsonSchema === "undefined" && (
          <CardLoading className="sdk:w-full" />
        )}
      </div>
    </div>
  );
}
