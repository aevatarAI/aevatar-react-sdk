import type { IAgentInfoDetail } from "@aevatar-react-sdk/services";
import Setting from "../../assets/svg/setting.svg?react";
import { useCallback, useMemo } from "react";

export interface IAevatarCardInnerProps {
  className?: string;
  onEditGaevatar: (id: string) => void;
}

export default function AevatarCardInner({
  className,
  properties,
  onEditGaevatar,
  ...props
}: IAevatarCardInnerProps & IAgentInfoDetail) {
  const propertiesInfo = useMemo(() => {
    let _properties: Record<string, string[] | string>;
    try {
      _properties = JSON.parse((properties ?? "{}") as any);
      // biome-ignore lint/correctness/noUnusedVariables: <explanation>
    } catch (error) {
      _properties = properties;
    }
    return Object.entries(_properties);
  }, [properties]);

  const propertiesValue = useCallback((value: string | string[]) => {
    if (Array.isArray(value)) return value;
    return [value];
  }, []);

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
        {/* Only render property if value exists and is not empty */}
        {propertiesInfo
          .filter((item) => {
            const value = item[1];
            if (Array.isArray(value)) return value.length > 0;
            if (typeof value === "string") return value.trim() !== "";
            return !!value;
          })
          .map((item) => (
            <div key={item[0]}>
              <div className="sdk:text-[#606060] sdk:text-[11px] sdk:pb-[10px] sdk:font-pro">
                {item[0]}
              </div>
              <div className="sdk:flex sdk:flex-wrap sdk:gap-[10px]">
                {propertiesValue(item[1]).map((info) => (
                  <div
                    className="sdk:p-[4px] sdk:bg-[#303030] sdk:text-[11px] sdk:text-white sdk:font-pro"
                    key={info}>
                    <pre
                      style={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-all",
                        margin: 0,
                      }}>
                      {typeof info === "object"
                        ? JSON.stringify(info, null, 2)
                        : info}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
