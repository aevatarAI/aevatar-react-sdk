import type { IAgentInfoDetail } from "@aevatar-react-sdk/services";
import Setting from "../../assets/svg/setting.svg?react";
import { useCallback, useMemo } from "react";
import { jsonSchemaParse } from "../../utils/jsonSchemaParse";

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
    <div className={className}>
      <div className="sdk:pb-[12px] sdk:pt-[12px] sdk:pr-[14px] sdk:pl-[14px] sdk:border-b sdk:border-[#303030] sdk:border-solid">
        <div className="sdk:flex sdk:justify-between sdk:items-center">
          <div className="sdk:flex sdk:font-syne sdk:text-white sdk:text-[15px] sdk:font-semibold  sdk:lowercase sdk:leading-[18px]">
            <div>{`${props.name}`}</div>
          </div>
          <Setting
            role="img"
            className="sdk:cursor-pointer sdk:text-[#B9B9B9] sdk:lg:hover:text-white"
            onClick={() => onEditGaevatar(props.id)}
          />
        </div>
        {/* <div className="sdk:font-mono sdk:text-[#B9B9B9] sdk:text-[11px] sdk:font-normal sdk:leading-normal sdk:lowercase">
          id: {props.id}
        </div> */}
      </div>
      <div className="sdk:pb-[6px] sdk:pt-[12px] sdk:pr-[14px] sdk:pl-[14px] sdk:flex sdk:flex-col sdk:items-start sdk:gap-[12px] sdk:self-stretch">
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
              <div className="sdk:text-[#606060] sdk:text-[11px] sdk:pb-[10px] sdk:font-pro">
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
                      className="sdk:p-[4px] sdk:bg-[#303030] sdk:text-[11px] sdk:text-white sdk:font-pro">
                      <pre
                        style={{
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-all",
                          margin: 0,
                        }}>
                        {/* If value is object, render as JSON string */}
                        {typeof info === "object"
                          ? JSON.stringify(info, null, 2)
                          : info}
                      </pre>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
