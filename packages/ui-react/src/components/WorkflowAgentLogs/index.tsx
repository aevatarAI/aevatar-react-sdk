import React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogPortal,
  DialogTitle,
} from "../ui";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import CloseIcon from "../../assets/svg/close.svg?react";
import clsx from "clsx";
import { JSONTree } from "react-json-tree";
import ToCopy from "../Copy";
import type { ExecutionLogItem } from "@aevatar-react-sdk/types";
import { Copy } from "lucide-react";
import "./index.css";
// Custom theme with transparent background
const transparentTheme = {
  scheme: "custom",
  base00: "transparent", // Transparent background
  base01: "#383830",
  base02: "#49483e",
  base03: "#75715e",
  base04: "#a59f85",
  base05: "#f8f8f2",
  base06: "#f5f4f1",
  base07: "#f9f8f5",
  base08: "#f92672",
  base09: "var(--sdk-muted-foreground)",
  base0A: "#f4bf75",
  base0B: "var(--sdk-muted-foreground)",
  base0C: "#a1efe4",
  base0D: "var(--sdk-accent-blue)",
  base0E: "#ae81ff",
  base0F: "#cc6633",
  tree: {
    fontSize: "12px", // Set tree font size to 12px
    marginLeft: "6px", // Set margin left for each tree item
  },
  value: {
    fontSize: "12px", // Set value font size to 12px
  },
  label: {
    fontSize: "12px", // Set key font size to 12px
  },
};

// Helper function to determine if data should use JSONTree or simple display
const shouldUseJSONTree = (data: unknown): boolean => {
  if (typeof data === "string") return false;
  if (Array.isArray(data) && data.length === 0) return false;
  if (data === null || data === undefined) return false;
  if (
    typeof data === "object" &&
    data !== null &&
    Object.keys(data).length === 0
  )
    return false;
  return true;
};

const emptCls =
  "sdk:text-[12px] sdk:px-[6px] sdk:text-[var(--sdk-muted-foreground)]  sdk:italic";

// Helper function to render data content
const renderDataContent = (data: unknown) => {
  if (!shouldUseJSONTree(data)) {
    if (typeof data === "string") {
      return (
        <div className="sdk:text-[12px] sdk:px-[6px] sdk:text-[var(--sdk-muted-foreground)] sdk:font-mono sdk:whitespace-pre-wrap">
          {data}
        </div>
      );
    }
    if (Array.isArray(data) && data.length === 0) {
      return <div className={emptCls}>Empty array</div>;
    }
    if (data === null) {
      return <div className={emptCls}>null</div>;
    }
    if (data === undefined) {
      return <div className={emptCls}>undefined</div>;
    }
    if (
      typeof data === "object" &&
      data !== null &&
      Object.keys(data).length === 0
    ) {
      return <div className={emptCls}>Empty object</div>;
    }
  }

  return (
    <JSONTree
      data={data}
      theme={transparentTheme}
      hideRoot={true}
      invertTheme={false}
    />
  );
};

export interface IWorkflowAgentLogsProps {
  agentLogs?: ExecutionLogItem;
  onClose: () => void;
}

export default function WorkflowAgentLogs({
  agentLogs,
  onClose,
}: IWorkflowAgentLogsProps) {
  return (
    // <Dialog open={open} modal={false} onOpenChange={onOpenChange}>
    //   <DialogPortal container={container} asChild>
    <DialogPrimitive.Content
      className={clsx(
        "sdk:z-6 sdk:left-[19px] sdk:sm:left-auto sdk:workflow-common-bg sdk:w-auto sdk:sm:w-[380px]  sdk:workflow-common-border sdk:border sdk:flex",
        "sdk:absolute sdk:right-[20px]  sdk:top-[58px] sdk:sm:right-[11px] sdk:sm:top-[58px] sdk:sm:bottom-[8px]"
      )}>
      <DialogClose
        className="sdk:border-none"
        onClick={(e) => {
          e.stopPropagation();
          onClose?.();
        }}>
        <CloseIcon
          className="sdk:text-[var(--sdk-primary-foreground-text)] sdk:absolute sdk:right-[15px] sdk:sm:right-[6px] sdk:top-[17px] sdk:sm:top-[6px] sdk:cursor-pointer"
          width={24}
          height={24}
        />
      </DialogClose>
      <div className="sdk:h-[500px] sdk:sm:h-full sdk:flex sdk:flex-col sdk:gap-[8px] sdk:w-full  sdk:pt-[8px] sdk:sm:pt-[8px]">
        <DialogTitle className="sdk:text-[var(--sdk-color-text-primary)] sdk:pb-[8px] sdk:text-[15px] sdk:font-geist sdk:font-semibold sdk:border-b sdk:border-[var(--sdk-color-border-primary)] sdk:aevatar-title">
          <p className="sdk:px-[8px] sdk:sm:px-[8px] ">Agent logs</p>
        </DialogTitle>
        <div className="sdk:px-[8px] sdk:sm:px-[8px] sdk:overflow-y-auto sdk:flex-1">
          <div className="sdk:mb-[16px]">
            <div className="sdk:flex sdk:gap-[4px] sdk:mb-[8px] sdk:items-center">
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
            <div className="sdk:py-[8px] sdk:bg-[var(--sdk-bg-background)] sdk:rounded-md sdk:border sdk:border-[var(--sdk-color-border-primary)] aevatar-json-tree-root">
              {renderDataContent(agentLogs?.inputData)}
            </div>
          </div>
          <div className="sdk:mb-[16px]">
            <div className="sdk:flex sdk:gap-[4px] sdk:mb-[8px] sdk:items-center">
              <span className="sdk:text-[var(--sdk-color-text-foreground)] sdk:text-xs sdk:leading-4 sdk:font-semibold">
                Agent state
              </span>
              <span className="sdk:flex sdk:gap-2">
                <button type="button">
                  <ToCopy
                    description="Execution log copied!"
                    toCopy={JSON.stringify(
                      agentLogs?.currentStateSnapshot ??
                        agentLogs?.agentState ??
                        {}
                    )}
                    icon={
                      <Copy size={14} color="var(--sdk-muted-foreground)" />
                    }
                  />
                </button>
              </span>
            </div>
            <div className="sdk:py-[8px] sdk:bg-[var(--sdk-bg-background)] sdk:rounded-md sdk:border sdk:border-[var(--sdk-color-border-primary)] aevatar-json-tree-root">
              {renderDataContent(
                agentLogs?.currentStateSnapshot ?? agentLogs?.agentState ?? {}
              )}
            </div>
          </div>
          <div className="sdk:mb-[16px]">
            <div className="sdk:flex sdk:gap-[4px] sdk:mb-[8px] sdk:items-center">
              <span className="sdk:text-[var(--sdk-color-text-foreground)] sdk:text-xs sdk:leading-4 sdk:font-semibold">
                Output
              </span>
              <span className="sdk:flex sdk:gap-2">
                <button type="button">
                  <ToCopy
                    description="Execution log copied!"
                    toCopy={JSON.stringify(agentLogs?.outputData ?? {})}
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
                    {agentLogs?.failureSummary ?? ""}
                  </p>
                </div>
              </div>
            )}
            <div className="sdk:py-[8px] sdk:bg-[var(--sdk-bg-background)] sdk:rounded-md sdk:border sdk:border-[var(--sdk-color-border-primary)] aevatar-json-tree-root">
              {renderDataContent(agentLogs?.outputData ?? {})}
            </div>
          </div>
        </div>
      </div>
    </DialogPrimitive.Content>
    //   </DialogPortal>
    // </Dialog>
  );
}
