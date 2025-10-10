import EmptyRun from "../../assets/svg/emptyRun.svg?react";
import Close from "../../assets/svg/close.svg?react";
import Clock from "../../assets/svg/clock.svg?react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import {
  Button,
  SearchBar,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui";
import "./executionLogs.css";
import {
  IGetWorkflowLogsLevel,
  type IFetchExecutionLogsResponse,
} from "@aevatar-react-sdk/services";
import { aevatarAI } from "../../utils";
import dayjs from "../../utils/dayjs";
import { Filter, Loader } from "lucide-react";
import { useGetWorkflowLogs } from "../../hooks/useGetWorkflowLogs";
import { EnumExecutionRecordStatus } from "../../hooks/useWorkflowState";

interface IExecutionLogsProps {
  workflowId: string;
  isAgentCardOpen: boolean;
  timeLogs: IFetchExecutionLogsResponse[];
}

export const ExecutionLogs = ({
  workflowId,
  isAgentCardOpen,
  timeLogs,
}: IExecutionLogsProps) => {
  const [isVisible, setIsVisible] = useState(workflowId);

  if (!isVisible) {
    return (
      <ToggleModal isAgentCardOpen={isAgentCardOpen} onToggle={setIsVisible} />
    );
  }

  return (
    <Container>
      {/* <div className="sdk:bg-[var(--sdk-color-border-gray-400)] sdk:min-w-[48px] sdk:max-w-[48px] sdk:min-h-[2px]" /> */}
      <Wrapper isAgentCardOpen={isAgentCardOpen}>
        <ExecutionLogBody
          timeLogs={timeLogs}
          isAgentCardOpen={isAgentCardOpen}
          workflowId={workflowId}
          onClose={() => setIsVisible("")}
        />
      </Wrapper>
    </Container>
  );
};

const logLevelList = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "Information",
    value: IGetWorkflowLogsLevel.Information,
  },
  {
    label: "Warning",
    value: IGetWorkflowLogsLevel.Warning,
  },
  {
    label: "Error",
    value: IGetWorkflowLogsLevel.Error,
  },
  {
    label: "Debug",
    value: IGetWorkflowLogsLevel.Debug,
  },
];

interface IExecutionLogsBodyProps {
  timeLogs?: IFetchExecutionLogsResponse[];
  isAgentCardOpen: boolean;
  workflowId: string;
  onClose: () => void;
}

const ExecutionLogBody = ({
  timeLogs = [],
  workflowId,
  onClose,
}: IExecutionLogsBodyProps) => {
  const [search, setSearch] = useState<string>("");
  const [searchValue, setSearchValue] = useState("");
  const [searchAgentName, setSearchAgentName] = useState("");
  const [selectedLogLevel, setSelectedLogLevel] = useState<string>("all");

  const [selectedRoundId, setSelectedRoundId] = useState<string>("");
  const [selectedAgentGrainId, setSelectedAgentGrainId] =
    useState<string>("all");

  const [workflowState, setWorkflowState] = useState<EnumExecutionRecordStatus>(
    EnumExecutionRecordStatus.Pending
  );

  const {
    data: logsData,
    isLoading,
    stop,
  } = useGetWorkflowLogs({
    workflowId,
    searchValue,
    selectedLogLevel,
    selectedRoundId,
    workflowState,
    selectedAgentGrainId,
  });

  const dateMap = useMemo(() => {
    const map = new Map();
    timeLogs.forEach((date) => {
      map.set(date.roundId.toString(), date);
    });
    if (timeLogs.length > 0) {
      const roundId = timeLogs[0].roundId.toString();
      setSelectedRoundId(roundId);
      const status = map.get(roundId)?.status;
      setWorkflowState(status as EnumExecutionRecordStatus);
    }
    return map;
  }, [timeLogs]);

  const agentMap: Map<string, { agentName: string; grainId: string }> =
    useMemo(() => {
      const curWorkUnitLog = dateMap.get(selectedRoundId);
      const workUnitRecords = JSON.parse(
        curWorkUnitLog?.workUnitRecords ?? "[]"
      );

      const agentMap = new Map<
        string,
        { agentName: string; grainId: string }
      >();

      workUnitRecords.forEach((item) => {
        agentMap.set(item.workUnitGrainId, {
          agentName: item.agentName,
          grainId: item.workUnitGrainId,
        });
      });

      return agentMap;
    }, [dateMap, selectedRoundId]);

  const agentList = useMemo(() => {
    return Array.from(agentMap.values());
  }, [agentMap]);

  // Check if an enum item should be visible based on search with safe conversion
  const isItemVisible = useCallback(
    (name?: string) => {
      if (!name) return false;
      if (!searchAgentName) return true;
      return name
        ?.toLocaleLowerCase()
        .includes(searchAgentName.toLocaleLowerCase());
    },
    [searchAgentName]
  );

  return (
    <div className="sdk:relative sdk:rounded-[4px] sdk:size-full">
      {/* Header */}
      <div className="sdk:flex sdk:items-center sdk:justify-between sdk:p-[8px]">
        <div className="sdk:flex sdk:gap-[4px] sdk:items-center">
          <div>
            <Select
              value={selectedRoundId}
              disabled={!timeLogs?.length}
              onValueChange={(value) => {
                stop();

                setSelectedRoundId(value);
                setSelectedAgentGrainId("all");
                setSearch("");
                setSelectedLogLevel("all");
                const status = dateMap.get(value)?.status;
                setWorkflowState(status as EnumExecutionRecordStatus);
              }}>
              <SelectTrigger
                className={clsx(
                  "sdk:normal-case sdk:w-[165px]  sdk:bg-[var(--sdk-bg-background)] sdk:min-h-[24px] sdk:gap-[6px]  sdk:cursor-pointer",
                  "sdk:border sdk:font-normal sdk:leading-4 sdk:border-[var(--sdk-color-border-primary)] sdk:px-[6px] sdk:py-[4px]",
                  "sdk:text-left"
                )}>
                {dateMap.get(selectedRoundId)?.startTime
                  ? dayjs(dateMap.get(selectedRoundId)?.startTime).format(
                      "YYYY-MM-DD HH:mm:ss"
                    )
                  : "--"}
              </SelectTrigger>
              <SelectContent
                align="start"
                className="sdk:w-[245px]! sdk:p-1! sdk:left-0 sdk:-top-[4px] sdk:bg-[var(--sdk-bg-popover)]">
                {timeLogs?.map((date) => (
                  <SelectItem
                    key={date.roundId}
                    value={date.roundId.toString()}
                    className="sdk:py-1.5 sdk:px-2 sdk:font-normal sdk:text-[var(--sdk-color-text-primary)] sdk:text-sm sdk:leanding-5"
                    selectItemType="checkedChevron">
                    {dayjs(date.startTime).format("YYYY-MM-DD HH:mm:ss")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select
              value={selectedAgentGrainId}
              disabled={!agentMap?.size}
              onValueChange={(value) => {
                setSelectedAgentGrainId(value);
              }}>
              <SelectTrigger
                className={clsx(
                  "sdk:normal-case sdk:min-w-[120px] sdk:max-w-[300px] sdk:bg-[var(--sdk-bg-background)] sdk:min-h-[24px] sdk:gap-[6px]  sdk:cursor-pointer",
                  "sdk:border sdk:font-normal sdk:leading-4 sdk:border-[var(--sdk-color-border-primary)] sdk:px-[6px] sdk:py-[4px]",
                  "sdk:text-left"
                )}>
                {agentMap.get(selectedAgentGrainId)?.agentName ?? "All agents"}
              </SelectTrigger>
              <SelectContent
                align="start"
                className="sdk:min-w-[245px]! sdk:min-h-[200px] sdk:py-1! sdk:px-0! sdk:left-0 sdk:-top-[4px] sdk:bg-[var(--sdk-bg-popover)]">
                <div className="sdk:flex sdk:flex-row sdk:px-1 sdk:mb-[8px] sdk:rounded-[6px_6px_0_0] sdk:overflow-hidden sdk:gap-[4px] sdk:border-b sdk:border-[var(--sdk-color-border-primary)] sdk:border-solid">
                  <SearchBar
                    className="sdk:bg-[var(--sdk-bg-popover)]!"
                    placeholder="Search"
                    value={searchAgentName}
                    onChange={setSearchAgentName}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="sdk:px-1">
                  <SelectItem
                    key={"all"}
                    value={"all"}
                    className={clsx(
                      "sdk:py-1.5 sdk:px-2 sdk:font-normal sdk:text-[var(--sdk-color-text-primary)] sdk:text-sm sdk:leanding-5",
                      searchAgentName && "sdk:hidden"
                    )}
                    selectItemType="checkedChevron">
                    All agents
                  </SelectItem>
                  {agentList?.map((node) => {
                    const isVisible = isItemVisible(node?.agentName);
                    return (
                      <SelectItem
                        key={node?.grainId}
                        value={node?.grainId}
                        className={clsx(
                          "sdk:py-1.5 sdk:px-2 sdk:font-normal sdk:text-[var(--sdk-color-text-primary)] sdk:text-sm sdk:leanding-5",
                          !isVisible && "sdk:hidden"
                        )}
                        selectItemType="checkedChevron">
                        {node?.agentName}
                      </SelectItem>
                    );
                  })}
                </div>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="sdk:flex sdk:items-center sdk:gap-[8px]">
          <SearchBar
            value={search}
            wrapperClassName="sdk:w-[160px]! sdk:border sdk:border-[var(--sdk-color-border-primary)] sdk:rounded-md"
            className=" sdk:bg-[var(--sdk-bg-popover)]! sdk:text-xs  sdk:rounded-md"
            onChange={setSearch}
            placeholder="Search"
            onDebounceChange={(v) => {
              setSearchValue(v);
            }}
          />
          <Close
            className="sdk:text-[var(--sdk-primary-foreground-text)] sdk:cursor-pointer"
            onClick={onClose}
          />
        </div>
      </div>
      {/* Inner */}
      <div>
        <div
          className={clsx(
            "sdk:flex sdk:items-center sdk:gap-[4px]  sdk:border-b sdk:border-[var(--sdk-color-border-primary)] sdk:text-[var(--sdk-muted-foreground)] sdk:text-xs sdk:leanding-4 sdk:font-semibold",
            "sdk:pb-[4px] sdk:mx-[8px]"
          )}>
          <div className="sdk:w-[160px]">Time</div>
          <div>
            <Select
              value={selectedLogLevel}
              onValueChange={(value) => {
                setSelectedLogLevel(value);
              }}>
              <SelectTrigger
                className={clsx(
                  "sdk:normal-case sdk:w-[85px] sdk:min-h-[16px] sdk:text-left sdk:justify-start sdk:gap-[4px] sdk:cursor-pointer",
                  "sdk:border-none sdk:font-normal sdk:leading-4  sdk:p-0",
                  "sdk:text-[var(--sdk-muted-foreground)] sdk:text-xs sdk:leanding-4 sdk:font-semibold"
                )}
                childClassName="sdk:w-auto!"
                downIcon={
                  <Filter
                    className="sdk:text-[var(--sdk-muted-foreground)]"
                    size={14}
                  />
                }>
                Type
              </SelectTrigger>
              <SelectContent
                align="start"
                className="sdk:w-[159px]! sdk:p-1! sdk:left-0 sdk:-top-[4px] sdk:bg-[var(--sdk-bg-popover)]">
                {logLevelList?.map((date) => (
                  <SelectItem
                    key={date.value}
                    value={date.value}
                    className="sdk:py-1.5 sdk:px-2 sdk:font-normal sdk:text-[var(--sdk-color-text-primary)] sdk:text-sm sdk:leanding-5"
                    selectItemType="checkedChevron">
                    {date.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="sdk:flex-1">Message</div>
        </div>
        <div className="sdk:pt-[6px] sdk:h-[176px] sdk:overflow-y-auto sdk:px-[8px] sdk:pb-[8px]">
          {logsData?.map((item, index) => (
            <div
              key={`${item.timestamp}-${index}`}
              className={clsx(
                "sdk:flex sdk:items-start sdk:gap-[4px] sdk:text-xs sdk:leanding-4 sdk:font-normal",
                "sdk:py-[4px]"
              )}>
              <div className="sdk:w-[160px] sdk:text-[var(--sdk-muted-foreground)]">
                {dayjs(item.timestamp).format("YYYY-MM-DD HH:mm:ss")}
              </div>
              <div
                className={clsx(
                  "sdk:w-[85px]",
                  (item.appLog.level === IGetWorkflowLogsLevel.Information ||
                    !item.appLog.level) &&
                    "sdk:text-[var(--sdk-color-text-primary)]",
                  item.appLog.level === IGetWorkflowLogsLevel.Debug &&
                    "sdk:text-[var(--sdk-color-text-primary)]",
                  item.appLog.level === IGetWorkflowLogsLevel.Warning &&
                    "sdk:text-[var(--sdk-color-warning-yellow)]",
                  item.appLog.level === IGetWorkflowLogsLevel.Error &&
                    "sdk:text-[var(--sdk-color-destructive)]"
                )}>
                {item.appLog.level}
              </div>
              <div
                className={clsx(
                  "sdk:flex-1 sdk:whitespace-pre-wrap sdk:break-all",
                  (item.appLog.level === IGetWorkflowLogsLevel.Information ||
                    !item.appLog.level) &&
                    "sdk:text-[var(--sdk-color-text-primary)]",
                  item.appLog.level === IGetWorkflowLogsLevel.Debug &&
                    "sdk:text-[var(--sdk-color-text-primary)]",
                  item.appLog.level === IGetWorkflowLogsLevel.Error &&
                    "sdk:text-[var(--sdk-color-destructive)]",
                  item.appLog.level === IGetWorkflowLogsLevel.Warning &&
                    "sdk:text-[var(--sdk-color-warning-yellow)]"
                )}>
                {item.appLog.message}
              </div>
            </div>
          ))}
          {!logsData?.length && !isLoading && <EmptyExecutionLog />}
          {isLoading && (
            <div className="sdk:flex sdk:justify-center sdk:items-center sdk:h-full">
              <Loader
                key="logsLoading"
                size={24}
                className="sdk:animate-spin"
                style={{ animationDuration: "2s" }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Container = ({ children }: { children: any }) => {
  return (
    <div className="sdk:min-w-[100%] sdk:flex sdk:flex-col sdk:gap-[2px] sdk:justify-items-center aevatarai-execution-logs-wrapper">
      {children}
    </div>
  );
};

const Wrapper = ({
  isAgentCardOpen,
  children,
}: {
  isAgentCardOpen: boolean;
  children: any;
}) => {
  return (
    <div
      className={clsx(
        "sdk:flex sdk:flex-col sdk:flex-1 sdk:gap-2 sdk:bg-[var(--sdk-sidebar-background)] sdk:border sdk:border-[var(--sdk-color-border-primary)] sdk:rounded-sm ",
        `${
          isAgentCardOpen ? "sdk:max-w-[calc(100%-393px)]" : "sdk:min-w-[100%]"
        } `
      )}>
      {children}
    </div>
  );
};

const EmptyExecutionLog = () => {
  return (
    <div className="sdk:overflow-y-hidden sdk:min-w-[100%] sdk:flex sdk:items-center sdk:justify-center sdk:pt-[50px]">
      <div className="sdk:flex sdk:flex-col sdk:gap-4 sdk:items-center">
        <EmptyRun />
        <span className="sdk:text-[var(--sdk-color-text-primary)] sdk:text-[13px]">
          Run your workflow to view execution logs here.
        </span>
      </div>
    </div>
  );
};

interface ToggleModalProps {
  isAgentCardOpen: boolean;
  onToggle: (callback: any) => void;
}

const ToggleModal = ({ isAgentCardOpen, onToggle }: ToggleModalProps) => {
  return (
    <Button
      variant="outline"
      type="button"
      className={`sdk:absolute sdk:bottom-[22px] ${
        isAgentCardOpen ? "sdk:right-[60%]" : ""
      } sdk:flex sdk:gap-[5px] sdk:items-center sdk:pt-[8px] sdk:pb-[8px] sdk:pl-[18px] sdk:pr-[18px] sdk:border sdk:border-[var(--sdk-color-border-primary)] sdk:cursor-pointer`}
      onClick={() => {
        onToggle((prev) => !prev);
      }}>
      <div className="sdk:flex sdk:flex-row sdk:gap-[5px] sdk:items-center">
        <Clock
          className="sdk:text-[var(--sdk-muted-foreground)]"
          width={14}
          height={14}
        />
        <span className="sdk:font-semibold sdk:text-[12px]">Execution log</span>
      </div>
    </Button>
  );
};
