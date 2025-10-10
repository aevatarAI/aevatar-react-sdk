/**
 * Execution logs related type definitions
 * Provides type safety for workflow execution logs functionality
 */

/**
 * Execution log status values
 * Maps to the status values returned by transformStatus function
 */
export type ExecutionLogStatus = "pending" | "running" | "success" | "failed";

/**
 * Agent state information from workflow execution
 */
export interface AgentState {
  grainId: string;
  [key: string]: any;
}

/**
 * Individual execution log item
 * Represents a single execution record with all related data
 */
export interface ExecutionLogItem {
  /** Execution status after transformation */
  status: ExecutionLogStatus;
  /** Execution start time */
  startTime: string;
  /** Execution end time */
  endTime: string;
  /** Execution duration in milliseconds */
  duration: number;
  /** Parsed input data for the execution */
  inputData: any;
  /** Parsed output data from the execution */
  outputData: any;
  /** Parsed current state snapshot from the execution */
  currentStateSnapshot: any;
  /** Execution time in milliseconds */
  executionTime: number;
  /** Agent state information */
  agentState: AgentState;
  /** Failure summary if execution failed */
  failureSummary?: any;
  /** Unique identifier for the execution record */
  grainId: string;
}

/**
 * Parameters for fetching execution logs
 */
export interface FetchExecutionLogsParams {
  /** State name for the workflow */
  stateName: string;
  /** Workflow identifier */
  workflowId: string;
}

/**
 * Response type for fetchExecutionLogs function
 * Returns an array of execution log items
 */
export type FetchExecutionLogsResponse = ExecutionLogItem[];
