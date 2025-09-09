import AIStar from "../../assets/svg/aiStar.svg?react";
import AIStarWhite from "../../assets/svg/aiStarWhite.svg?react";
import SuccessCheck from "../../assets/svg/successCheck.svg?react";
import ErrorIcon from "../../assets/svg/errorIcon.svg?react";
import EmptyRun from "../../assets/svg/emptyRun.svg?react";
import Close from "../../assets/svg/close.svg?react";
import Browsers from "../../assets/svg/browsers.svg?react";
import Clipboard from "../../assets/svg/clipboard.svg?react";
import Clock from "../../assets/svg/clock.svg?react";
import Loading from "../../assets/svg/loading.svg?react";
import Copy from "../Copy";
import { useCallback, useEffect, useRef, useState } from "react";
import JsonView from "react18-json-view";
import "react18-json-view/src/style.css";
import "react18-json-view/src/dark.css";
import clsx from "clsx";
import { useFetchExecutionLogs } from "../Workflow/hooks/useFetchExecutionLogs";

const DEFAULT = {
  agentName: "unknown",
  inputData: {},
  outputData: {},
  agentState: {},
  executionTime: 783,
  status: "success",
  index: 0,
};

interface IExecutionLogsProps {
  stateName: string;
  workflowId: string;
  roundId: number;
  isAgentCardOpen: boolean;
}

export const ExecutionLogs = ({
  workflowId,
  stateName,
  roundId,
  isAgentCardOpen,
}: IExecutionLogsProps) => {
  const { data, isLoading } = useFetchExecutionLogs({
    stateName,
    workflowId,
    roundId,
  });
  const [activeAgent, setActiveAgent] = useState(DEFAULT);
  const [isVisible, setIsVisible] = useState(workflowId);
  const [isMovable, setIsMovable] = useState(false);

  useEffect(() => {
    if (data) {
      setActiveAgent({ ...data?.[0], index: 0 });
    }
  }, [data]);

  const handleClick = () => {
    setIsMovable((prev) => !prev);
  };

  if (isLoading) {
    return (
      <Loading
        key={"save"}
        className={clsx(
          "aevatarai-loading-icon",
          "sdk:absolute",
          "sdk:bottom-[22px]"
        )}
      />
    );
  }

  if (!isVisible) {
    return (
      <ToggleModal isAgentCardOpen={isAgentCardOpen} onToggle={setIsVisible} />
    );
  }

  return (
    <Container>
      <div className="sdk:bg-[#6F6F6F] sdk:min-w-[48px] sdk:max-w-[48px] sdk:min-h-[2px]" />
      <Wrapper isAgentCardOpen={isAgentCardOpen} isMovable={isMovable}>
        <ExecutionLogHeader
          data={data}
          activeAgent={activeAgent}
          onToggle={setIsVisible}
          onClick={handleClick}
        />
        {data?.length > 0 ? (
          <ExecutionLogBody
            isAgentCardOpen={isAgentCardOpen}
            data={data}
            activeAgent={activeAgent}
            onChange={setActiveAgent}
          />
        ) : (
          <EmptyExecutionLog />
        )}
      </Wrapper>
    </Container>
  );
};

interface Agent {
  agentName: string;
  inputData: any;
  outputData: any;
  agentState: any;
  executionTime: number;
  status: string;
  index: number;
}

const getStatus = (status: string) => {
  const isSuccess = ["success"].includes(status);
  const isPending = ["running", "pending"].includes(status);

  return { isPending, isSuccess };
};

interface IExecutionLogsHeaderProps {
  data: any;
  activeAgent: Agent;
  onToggle: (callback: any) => void;
  onClick: () => void;
}

const ExecutionLogHeader = ({
  data,
  activeAgent,
  onToggle,
  onClick,
}: IExecutionLogsHeaderProps) => {
  const { agentName, executionTime, status } = activeAgent || {};
  const { isPending, isSuccess } = getStatus(status);

  return (
    <div className="sdk:flex sdk:flex-row sdk:justify-between sdk:items-center sdk:gap-[16px]">
      <span className="sdk:text-gradient sdk:font-semibold sdk:text-[16px] sdk:min-w-[200px]">
        execution log
      </span>
      <div className="sdk:flex sdk:justify-between sdk:items-center sdk:gap-4 sdk:w-[100%]">
        {data?.length > 0 ? (
          <div className="sdk:flex sdk:gap-[8px]">
            <div className="sdk:flex sdk:items-center sdk:gap-1">
              <AIStar />
              <span className="sdk:text-[14px]">{agentName}</span>
            </div>
            <span className="sdk:text-[#6F6F6F] sdk:text-[14px]">
              {executionTime ? `${executionTime}ms` : "-"}
            </span>
            <div
              className={`sdk:flex sdk:items-center ${
                isPending
                  ? ""
                  : isSuccess
                  ? "sdk:text-[#53FF8A]"
                  : "sdk:text-[#FF2E2E]"
              }`}
            >
              {isPending ? (
                <Loading
                  key={"save"}
                  className={clsx("aevatarai-loading-icon")}
                  style={{ width: 14, height: 14 }}
                />
              ) : isSuccess ? (
                <SuccessCheck />
              ) : (
                <ErrorIcon />
              )}
              <span className="sdk:w-[2px]" />
              <span className="sdk:text-[12px] sdk:mt-[2px]">{status}</span>
            </div>
          </div>
        ) : (
          <span />
        )}
        <span className="sdk:flex">
          <button type="button" onClick={onClick}>
            <Browsers />
          </button>
          <button
            type="button"
            className="sdk:cursor-pointer"
            onClick={() => {
              onToggle((prev: boolean) => !prev);
            }}
          >
            <Close />
          </button>
        </span>
      </div>
    </div>
  );
};

interface IExecutionLogsBodyProps {
  isAgentCardOpen: boolean;
  data: any[];
  activeAgent: Agent;
  onChange: (agent: Agent) => void;
}

const ExecutionLogBody = ({
  isAgentCardOpen,
  data,
  activeAgent,
  onChange,
}: IExecutionLogsBodyProps) => {
  const { isPending, isSuccess } = getStatus(activeAgent?.status);

  return (
    <Flex>
      <div className="sdk:flex sdk:flex-col sdk:min-w-[202px] sdk:max-w-[202px] sdk:overflow-auto">
        {data.map((d, index) => {
          const isActive = activeAgent?.index === index;

          const getStatusIcon = () => {
            const currentStatus = isActive
              ? isPending
                ? "pending"
                : isSuccess
                ? "success"
                : "error"
              : d.status;

            const iconProps = { style: { width: 14, height: 14 } };

            if (["pending", "running"].includes(currentStatus)) {
              return (
                <Loading
                  key="save"
                  className={clsx("aevatarai-loading-icon")}
                  {...iconProps}
                />
              );
            }

            return currentStatus === "success" ? (
              <SuccessCheck />
            ) : (
              <ErrorIcon />
            );
          };

          return (
            <button
              key={`${d?.agentState?.grainId}-${index}`}
              className={`sdk:cursor-pointer sdk:pt-[2px] sdk:pb-[2px] sdk:pr-[4px] sdk:pl-[4px] sdk:rounded-sm ${
                isActive ? "sdk:bg-[#303030]" : ""
              }`}
              type="button"
              onClick={() => onChange({ ...d, index })}
            >
              <div className="sdk:flex sdk:items-center sdk:justify-between">
                <span className="sdk:flex sdk:items-center sdk:gap-1">
                  {isActive ? <AIStarWhite /> : <AIStar />}
                  <span className="sdk:text-[14px]">{d.agentName}</span>
                </span>
                {getStatusIcon()}
              </div>
            </button>
          );
        })}
      </div>

      <div
        className={`sdk:flex sdk:flex-${
          isAgentCardOpen ? "col" : "row"
        } sdk:gap-2 sdk:w-[100%]`}
      >
        <div className="sdk:flex sdk:flex-col sdk:gap-2 sdk:bg-[#30303080] sdk:pl-[8px] sdk:pr-[8px] sdk:pt-[4px] sdk:w-[100%] sdk:overflow-x-auto">
          <div className="sdk:flex sdk:justify-between sdk:items-center">
            <span className="sdk:text-[#B9B9B9] sdk:font-semibold">input</span>
            <span className="sdk:flex sdk:gap-2">
              <button type="button">
                <Copy
                  toCopy={JSON.stringify(activeAgent?.inputData)}
                  icon={<Clipboard />}
                />
              </button>
            </span>
          </div>
          <JsonView
            collapsed={false}
            enableClipboard={false}
            src={activeAgent?.inputData}
            className="sdk:text-[14px]"
            theme="vscode"
          />
        </div>

        <div className="sdk:flex sdk:flex-col sdk:gap-2 sdk:bg-[#30303080] sdk:pl-[8px] sdk:pr-[8px] sdk:pt-[4px] sdk:w-[100%] sdk:overflow-x-auto">
          <div className="sdk:flex sdk:justify-between sdk:items-center">
            <span className="sdk:text-[#B9B9B9] sdk:font-semibold">
              agent state
            </span>
            <span className="sdk:flex sdk:gap-2">
              <button type="button">
                <Copy
                  toCopy={JSON.stringify(activeAgent?.agentState)}
                  icon={<Clipboard />}
                />
              </button>
            </span>
          </div>
          <JsonView
            enableClipboard={false}
            src={activeAgent?.agentState}
            className="sdk:text-[14px]"
            collapsed={false}
            theme="vscode"
          />
        </div>

        <div className="sdk:flex sdk:flex-col sdk:gap-2 sdk:bg-[#30303080] sdk:pl-[8px] sdk:pr-[8px] sdk:pt-[4px] sdk:w-[100%] sdk:overflow-x-auto">
          <div className="sdk:flex sdk:justify-between sdk:items-center">
            <span className="sdk:text-[#B9B9B9] sdk:font-semibold">output</span>
            <span className="sdk:flex sdk:gap-2">
              <button type="button">
                <Copy
                  toCopy={JSON.stringify(activeAgent?.outputData)}
                  icon={<Clipboard />}
                />
              </button>
            </span>
          </div>
          <JsonView
            collapseStringsAfterLength={Number.POSITIVE_INFINITY}
            collapsed={false}
            enableClipboard={false}
            src={activeAgent?.outputData}
            className="sdk:text-[14px]"
            theme="vscode"
          />
        </div>
      </div>
    </Flex>
  );
};

const Container = ({ children }: { children: any }) => {
  return (
    <div className="sdk:min-w-[100%] sdk:flex sdk:flex-col sdk:gap-[2px] sdk: sdk:items-center sdk:justify-items-center">
      {children}
    </div>
  );
};

const Wrapper = ({
  isAgentCardOpen,
  isMovable,
  children,
}: {
  isAgentCardOpen: boolean;
  isMovable: boolean;
  children: any;
}) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const dragRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!isMovable) return;

      setIsDragging(true);
      setDragStart({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y,
      });

      // Prevent text selection during drag
      e.preventDefault();
    },
    [isMovable, offset]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !isMovable) return;

      const newOffset = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      };

      setOffset(newOffset);
    },
    [isDragging, isMovable, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={dragRef}
      onMouseDown={handleMouseDown}
      className={`${
        isMovable ? "sdk:absolute sdk:top-0" : ""
      }sdk:max-h-[240px] sdk:overflow-auto ${
        isAgentCardOpen
          ? "sdk:max-w-[calc(100%-393px)] sdk:mr-auto"
          : "sdk:min-w-[100%]"
      } sdk:flex sdk:flex-col sdk:flex-1 sdk:gap-2 sdk:bg-[#171717] sdk:p-[8px] sdk:border sdk:border-[#FFFFFF14] sdk:rounded-sm ${
        isMovable ? "sdk:cursor-move" : ""
      } ${isDragging ? "sdk:select-none" : ""}`}
      style={
        isMovable
          ? {
              transform: `translate(${offset.x}px, ${offset.y}px)`,
              zIndex: isDragging ? Number.POSITIVE_INFINITY : 1,
            }
          : {}
      }
    >
      {children}
    </div>
  );
};
const Flex = ({ children }: { children: any }) => {
  return <div className="sdk:flex sdk:flex-row sdk:gap-4">{children}</div>;
};

const EmptyExecutionLog = () => {
  return (
    <div className="sdk:overflow-y-hidden sdk:min-w-[100%] sdk:flex sdk:items-center sdk:justify-center sdk:pt-[72.5px] sdk:pb-[72.5px]">
      <div className="sdk:flex sdk:flex-col sdk:gap-4 sdk:items-center">
        <EmptyRun />
        <span className="sdk:text-[#6F6F6F] sdk:text-[13px]">
          run your workflow to view execution logs here.
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
    <button
      type="button"
      className={`sdk:absolute sdk:bottom-[22px] ${
        isAgentCardOpen ? "sdk:right-[60%]" : ""
      } sdk:flex sdk:gap-[5px] sdk:items-center sdk:pt-[8px] sdk:pb-[8px] sdk:pl-[18px] sdk:pr-[18px] sdk:border sdk:border-[#303030] sdk:cursor-pointer`}
      onClick={() => {
        onToggle((prev) => !prev);
      }}
    >
      <div className="sdk:flex sdk:flex-row sdk:gap-[5px] sdk:items-center">
        <Clock width={14} height={14} />
        <span className="sdk:font-semibold sdk:text-[12px]">execution log</span>
      </div>
    </button>
  );
};
