import AIStar from "../../assets/svg/aiStar.svg?react";
import AIStarWhite from "../../assets/svg/aiStarWhite.svg?react";
import SuccessCheck from "../../assets/svg/successCheck.svg?react";
import ErrorIcon from "../../assets/svg/errorIcon.svg?react";
import Close from "../../assets/svg/close.svg?react";
import Browsers from "../../assets/svg/browsers.svg?react";
import Search from "../../assets/svg/search.svg?react";
import Clipboard from "../../assets/svg/clipboard.svg?react";
import dayjs from "dayjs";
import Copy from "../Copy";
// import Editor from "@monaco-editor/react";
import { useEffect, useState } from "react";
import MonacoEditor from "../MonacoEditor";

const transformStatus = (status: number) => {
  switch (status) {
    case 0:
      return "pending";
    case 1:
      return "running";
    case 2:
      return "success";
    default:
      return "failed";
  }
};
interface FetchExecutionLogsProps {
  stateName: string;
  workflowId: string;
  roundId: number;
}

export const useFetchExecutionLogs = ({
  stateName,
  workflowId,
  roundId = 1,
}: FetchExecutionLogsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchExecutionLogs = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(
          `/api/query/es?StateName=${stateName}&QueryString=workflowId:${workflowId}&&roundId:${roundId}`
        );
        const data = await response.json();

        if (data.code === "20000") {
          const results = [];
          const records = JSON.parse(data?.data?.items?.[0]?.workUnitRecords);

          for (const record of records) {
            const inputData = JSON.parse(record.inputData);
            const outputData = JSON.parse(record.outputData);
            const executionTime = dayjs(record.endTime).diff(
              dayjs(record.startTime)
            );

            const agentName =
              inputData?.find((d: any) => d?.AgentName)?.AgentName || "unknown";

            const result = {
              agentName,
              status: transformStatus(record.status),
              inputData,
              outputData,
              executionTime,
            };

            results.push(result);
          }

          setData(results);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExecutionLogs();
  }, [workflowId, stateName, roundId]);

  return { isLoading, data, error };
};
interface IExecutionLogsProps {
  workflowId: string;
}

const DEFAULT = {
  agentName: "unknown",
  inputData: {},
  outputData: {},
  executionTime: 783,
  status: "success",
};

export const ExecutionLogs = ({ workflowId }: IExecutionLogsProps) => {
  const { data, isLoading } = useFetchExecutionLogs({
    stateName: "WorkflowExecutionRecordState",
    workflowId: "fb389e1c-aa5b-41d4-8529-c3e1bdc10393%26%26",
    roundId: 1,
  });
  const [activeAgent, setActiveAgent] = useState(DEFAULT);

  useEffect(() => {
    if (data) {
      setActiveAgent(data?.[0]);
    }
  }, [data]);

  if (isLoading) {
    return null;
  }

  return (
    <Wrapper>
      <ExecutionLogHeader activeAgent={activeAgent} />
      <ExecutionLogBody
        data={data}
        activeAgent={activeAgent}
        onChange={setActiveAgent}
      />
    </Wrapper>
  );
};

interface Agent {
  agentName: string;
  inputData: any;
  outputData: any;
  executionTime: number;
  status: string;
}

interface IExecutionLogsHeaderProps {
  activeAgent: Agent;
}

const ExecutionLogHeader = ({ activeAgent }: IExecutionLogsHeaderProps) => {
  const { agentName, executionTime, status } = activeAgent || {};

  return (
    <div className="flex flex-row justify-between items-center gap-[16px]">
      <span className="text-gradient font-semibold text-[16px] min-w-[200px]">
        execution log
      </span>
      <div className="flex justify-between items-center gap-4 w-[100%]">
        <div className="flex gap-[8px]">
          <div className="flex items-center gap-1">
            <AIStar />
            <span className="text-[14px]">{agentName}</span>
          </div>
          <span className="text-[#6F6F6F] text-[14px]">{executionTime}s</span>
          <div
            className={`flex items-center ${
              status === "success" ? "text-[#53FF8A]" : "text-[#FF2E2E]"
            }`}
          >
            {status === "success" ? <SuccessCheck /> : <ErrorIcon />}
            <span className="w-[2px]" />
            <span className="text-[14px]">{status}</span>
          </div>
        </div>
        <span className="flex">
          <button type="button">
            <Copy toCopy={JSON.stringify(activeAgent)} icon={<Browsers />} />
          </button>
          <button type="button">
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
      <div className="flex flex-col min-w-[202px]">
        {data.map((d) => (
          <button
            className={`cursor-pointer pt-[2px] pb-[2px] pr-[4px] pl-[4px] rounded-sm ${
              activeAgent?.agentName === d.agentName ? "bg-[#303030]" : ""
            }`}
            key={d.agentName}
            type="button"
            onClick={() => onChange(d)}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                {activeAgent?.agentName === d.agentName ? (
                  <AIStarWhite />
                ) : (
                  <AIStar />
                )}
                <span className="text-[14px]">{d.agentName}</span>
              </span>
              {d.status === "success" ? <SuccessCheck /> : <ErrorIcon />}
            </div>
          </button>
        ))}
      </div>

      <div className="flex flex-row gap-2 w-[100%]">
        <div className="flex flex-col gap-2 bg-[#30303080] pl-[8px] pr-[8px] pt-[4px] w-[100%]">
          <div className="flex justify-between items-center">
            <span className="text-[#B9B9B9] font-semibold">input</span>
            <span className="flex gap-2">
              <button type="button" onClick={() => {}}>
                <Search />
              </button>
              <button type="button">
                <Copy
                  toCopy={JSON.stringify(activeAgent?.inputData)}
                  icon={<Clipboard />}
                />
              </button>
            </span>
          </div>
          <MonacoEditor data={activeAgent?.inputData} />
        </div>

        <div className="flex flex-col gap-2 bg-[#30303080] pl-[8px] pr-[8px] pt-[4px] w-[100%]">
          <div className="flex justify-between items-center">
            <span className="text-[#B9B9B9] font-semibold">output</span>
            <span className="flex gap-2">
              <Search />
              <button type="button">
                <Copy
                  toCopy={JSON.stringify(activeAgent?.outputData)}
                  icon={<Clipboard />}
                />
              </button>
            </span>
          </div>
          {/* <MonacoEditor data={activeAgent?.outputData} /> */}
        </div>
      </div>
    </Flex>
  );
};

const Flex = ({ children }: { children: any }) => {
  return <div className="flex flex-row gap-4">{children}</div>;
};

const Wrapper = ({ children }: { children: any }) => {
  return (
    <div className="flex flex-col gap-2 bg-[#171717] p-[8px] border border-[#FFFFFF14] rounded-sm">
      {children}
    </div>
  );
};
