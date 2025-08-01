import AIStar from "../../assets/svg/aiStar.svg?react";
import AIStarWhite from "../../assets/svg/aiStarWhite.svg?react";
import SuccessCheck from "../../assets/svg/successCheck.svg?react";
import ErrorIcon from "../../assets/svg/errorIcon.svg?react";
import EmptyRun from "../../assets/svg/emptyRun.svg?react";
import Close from "../../assets/svg/close.svg?react";
import Browsers from "../../assets/svg/browsers.svg?react";
import Clipboard from "../../assets/svg/clipboard.svg?react";
import Clock from "../../assets/svg/clock.svg?react";
import Copy from "../Copy";
import { useEffect, useState } from "react";
import JsonView from "react18-json-view";
import "react18-json-view/src/style.css";
import "react18-json-view/src/dark.css";
import { useFetchExecutionLogs } from "../../hooks/useFetchExecutionLogs";
interface IExecutionLogsProps {
  stateName: string;
  workflowId: string;
  roundId: number;
}

const DEFAULT = {
  agentName: "unknown",
  inputData: {},
  outputData: {},
  agentState: {},
  executionTime: 783,
  status: "success",
};

export const ExecutionLogs = ({
  workflowId,
  stateName,
  roundId,
}: IExecutionLogsProps) => {
  const { data, isLoading } = useFetchExecutionLogs({
    stateName,
    workflowId,
    roundId,
  });
  const [activeAgent, setActiveAgent] = useState(DEFAULT);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (data) {
      setActiveAgent(data?.[0]);
    }
  }, [data]);

  if (isLoading) {
    return null;
  }

  if (!isVisible) {
    return <ToggleModal onToggle={setIsVisible} />;
  }

  return (
    <Wrapper>
      <ExecutionLogHeader
        data={data}
        activeAgent={activeAgent}
        onToggle={setIsVisible}
      />
      {data?.length > 0 ? (
        <ExecutionLogBody
          data={data}
          activeAgent={activeAgent}
          onChange={setActiveAgent}
        />
      ) : (
        <EmptyExecutionLog />
      )}
    </Wrapper>
  );
};

interface Agent {
  agentName: string;
  inputData: any;
  outputData: any;
  agentState: any;
  executionTime: number;
  status: string;
}

interface IExecutionLogsHeaderProps {
  data: any;
  activeAgent: Agent;
  onToggle: (callback: any) => void;
}

const ExecutionLogHeader = ({
  data,
  activeAgent,
  onToggle,
}: IExecutionLogsHeaderProps) => {
  const { agentName, executionTime, status } = activeAgent || {};

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
              {executionTime}s
            </span>
            <div
              className={`sdk:flex sdk:items-center ${
                status === "success"
                  ? "sdk:text-[#53FF8A]"
                  : "sdk:text-[#FF2E2E]"
              }`}
            >
              {status === "success" ? <SuccessCheck /> : <ErrorIcon />}
              <span className="sdk:w-[2px]" />
              <span className="sdk:text-[14px]">{status}</span>
            </div>
          </div>
        ) : (
          <span />
        )}
        <span className="sdk:flex">
          <button type="button">
            <Copy toCopy={JSON.stringify(activeAgent)} icon={<Browsers />} />
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
  data: any[];
  activeAgent: Agent;
  onChange: (agent: Agent) => void;
}

const ExecutionLogBody = ({
  data,
  activeAgent,
  onChange,
}: IExecutionLogsBodyProps) => {
  return (
    <Flex>
      <div className="sdk:flex sdk:flex-col sdk:min-w-[202px]">
        {data.map((d) => (
          <button
            className={`sdk:cursor-pointer sdk:pt-[2px] sdk:pb-[2px] sdk:pr-[4px] sdk:pl-[4px] sdk:rounded-sm ${
              activeAgent?.agentName === d.agentName ? "sdk:bg-[#303030]" : ""
            }`}
            key={d.agentName}
            type="button"
            onClick={() => onChange(d)}
          >
            <div className="sdk:flex sdk:items-center sdk:justify-between">
              <span className="sdk:flex sdk:items-center sdk:gap-1">
                {activeAgent?.agentName === d.agentName ? (
                  <AIStarWhite />
                ) : (
                  <AIStar />
                )}
                <span className="sdk:text-[14px]">{d.agentName}</span>
              </span>
              {d.status === "success" ? <SuccessCheck /> : <ErrorIcon />}
            </div>
          </button>
        ))}
      </div>

      <div className="sdk:flex sdk:flex-row sdk:gap-2 sdk:w-[100%]">
        <div className="sdk:flex sdk:flex-col sdk:gap-2 sdk:bg-[#30303080] sdk:pl-[8px] sdk:pr-[8px] sdk:pt-[4px] sdk:w-[100%]">
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
          <JsonView src={activeAgent?.inputData} className="sdk:text-[14px]" />
        </div>

        <div className="sdk:flex sdk:flex-col sdk:gap-2 sdk:bg-[#30303080] sdk:pl-[8px] sdk:pr-[8px] sdk:pt-[4px] sdk:w-[100%]">
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
          <JsonView src={activeAgent?.agentState} className="sdk:text-[14px]" />
        </div>

        <div className="sdk:flex sdk:flex-col sdk:gap-2 sdk:bg-[#30303080] sdk:pl-[8px] sdk:pr-[8px] sdk:pt-[4px] sdk:w-[100%]">
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
          <JsonView src={activeAgent?.outputData} className="sdk:text-[14px]" />
        </div>
      </div>
    </Flex>
  );
};

const Wrapper = ({ children }: { children: any }) => {
  return (
    <div className="sdk:min-w-[100%] sdk:flex sdk:flex-col sdk:gap-2 sdk:bg-[#171717] sdk:p-[8px] sdk:border sdk:border-[#FFFFFF14] sdk:rounded-sm">
      {children}
    </div>
  );
};

const Flex = ({ children }: { children: any }) => {
  return <div className="sdk:flex sdk:flex-row sdk:gap-4">{children}</div>;
};

const EmptyExecutionLog = () => {
  return (
    <div className="sdk:min-w-[100%] sdk:flex sdk:items-center sdk:justify-center sdk:pt-[72.5px] sdk:pb-[72.5px]">
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
  onToggle: (callback: any) => void;
}

const ToggleModal = ({ onToggle }: ToggleModalProps) => {
  return (
    <button
      type="button"
      className="sdk:flex sdk:gap-[5px] sdk:items-center sdk:pt-[8px] sdk:pb-[8px] sdk:pl-[18px] sdk:pr-[18px] sdk:border sdk:border-[#303030] sdk:cursor-pointer"
      onClick={() => {
        onToggle((prev) => !prev);
      }}
    >
      <Clock />
      <span>execution log</span>
    </button>
  );
};
