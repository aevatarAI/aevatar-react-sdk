import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { v4 as uuidv4 } from "uuid";
import WorkflowListInner from "../WorkflowListInner";
import { aevatarAI } from "../../utils";
import type {
  IAgentInfoDetail,
  IWorkflowCoordinatorState,
  IWorkflowViewDataParams,
} from "@aevatar-react-sdk/services";
import { handleErrorMessage } from "../../utils/error";
import { useToast } from "../../hooks/use-toast";
import { sleep } from "@aevatar-react-sdk/utils";
import { AgentError } from "../../constants/error/agentError";
import DeleteGAevatarConfirm from "../DeleteGAevatarConfirm";
import clsx from "clsx";
import Loading from "../../assets/svg/loading.svg?react";
import { IS_NULL_ID } from "../../constants";
import type { IWorkflowConfigurationState } from "../WorkflowConfiguration";
import { useToastLoading } from "../../hooks/useToastLoading";

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
          agentType: "Aevatar.GAgents.Workflow.WorkflowViewGAgentPlus",
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

      const idList = allList
        .map((item) => item.properties?.workflowCoordinatorGAgentId)
        .filter((item) => item && item !== IS_NULL_ID);
      // const workflowAgentMap = new Map<string, IAgentInfoDetail>();
      // allList.forEach((item) => {
      //   workflowAgentMap.set(item.id, item);
      // });
      const workflowListAgentInfoMap = new Map<
        string,
        IWorkflowCoordinatorState
      >();

      if (idList.length) {
        const queryString = `_id:${idList.join(" OR ")}`;
        const workflowList =
          await aevatarAI.services.workflow.getWorkflow<IWorkflowCoordinatorState>(
            {
              stateName: "WorkflowCoordinatorStatePlus",
              queryString,
            }
          );

        workflowList.items.forEach((item) => {
          workflowListAgentInfoMap.set(item.blackboardId, item);
        });
      }

      const workflowListWithAgentInfo = allList.map((item) => {
        const agentInfo = workflowListAgentInfoMap.get(
          item.properties?.workflowCoordinatorGAgentId
        );
        return {
          ...item,
          ...agentInfo,
        };
      });

      // const workflowListWithAgentInfo = workflowList.items.map((item) => {
      //   const agentInfo = workflowAgentMap.get(item.blackboardId);
      //   return {
      //     ...item,
      //     ...agentInfo,
      //   };
      // });

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
  const deleteWorkflowViewIdRef = useRef<string>();
  const deleteWorkflowIdRef = useRef<string>();

  const toastLoading = useToastLoading();

  const onDelete = useCallback(async () => {
    const { dismiss } = toast({
      description: (
        <div className="sdk:flex sdk:items-center sdk:gap-[5px]">
          <Loading
            className={clsx("aevatarai-loading-icon")}
            style={{ width: 14, height: 14 }}
          />
          <span>Workflow deleting...</span>
        </div>
      ),
      duration: 0,
    });
    try {
      if (deleteWorkflowIdRef.current)
        await aevatarAI.services.agent.deleteAgent(deleteWorkflowIdRef.current);

      await aevatarAI.services.agent.deleteAgent(
        deleteWorkflowViewIdRef.current
      );

      dismiss();
      // TODO There will be some delay in cqrs
      await sleep(1500);
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
      deleteWorkflowViewIdRef.current = workflow.id;

      const workflowCoordinatorGAgentId =
        workflow.properties?.workflowCoordinatorGAgentId;
      if (
        workflowCoordinatorGAgentId &&
        workflowCoordinatorGAgentId !== IS_NULL_ID
      ) {
        deleteWorkflowIdRef.current = workflowCoordinatorGAgentId;
      } else {
        deleteWorkflowIdRef.current = undefined;
      }
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
          <span>Workflow deleting all subagents...</span>
        </div>
      ),
      duration: 0,
    });
    try {
      if (deleteWorkflowIdRef.current)
        await aevatarAI.services.agent.removeAllSubAgent(
          deleteWorkflowIdRef.current
        );
      // const result = await aevatarAI.services.agent.removeAllSubAgent(
      //   deleteWorkflowViewIdRef.current
      // );
      dismiss();

      await onDelete();
    } catch (error) {
      console.error("removeAllSubAgent:", error);
      dismiss();
      toast({
        title: "error",
        description: handleErrorMessage(error, "Something went wrong."),
        duration: 3000,
      });
    }
  }, [onDelete, toast]);

  const onDuplicateWorkflow = useCallback(
    async (workflow: IWorkflowCoordinatorState & IAgentInfoDetail) => {
      console.log("workflowId===", workflow);
      const randomId = uuidv4().replace(/-/g, '').substring(0, 6)
      const workflowName = `${workflow.name}_${randomId}`;
      const workflowNodeList = workflow.properties?.workflowNodeList?.map(
        (item) => {
          return {
            ...item,
            agentId: IS_NULL_ID,
          };
        }
      );

      const workflowViewData = {
        name: workflowName,
        properties: {
          workflowNodeList,
          workflowNodeUnitList: workflow.properties?.workflowNodeUnitList,
          name: workflowName,
        },
      };
      const { dismiss } = toastLoading("Copying workflow");

      try {
        const result = await aevatarAI.services.workflow.createWorkflowViewData(
          workflowViewData
        );
        dismiss();
        if (result.id) onEditWorkflow?.(result?.id);
      } catch (error) {
        dismiss();
        toast({
          description: handleErrorMessage(error, "Something went wrong."),
        });
      }
    },
    [onEditWorkflow, toastLoading, toast]
  );

  return (
    <>
      <WorkflowListInner
        className={className}
        loading={loading}
        workflowsList={workflows}
        onNewWorkflow={onNewWorkflow}
        onEditWorkflow={onEditWorkflow}
        onDeleteWorkflow={onDeleteWorkflow}
        onDuplicateWorkflow={onDuplicateWorkflow}
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
