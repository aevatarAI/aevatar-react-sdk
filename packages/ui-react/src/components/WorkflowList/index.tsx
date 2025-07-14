import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import WorkflowListInner from "../WorkflowListInner";
import { aevatarAI } from "../../utils";
import type {
  IAgentInfoDetail,
  IWorkflowCoordinatorState,
} from "@aevatar-react-sdk/services";
import { handleErrorMessage } from "../../utils/error";
import { useToast } from "../../hooks/use-toast";
import { sleep } from "@aevatar-react-sdk/utils";
import { AgentError } from "../../constants/error/agentError";
import DeleteGAevatarConfirm from "../DeleteGAevatarConfirm";
import clsx from "clsx";
import Loading from "../../assets/svg/loading.svg?react";

export interface IWorkflowListProps {
  className?: string;
  onEditWorkflow?: (workflowId: string) => void;
  onNewWorkflow?: () => void;
}

export interface IWorkflowListRef {
  refresh: () => void;
}

export default forwardRef(function WorkflowList(
  { className, onEditWorkflow, onNewWorkflow }: IWorkflowListProps,
  ref
) {
  const [workflows, setWorkflows] =
    useState<(IWorkflowCoordinatorState & IAgentInfoDetail)[]>();
  const [loading, setLoading] = useState(false);

  const fetchAllWorkflowList = useCallback(async () => {
    let pageIndex = 0;
    let allData: IAgentInfoDetail[] = [];
    let currentPageData: IAgentInfoDetail[] = [];

    while (true) {
      try {
        currentPageData = await aevatarAI.services.agent.getAgents({
          pageIndex,
          pageSize: 100,
          agentType:
            "Aevatar.GAgents.GroupChat.WorkflowCoordinator.WorkflowCoordinatorGAgent",
        });
      } catch (error) {
        break;
      }

      if (currentPageData.length === 0) {
        break;
      }

      allData = [...allData, ...currentPageData];
      pageIndex++;
    }

    return allData;
  }, []);

  useImperativeHandle(ref, () => ({
    refresh: () => {
      getWorkflows();
    },
  }));

  const { toast } = useToast();

  const getWorkflows = useCallback(async () => {
    try {
      const allList = await fetchAllWorkflowList();
      if (!allList.length) {
        setWorkflows([]);
        return;
      }

      const idList = allList.map((item) => item.id);
      const workflowAgentMap = new Map<string, IAgentInfoDetail>();
      allList.forEach((item) => {
        workflowAgentMap.set(item.id, item);
      });
      const queryString = `_id:${idList.join(" OR ")}`;
      const workflowList =
        await aevatarAI.services.workflow.getWorkflow<IWorkflowCoordinatorState>(
          {
            stateName: "WorkflowCoordinatorState",
            queryString,
          }
        );
      const workflowListWithAgentInfo = workflowList.items.map((item) => {
        const agentInfo = workflowAgentMap.get(item.blackboardId);
        return {
          ...item,
          ...agentInfo,
        };
      });
      setWorkflows(workflowListWithAgentInfo);
    } catch (error) {
      toast({
        title: "error",
        description: handleErrorMessage(error, "Something went wrong."),
        duration: 3000,
      });
    }
  }, [fetchAllWorkflowList, toast]);

  const getWorkflowsLoop = useCallback(async () => {
    setLoading(true);
    await getWorkflows();
    setLoading(false);

    // const interval = setInterval(() => {
    //   getWorkflows();
    // }, 10000);
    // return () => clearInterval(interval);
  }, [getWorkflows]);

  useEffect(() => {
    getWorkflowsLoop();
  }, [getWorkflowsLoop]);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteWorkflowIdRef = useRef<string>();

  const onDelete = useCallback(async () => {
    const { dismiss } = toast({
      description: (
        <div className="sdk:flex sdk:items-center sdk:gap-[5px]">
          <Loading
            className={clsx("aevatarai-loading-icon")}
            style={{ width: 14, height: 14 }}
          />
          <span>workflow deleting...</span>
        </div>
      ),
      duration: 0,
    });
    try {
      await aevatarAI.services.agent.deleteAgent(deleteWorkflowIdRef.current);
      dismiss();
      // TODO There will be some delay in cqrs
      await sleep(3000);
      getWorkflowsLoop();
    } catch (error) {
      console.error("deleteAgent:", error);
      dismiss();
      const errorMessage = handleErrorMessage(error, "Something went wrong.");
      if (errorMessage.includes(AgentError.AgentHasSubagents)) {
        setDeleteOpen(true);
        return;
      }

      toast({
        title: "error",
        description: handleErrorMessage(error, "Something went wrong."),
        duration: 3000,
      });
    }
  }, [toast, getWorkflowsLoop]);

  const onDeleteWorkflow = useCallback(
    async (workflow: IWorkflowCoordinatorState & IAgentInfoDetail) => {
      console.log(workflow, "onDeleteWorkflow");
      deleteWorkflowIdRef.current = workflow.id;
      onDelete();
    },
    [onDelete]
  );

  const onDeleteConfirm = useCallback(async () => {
    setDeleteOpen(false);
    const { dismiss } = toast({
      description: (
        <div className="sdk:flex sdk:items-center sdk:gap-[5px]">
          <Loading
            className={clsx("aevatarai-loading-icon")}
            style={{ width: 14, height: 14 }}
          />
          <span>workflow deleting all subagents...</span>
        </div>
      ),
      duration: 0,
    });
    try {
      const result = await aevatarAI.services.agent.removeAllSubAgent(
        deleteWorkflowIdRef.current
      );
      dismiss();

      await onDelete();

      console.log(result, "result==removeAllSubAgent");
    } catch (error) {
      console.error("removeAllSubAgent:", error);
      dismiss();
      toast({
        title: "error",
        description: handleErrorMessage(error, "Something went wrong."),
        duration: 3000,
      });
    }
    console.log("onDeleteConfirm");
  }, [onDelete, toast]);

  return (
    <>
      <WorkflowListInner
        className={className}
        loading={loading}
        workflowsList={workflows}
        onNewWorkflow={onNewWorkflow}
        onEditWorkflow={onEditWorkflow}
        onDeleteWorkflow={onDeleteWorkflow}
      />
      <DeleteGAevatarConfirm
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        handleConfirm={onDeleteConfirm}
        handleCancel={() => {
          setDeleteOpen(false);
        }}
      />
    </>
  );
});
