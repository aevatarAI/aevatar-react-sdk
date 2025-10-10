import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import type { ExecutionLogItem } from "@aevatar-react-sdk/types";
import SuccessCheck from "../../assets/svg/successCheck.svg?react";
import ErrorIcon from "../../assets/svg/errorIcon.svg?react";
import Loading from "../../assets/svg/loading.svg?react";
import clsx from "clsx";
import ToCopy from "../Copy";
import { Copy } from "lucide-react";

// Helper function to format object keys for preview
const formatObjectPreview = (
  obj: Record<string, unknown>
): { object: Record<string, string>; hasMore: boolean } => {
  const entries = Object.entries(obj);
  const previewEntries = entries.slice(0, 2);
  const hasMore = entries.length > 2;
  const object = {};

  previewEntries.forEach((item) => {
    let valueStr: string;
    if (typeof item[1] === "string") {
      valueStr = `"${item[1]}"`;
    } else if (typeof item[1] === "object" && item[1] !== null) {
      valueStr = Array.isArray(item[1]) ? "[...]" : "{...}";
    } else {
      valueStr = String(item[1]);
    }
    object[item[0]] = valueStr;
  });

  return { object, hasMore };
};

// Helper function to format array preview
const formatArrayPreview = (
  arr: unknown[]
): { object: Record<string, string>[]; hasMore: boolean } => {
  const previewItems = arr.slice(0, 2);
  const hasMore = arr.length > 2;

  const formattedItems = previewItems.map((item, index) => {
    let valueStr: string;
    if (typeof item === "string") {
      valueStr = `"${item}"`;
    } else if (typeof item === "object" && item !== null) {
      valueStr = Array.isArray(item) ? "[...]" : "{...}";
    } else {
      valueStr = String(item);
    }
    return { [index.toString()]: valueStr };
  });

  return { object: formattedItems, hasMore };
};

const emptCls =
  "sdk:text-[12px] sdk:text-[var(--sdk-muted-foreground)]  sdk:italic";

// Helper function to render data content
const renderDataContent = (data: unknown) => {
  if (typeof data === "string") {
    return (
      <div className="sdk:text-[12px] sdk:text-[var(--sdk-muted-foreground)] sdk:font-mono sdk:whitespace-pre-wrap two-line-ellipsis">
        {data}
      </div>
    );
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return <div className={emptCls}>Empty array</div>;
    }
    const previewText = formatArrayPreview(data);
    return (
      <div className="sdk:text-[12px] sdk:text-[var(--sdk-muted-foreground)] sdk:font-mono sdk:whitespace-pre-wrap">
        {previewText.object.map((item, index) => {
          return (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              key={index}
              className="sdk:flex two-line-ellipsis">
              <span className="sdk:text-[var(--sdk-accent-blue)] sdk:mr-[10px]">
                {index.toString()}:
              </span>
              <span className="sdk:text-[var(--sdk-muted-foreground)]">
                {item[index.toString()]}
              </span>
            </div>
          );
        })}
        {previewText.hasMore && <div>...</div>}
      </div>
    );
  }

  if (data === null) {
    return <div className={emptCls}>null</div>;
  }

  if (data === undefined) {
    return <div className={emptCls}>undefined</div>;
  }

  if (typeof data === "object" && data !== null) {
    const obj = data as Record<string, unknown>;
    if (Object.keys(obj).length === 0) {
      return <div className={emptCls}>Empty object</div>;
    }
    const previewText = formatObjectPreview(obj);
    return (
      <div className="sdk:text-[12px] sdk:text-[var(--sdk-muted-foreground)] sdk:font-mono sdk:whitespace-pre-wrap">
        {Object.entries(previewText.object).map(([key, value]) => {
          return (
            <div key={key} className="sdk:flex two-line-ellipsis">
              <span className="sdk:text-[var(--sdk-accent-blue)] sdk:mr-[10px]">
                {key}:
              </span>
              <span className="sdk:text-[var(--sdk-muted-foreground)]">
                {value}
              </span>
            </div>
          );
        })}
        {previewText.hasMore && <div>...</div>}
      </div>
    );
  }

  // For numbers, booleans, etc.
  return (
    <div className="sdk:text-[12px] sdk:text-[var(--sdk-muted-foreground)] sdk:font-mono">
      {String(data)}
    </div>
  );
};

export default function AccordionLogs({
  agentLogs,
  onShowLogsDialog,
}: {
  agentLogs: ExecutionLogItem;
  onShowLogsDialog: (e: React.MouseEvent<HTMLDivElement>) => void;
}) {
  return (
    <div className="sdk:absolute sdk:top-0 sdk:left-0 sdk:w-full sdk:h-full">
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>
            <div className="sdk:flex sdk:items-center sdk:gap-[6px]">
              {agentLogs.status === "success" && (
                <SuccessCheck
                  className="sdk:text-[var(--sdk-bg-background)]"
                  width={14}
                  height={14}
                />
              )}
              {agentLogs.status === "failed" && (
                <ErrorIcon className="sdk:text-[var(--sdk-bg-background)]" />
              )}
              {(agentLogs.status === "running" ||
                agentLogs.status === "pending") && (
                <Loading
                  key={"save"}
                  className={clsx("aevatarai-loading-icon")}
                  style={{ width: 14, height: 14 }}
                />
              )}
              <span className="sdk:text-sm sdk:font-medium sdk:leading-5 sdk:text-[var(--sdk-color-text-foreground)]">
                {agentLogs.status.charAt(0).toUpperCase() +
                  agentLogs.status.slice(1)}
              </span>
              {/* <span className="sdk:text-xs sdk:leading-4 sdk:text-[var(--sdk-muted-foreground)]">{`${agentLogs.duration}s`}</span> */}
            </div>
          </AccordionTrigger>
          <AccordionContent className="sdk:pb-[0]" onClick={onShowLogsDialog}>
            <div className="sdk:mb-[10px]">
              <div className="sdk:flex sdk:gap-[4px] sdk:mb-[4px] sdk:items-center">
                <span className="sdk:text-[var(--sdk-color-text-foreground)] sdk:text-xs sdk:leading-4 sdk:font-semibold">
                  Input
                </span>
                <span className="sdk:flex sdk:gap-2">
                  <button type="button">
                    <ToCopy
                      description="Execution log copied!"
                      toCopy={JSON.stringify(agentLogs?.inputData)}
                      icon={
                        <Copy size={14} color="var(--sdk-muted-foreground)" />
                      }
                    />
                  </button>
                </span>
              </div>
              <div className="sdk:py-[8px] sdk:px-[6px] sdk:bg-[var(--sdk-bg-background)] sdk:rounded-md sdk:border sdk:border-[var(--sdk-color-border-primary)]">
                {renderDataContent(agentLogs.inputData)}
              </div>
            </div>
            <div className="sdk:mb-[10px]">
              <div className="sdk:flex sdk:gap-[4px] sdk:mb-[4px] sdk:items-center">
                <span className="sdk:text-[var(--sdk-color-text-foreground)] sdk:text-xs sdk:leading-4 sdk:font-semibold">
                  Agent state
                </span>
                <span className="sdk:flex sdk:gap-2">
                  <button type="button">
                    <ToCopy
                      description="Execution log copied!"
                      toCopy={JSON.stringify(
                        agentLogs?.currentStateSnapshot ?? agentLogs?.agentState
                      )}
                      icon={
                        <Copy size={14} color="var(--sdk-muted-foreground)" />
                      }
                    />
                  </button>
                </span>
              </div>
              <div className="sdk:py-[8px] sdk:px-[6px] sdk:bg-[var(--sdk-bg-background)] sdk:rounded-md sdk:border sdk:border-[var(--sdk-color-border-primary)]">
                {renderDataContent(
                  agentLogs?.currentStateSnapshot ?? agentLogs?.agentState
                )}
              </div>
            </div>
            <div className="sdk:mb-[10px]">
              <div className="sdk:flex sdk:gap-[4px] sdk:mb-[4px] sdk:items-center">
                <span className="sdk:text-[var(--sdk-color-text-foreground)] sdk:text-xs sdk:leading-4 sdk:font-semibold">
                  Output
                </span>
                <span className="sdk:flex sdk:gap-2">
                  <button type="button">
                    <ToCopy
                      description="Execution log copied!"
                      toCopy={JSON.stringify(agentLogs?.outputData)}
                      icon={
                        <Copy size={14} color="var(--sdk-muted-foreground)" />
                      }
                    />
                  </button>
                </span>
              </div>
              {agentLogs?.failureSummary && (
                <div className="sdk:bg-[var(--sdk-color-error-bg)] sdk:mb-[4px] sdk:bg-opacity-15 sdk:border sdk:border-[var(--sdk-color-error)] sdk:border-opacity-20 sdk:px-4 sdk:py-2 sdk:rounded-sm sdk:flex sdk:items-center sdk:gap-2.5 sdk:relative">
                  <div className="sdk:flex sdk:w-full sdk:flex-col sdk:justify-center sdk:relative sdk:shrink-0">
                    <p className="sdk:text-[var(--sdk-color-error)] sdk:text-[12px] sdk:font-normal sdk:leading-normal sdk:whitespace-pre sdk:w-full sdk:whitespace-pre-wrap sdk:break-all sdk:overflow-wrap-anywhere">
                      {agentLogs.failureSummary}
                    </p>
                  </div>
                </div>
              )}
              <div className="sdk:py-[8px] sdk:px-[6px] sdk:bg-[var(--sdk-bg-background)] sdk:rounded-md sdk:border sdk:border-[var(--sdk-color-border-primary)]">
                {renderDataContent(agentLogs.outputData)}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
