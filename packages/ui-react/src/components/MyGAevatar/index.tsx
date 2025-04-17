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
  const { toast } = useToast();

  const fetchAllList = useCallback(async () => {
    let pageIndex = 0;
    let allData: any[] = [];
    let currentPageData: any[] = [];

    while (true) {
      try {
        currentPageData = await aevatarAI.services.agent.getAgents({
          pageIndex,
          pageSize: 10,
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
      await fetchAllList();
    } catch (error) {
      toast({
        title: "error",
        description: handleErrorMessage(error, "Something went wrong."),
        duration: 3000,
      });
      setShow(false);
    }
  }, [setShow, toast, fetchAllList]);

  useEffect(() => {
    getGAevatarList();
  }, [getGAevatarList]);

  const newGA = useMemo(
    () => (
      <Button
        className="sdk:p-[8px] sdk:px-[18px] sdk:gap-[10px] sdk:text-[#fff] sdk:hover:text-[#303030]"
        onClick={onNewGAevatar}>
        <AddIcon style={{ width: 14, height: 14 }} />
        <span className="sdk:text-center sdk:font-syne sdk:text-[12px] sdk:font-semibold sdk:lowercase sdk:leading-[14px]">
          new g-agent
        </span>
      </Button>
    ),
    [onNewGAevatar]
  );

  return (
    <div
      className={clsx(
        "sdk:relative sdk:bg-black sdk:flex sdk:flex-col aevatarai-gaevatar-list-wrapper",
        className
      )}
      style={{ height, width }}>
      <CommonHeader
        leftEle={"my g-agents"}
        rightEle={
          gAevatarList &&
          (maxGAevatarCount ? maxGAevatarCount >= gAevatarList.length : true) &&
          newGA
        }
      />

      <div
        className={clsx(
          "sdk:overflow-auto sdk:flex-1 sdk:lg:pb-[40px] sdk:pb-[16px]",
          !gAevatarList && "sdk:flex sdk:justify-center sdk:items-center"
        )}>
        {(!gAevatarList || gAevatarList?.length === 0) && (
          <div className="sdk:flex sdk:flex-col sdk:justify-center sdk:items-center sdk:gap-[20px]">
            <EmptyIcon role="img" data-testid="empty-icon" id="empty-icon" />
            {newGA}
          </div>
        )}
        {gAevatarList && (
          <div
            className={clsx(
              "sdk:grid sdk:grid-cols-1 sdk:place-items-center sdk:pt-[23px] sdk:gap-[20px]",
              "sdk:md:grid-cols-3 sdk:md:max-w-[762px] sdk:md:pt-[0] sdk:mx-auto",
              "sdk:aevatarai-gaevatar-list"
            )}>
            {gAevatarList?.map((gAevatar, index) => (
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
