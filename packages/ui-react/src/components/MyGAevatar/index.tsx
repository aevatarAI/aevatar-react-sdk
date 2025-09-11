import { useAtom } from "jotai";
import PageLoading from "../PageLoading";
import { loadingAtom } from "../../state/atoms";
import EmptyIcon from "../../assets/svg/empty-gaevatar.svg?react";
import clsx from "clsx";
import AevatarCard from "../AevatarCard";
import { Button } from "../ui";
import AddIcon from "../../assets/svg/add.svg?react";
import "./index.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import { sleep } from "@aevatar-react-sdk/utils";
import type { IAgentInfoDetail } from "@aevatar-react-sdk/services";
import CommonHeader from "../CommonHeader";
import { aevatarAI } from "../../utils";
import { useToast } from "../../hooks/use-toast";
import { handleErrorMessage } from "../../utils/error";
import { useAevatar } from "../context/AevatarProvider";

export interface IMyGAevatarProps {
  height?: number | string;
  width?: number | string;
  className?: string;
  maxGAevatarCount?: number;
  onNewGAevatar?: () => void;
  onEditGaevatar: (id: string) => void;
}

export default function MyGAevatar({
  height = "100vh",
  width,
  className,
  maxGAevatarCount,
  onNewGAevatar,
  onEditGaevatar,
}: IMyGAevatarProps) {
  const [, setShow] = useAtom(loadingAtom);
  const [gAevatarList, setGAevatarList] = useState<IAgentInfoDetail[]>();
  const [{ hiddenGAevatarType }] = useAevatar();
  const { toast } = useToast();

  const [agentConfiguration, setAgentConfiguration] =
    useState<Record<string, string>>();

  const getAllAgentsConfiguration = useCallback(async () => {
    try {
      const result = await aevatarAI.services.agent.getAllAgentsConfiguration();
      if (!result) return;
      const configuration: any = {};
      result.forEach((item) => {
        configuration[item.agentType] = item.propertyJsonSchema;
      });
      setAgentConfiguration(configuration);
    } catch (error) {
      toast({
        title: "error",
        description: handleErrorMessage(error, "Something went wrong."),
        duration: 3000,
      });
    }
  }, [toast]);

  const fetchAllList = useCallback(async () => {
    let pageIndex = 0;
    let allData: any[] = [];
    let currentPageData: any[] = [];

    while (true) {
      try {
        currentPageData = await aevatarAI.services.agent.getAgents({
          pageIndex,
          pageSize: 20,
        });
      } catch (error) {
        toast({
          title: "error",
          description: handleErrorMessage(error, "Something went wrong."),
          duration: 3000,
        });
        setShow(false);
        break;
      }

      if (pageIndex === 0) {
        setShow(false);
      }
      if (currentPageData.length === 0) {
        break;
      }

      allData = [...allData, ...currentPageData];
      setGAevatarList(allData);
      pageIndex++;
    }

    return allData;
  }, [setShow, toast]);

  const getGAevatarList = useCallback(async () => {
    setShow(true);

    try {
      getAllAgentsConfiguration();
      await fetchAllList();
    } catch (error) {
      toast({
        title: "error",
        description: handleErrorMessage(error, "Something went wrong."),
        duration: 3000,
      });
      setShow(false);
    }
  }, [setShow, toast, fetchAllList, getAllAgentsConfiguration]);

  useEffect(() => {
    getGAevatarList();
  }, [getGAevatarList]);

  const newGA = useMemo(
    () => (
      <Button
        variant="primary"
        className="sdk:p-[8px] sdk:px-[18px] sdk:gap-[10px]"
        onClick={onNewGAevatar}>
        <AddIcon className="text-[var(--sdk-color-text-tertiary)]" style={{ width: 14, height: 14 }} />
        <span className="sdk:text-center sdk:font-outfit sdk:text-[12px] sdk:font-semibold sdk:leading-[14px]">
          new g-agent
        </span>
      </Button>
    ),
    [onNewGAevatar]
  );

  const aevatarList = useMemo(() => {
    let list = gAevatarList;
    if (hiddenGAevatarType) {
      list = list?.filter(
        (gAevatar) => !hiddenGAevatarType.includes(gAevatar.agentType)
      );
    }
    return list?.map((item) => {
      return {
        ...item,
        propertyJsonSchema: agentConfiguration?.[item.agentType],
      };
    });
  }, [gAevatarList, hiddenGAevatarType, agentConfiguration]);

  return (
    <div
      className={clsx(
        "sdk:relative sdk:bg-[var(--sdk-bg-background)] sdk:flex sdk:flex-col sdk:font-outfit aevatarai-gaevatar-list-wrapper",
        className
      )}
      style={{ height, width }}>
      <CommonHeader
        leftEle={"my g-agents"}
        rightEle={
          aevatarList &&
          (maxGAevatarCount ? maxGAevatarCount > aevatarList.length : true) &&
          newGA
        }
      />

      <div
        className={clsx(
          "sdk:overflow-auto sdk:flex-1 sdk:lg:pb-[40px] sdk:pb-[16px]",
          !aevatarList && "sdk:flex sdk:justify-center sdk:items-center"
        )}>
        {(!aevatarList || aevatarList?.length === 0) && (
          <div className="sdk:flex sdk:flex-col sdk:justify-center sdk:items-center sdk:gap-[20px]">
            <EmptyIcon role="img" data-testid="empty-icon" id="empty-icon" />
            {newGA}
          </div>
        )}
        {aevatarList && (
          <div
            className={clsx(
              "sdk:grid sdk:grid-cols-1 sdk:place-items-center sdk:pt-[23px] sdk:gap-[20px]",
              "sdk:md:grid-cols-3 sdk:md:max-w-[762px] sdk:md:pt-[0] sdk:mx-auto",
              "aevatarai-gaevatar-list"
            )}>
            {aevatarList?.map((gAevatar, index) => (
              <AevatarCard
                agentInfo={gAevatar}
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                key={index}
                onEditGaevatar={onEditGaevatar}
              />
            ))}
          </div>
        )}
      </div>

      <PageLoading />
    </div>
  );
}
