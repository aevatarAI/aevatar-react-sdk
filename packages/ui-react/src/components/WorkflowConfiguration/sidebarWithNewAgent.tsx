import type React from "react";
import { useCallback, useMemo, useState } from "react";
import { SearchBar } from "../ui";
import clsx from "clsx";
import type { IAgentsConfiguration } from "@aevatar-react-sdk/services";
import { type IDragItem, useDnD } from "../Workflow/DnDContext";
import AevatarTypeItem from "./aevatarTypeItem";

export interface IWorkflowSidebarWithNewAgentProps {
  gaevatarTypeList?: IAgentsConfiguration[];
  hiddenGAevatarType?: string[];
}

export default function SidebarWithNewAgent({
  gaevatarTypeList,
  hiddenGAevatarType,
}: IWorkflowSidebarWithNewAgentProps) {
  const [_, setDragItem] = useDnD();

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

  const onDragStart = useCallback(
    (event: React.DragEvent<HTMLDivElement>, dragItem: IDragItem) => {
      setDragItem(dragItem);
      event.dataTransfer.effectAllowed = "move";
    },
    [setDragItem]
  );

  return (
    <div
      className={clsx(
        "sdk:bg-[#000000] sdk:relative ",
        "sdk:w-full sdk:border-b-[1px] sdk:border-b-[#303030] sdk:overflow-x-auto",
        "sdk:sm:w-[152px]  sdk:sm:h-full sdk:sm:border-r-[1px] sdk:sm:border-b-[0px] sdk:sm:border-b-[#303030] sdk:sm:border-r-[#303030]"
      )}>
      <div
        className={clsx(
          "sdk:box-border  sdk:p-0 sdk:relative sdk:w-full  sdk:hidden",
          "sdk:sm:block"
        )}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="search"
          className="sdk:w-full"
          onDebounceChange={(v) => {
            console.log("v", v);
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
        )}>
        {filteredGaevatarTypeList?.map((ele) => {
          if (hiddenGAevatarType?.includes(ele?.agentType)) {
            return null;
          }
          return (
            <AevatarTypeItem
              key={ele?.agentType}
              agentType={ele?.agentType}
              description={(ele as any)?.description || ele?.fullName}
              onDragStart={(event) =>
                onDragStart(event, {
                  agentInfo: {
                    agentType: ele?.agentType,
                    propertyJsonSchema: ele?.propertyJsonSchema,
                  },
                  nodeType: "new",
                })
              }
              draggable
            />
          );
        })}
      </div>
    </div>
  );
}
