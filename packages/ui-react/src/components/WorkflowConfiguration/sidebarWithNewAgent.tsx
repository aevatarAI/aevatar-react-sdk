import { useMemo, useState } from "react";
import { SearchBar } from "../ui";
import clsx from "clsx";
import type { IAgentsConfiguration } from "@aevatar-react-sdk/services";
import AevatarTypeItem from "./aevatarTypeItem";
import PanelsArrow from "../../assets/svg/panels-arrow.svg?react";
export interface IWorkflowSidebarWithNewAgentProps {
  gaevatarTypeList?: IAgentsConfiguration[];
  hiddenGAevatarType?: string[];
  disabled?: boolean;
  onArrowClick?: () => void;
}

export default function SidebarWithNewAgent({
  gaevatarTypeList,
  hiddenGAevatarType,
  disabled,
  onArrowClick,
}: IWorkflowSidebarWithNewAgentProps) {
  const [search, setSearch] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const filteredGaevatarTypeList = useMemo(() => {
    if (!searchValue) {
      return gaevatarTypeList;
    }
    return gaevatarTypeList?.filter((ele) => {
      return (
        ele?.fullName?.toLowerCase().includes(searchValue.toLowerCase()) ||
        ele?.description?.toLowerCase().includes(searchValue.toLowerCase())
      );
    });
  }, [gaevatarTypeList, searchValue]);

  // const onDragStart = useCallback(
  //   (event: React.DragEvent<HTMLDivElement>, dragItem: IDragItem) => {
  //     setDragItem(dragItem);
  //     event.dataTransfer.effectAllowed = "move";
  //   },
  //   [setDragItem]
  // );

  return (
    <div
      className={clsx(
        "sdk:bg-[var(--sdk-bg-background)] sdk:relative ",
        "sdk:w-full sdk:border-b-[1px] sdk:border-b-[var(--sdk-color-sidebar-border)] sdk:overflow-x-auto",
        "sdk:sm:w-[152px]  sdk:sm:h-full sdk:sm:border-r-[1px] sdk:sm:border-b-[0px] sdk:border-b-[var(--sdk-color-sidebar-border)] sdk:sm:border-r-[var(--sdk-color-sidebar-border)]",
        "sdk:flex sdk:flex-col sdk:h-full"
      )}
    >
      <div
        className={clsx("sdk:flex-1 sdk:overflow-y-auto sdk:flex sdk:flex-col")}
      >
        <div
          className={clsx(
            "sdk:box-border  sdk:p-0 sdk:relative sdk:w-full  sdk:hidden",
            "sdk:sm:block"
          )}
        >
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="search"
            className="sdk:w-full"
            onDebounceChange={(v) => {
              setSearchValue(v);
            }}
          />
        </div>
        <div
          className={clsx(
            "sdk:box-border sdk:flex sdk:flex-row sdk:items-center sdk:gap-[16px] sdk:p-0 sdk:relative sdk:w-full ",
            "sdk:px-[20px] sdk:py-[16px]",
            "sdk:sm:px-[12px] sdk:sm:py-[12px]",
            "sdk:sm:gap-[12px] sdk:sm:flex-col"
          )}
        >
          {filteredGaevatarTypeList?.map((ele) => {
            if (hiddenGAevatarType?.includes(ele?.agentType)) {
              return null;
            }
            return (
              <AevatarTypeItem
                key={ele?.agentType}
                disabled={disabled}
                agentType={ele?.agentType}
                defaultValues={ele?.defaultValues}
                propertyJsonSchema={ele?.propertyJsonSchema}
                description={(ele as any)?.description || ele?.fullName}
              />
            );
          })}
        </div>
      </div>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
      <div
        className={clsx(
          "sdk:absolute sdk:bottom-0 sdk:right-0 ",
          "sdk:p-[6px] sdk:cursor-pointer sdk:w-full sdk:flex sdk:items-center sdk:justify-center ",
          "sdk:bg-[var(--sdk-bg-background)] sdk:hover:bg-[var(--sdk-color-bg-primary)]",
          "sdk:border-t-[1px] sdk:border-t-[var(--sdk-color-border-primary)]",
          "sdk:sm:block sdk:hidden"
        )}
        onClick={() => onArrowClick?.()}
      >
        <PanelsArrow className="sdk:mx-auto" />
      </div>
    </div>
  );
}
