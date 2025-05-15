import { useCallback, useMemo } from "react";
import { type IDragItem, useDnD } from "../Workflow/DnDContext";
import AevatarItemMini from "./aevatarItemMini";
import type {
  IAgentInfoDetail,
  IAgentsConfiguration,
} from "@aevatar-react-sdk/services";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import clsx from "clsx";
export interface IWorkflowSidebarProps {
  gaevatarList?: IAgentInfoDetail[];
  isNewGAevatar?: boolean;
  gaevatarTypeList?: IAgentsConfiguration[];
  disabledGeavatarIds?: string[];
}
export default function Sidebar({
  gaevatarList,
  disabledGeavatarIds,
  isNewGAevatar = true,
  gaevatarTypeList,
}: IWorkflowSidebarProps) {
  const [_, setDragItem] = useDnD();

  const onDragStart = useCallback(
    (event: React.DragEvent<HTMLDivElement>, dragItem: IDragItem) => {
      setDragItem(dragItem);
      event.dataTransfer.effectAllowed = "move";
    },
    [setDragItem]
  );

  const [agentDataMap, agentTypeDataMap] = useMemo(() => {
    const agentMap: Map<string, IAgentInfoDetail[]> = new Map();
    const agentTypeMap: Map<string, IAgentsConfiguration> = new Map();

    if (!gaevatarList) return [agentMap, agentTypeMap];

    gaevatarTypeList?.forEach((item) => {
      agentTypeMap.set(item.agentType, item);
      if (agentMap.has(item.agentType)) return;
      agentMap.set(item.agentType, []);
    });

    gaevatarList.forEach((agent) => {
      if (!agentMap.has(agent.agentType)) {
        agentMap.set(agent.agentType, []);
      }
      agentMap.get(agent.agentType)?.push(agent);
    });

    return [agentMap, agentTypeMap];
  }, [gaevatarList, gaevatarTypeList]);

  return (
    <aside className="sdk:w-full sdk:sm:w-[184px] sdk:pl-[20px] sdk:pr-0 sdk:py-[16px] sdk:sm:px-[30px] sdk:sm:pt-[29px] sdk:flex sdk:flex-row sdk:sm:flex-col sdk:gap-6 sdk:border-r-1 sdk:workflow-common-border sdk:overflow-auto">
      {Array.from(agentDataMap).map((ele) => (
        <div key={ele[0]}>
          <div
            className={clsx(
              "sdk:workflow-sidebar-title sdk:mb-[28px] sdk:truncate  sdk:sm:hidden",
              ele[0]?.length < 20 && "sdk:block!"
            )}>
            {ele[0]}
          </div>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={clsx(
                    "sdk:workflow-sidebar-title sdk:mb-[28px] sdk:font-syne sdk:truncate sdk:hidden sm:block",
                    ele[0]?.length < 20 ? "sdk:hidden!" : "sdk:sm:block!"
                  )}>
                  {ele[0]}
                </div>
              </TooltipTrigger>
              <TooltipContent
                className="sdk:mt-[20px] sdk:z-1000 sdk:max-w-[200px]"
                side="left">
                {ele[0]}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="sdk:font-pro  sdk:flex sdk:flex-row sdk:sm:flex-col sdk:space-x-4 sdk:sm:space-x-0 sdk:sm:space-y-4">
            {ele[1]?.length > 0 && (
              <div className="sdk:flex sdk:flex-row sdk:sm:flex-col sdk:space-x-4 sdk:sm:space-x-0 sdk:sm:space-y-4">
                {(ele[1] as IAgentInfoDetail[])?.map((item) => (
                  <div key={item.id}>
                    <AevatarItemMini
                      name={item.name}
                      agentType={item.agentType}
                      disabled={disabledGeavatarIds?.includes(item.id)}
                      onDragStart={(event) =>
                        onDragStart(event, {
                          agentInfo: item,
                          nodeType: "default",
                        })
                      }
                      draggable
                    />
                  </div>
                ))}
              </div>
            )}

            <AevatarItemMini
              disabled={!isNewGAevatar}
              isnew={true}
              onDragStart={(event) =>
                onDragStart(event, {
                  agentInfo: {
                    agentType: ele[0],
                    propertyJsonSchema: agentTypeDataMap.get(ele[0])
                      ?.propertyJsonSchema,
                  },
                  nodeType: "new",
                })
              }
              draggable
            />
          </div>
        </div>
      ))}
    </aside>
  );
}
