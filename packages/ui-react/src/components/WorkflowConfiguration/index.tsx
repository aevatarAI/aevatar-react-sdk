import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Dialog, DialogPortal } from "../ui";
import { type IWorkflowInstance, Workflow } from "../Workflow";
import { type Edge, ReactFlowProvider } from "@xyflow/react";
import { DnDProvider } from "../Workflow/DnDContext";
import WorkflowDialog from "./dialog";
import BackArrow from "../../assets/svg/back-arrow.svg?react";
import WorkflowSaveFailedModal, {
  SaveFailedError,
} from "../WorkflowSaveFailedModal";
import WorkflowUnsaveModal from "../WorkflowUnsaveModal";
import type {
  IAgentInfo,
  IAgentInfoDetail,
  IAgentsConfiguration,
  IWorkflowNode,
  IWorkflowViewDataParams,
} from "@aevatar-react-sdk/services";
import { WorkflowStatus } from "@aevatar-react-sdk/services";
import type { IWorkflowAevatarEditProps } from "../WorkflowAevatarEdit";
import { sleep } from "@aevatar-react-sdk/utils";
import { aevatarAI } from "../../utils";
import { useToast } from "../../hooks/use-toast";
import type { INode } from "../Workflow/types";
import clsx from "clsx";
import { useUpdateEffect } from "react-use";
import EditWorkflowNameDialog from "../EditWorkflowNameDialog";
import { useAevatar } from "../context/AevatarProvider";
import SidebarWithNewAgent from "./sidebarWithNewAgent";
import { useWorkflowState } from "../../hooks/useWorkflowState";
import { ExecutionLogs } from "./executionLogs";
import WorkflowProvider, { useWorkflow } from "../context/WorkflowProvider";
import { basicWorkflow } from "../context/WorkflowProvider/actions";
import { DndProvider as ReactDndProvider } from "react-dnd";
import { TouchBackend } from "react-dnd-touch-backend";
import { HTML5Backend } from "react-dnd-html5-backend";
import { SidebarSheet } from "./SidebarSheet";
import { getWorkflowViewDataByUnit } from "../utils";
import { isWorkflowDataEqual } from "../../utils/workflowDataComparison";
import dayjs from "dayjs";

export interface IWorkflowConfigurationState {
  workflowAgentId: string;
  workflowId?: string;
  workflowName: string;
  workflowViewData: IWorkflowViewDataParams;
}
export interface IWorkflowConfigurationProps {
  sidebarConfig: {
    gaevatarList?: IAgentInfoDetail[];
    gaevatarTypeList?: IAgentsConfiguration[];
    isNewGAevatar?: boolean;
  };
  editWorkflow?: IWorkflowConfigurationState;
  extraControlBar?: React.ReactNode;
  onBack?: () => void;
}

const WorkflowConfigurationInner = ({
  sidebarConfig,
  editWorkflow,
  extraControlBar,
  onBack,
}: // onSave: onSaveHandler,
// onGaevatarChange,
IWorkflowConfigurationProps) => {
  const [container, setContainer] = React.useState(null);
  const { toast } = useToast();
  const [editAgentOpen, setEditAgentOpen] = useState(false);
  const [{ hiddenGAevatarType }] = useAevatar();

  const [gaevatarList, setGaevatarList] = useState<IAgentInfoDetail[]>(
    sidebarConfig?.gaevatarList ?? []
  );

  useUpdateEffect(() => {
    setGaevatarList((v) => {
      const newList = [...v];
      if (sidebarConfig?.gaevatarList) {
        sidebarConfig.gaevatarList.forEach((item) => {
          const index = newList.findIndex((v) => v.id === item.id);
          if (index !== -1) newList[index] = item;
          else newList.push(item);
        });
      }
      return newList;
    });
  }, [sidebarConfig?.gaevatarList]);

  const [{ selectedAgent: selectAgentInfo }, { dispatch }] = useWorkflow();

  const [newWorkflowState, setNewWorkflowState] =
    useState<IWorkflowConfigurationProps["editWorkflow"]>();

  const [unsavedModal, setUnsavedModal] = useState(false);

  const [saveFailed, setSaveFailed] = useState<boolean | SaveFailedError>(
    false
  );

  const [autoSavedTime, setAutoSavedTime] = useState<number>(Date.now());

  const workflowRef = useRef<IWorkflowInstance>();

  const gaevatarListRef = useRef<IAgentInfoDetail[]>(gaevatarList);
  useEffect(() => {
    gaevatarListRef.current = gaevatarList;
  }, [gaevatarList]);

  const onClickWorkflowItem = useCallback(
    (data: Partial<IAgentInfoDetail>, isNew: boolean, nodeId: string) => {
      dispatch(
        basicWorkflow.setSelectedAgent.actions({ agent: data, isNew, nodeId })
      );
      setEditAgentOpen(true);
    },
    [dispatch]
  );

  useUpdateEffect(() => {
    !editAgentOpen &&
      dispatch(basicWorkflow.setSelectedAgent.actions(undefined));
  }, [editAgentOpen]);

  const selectAgentInfoRef = useRef<{
    agent: Partial<IAgentInfoDetail>;
    isNew?: boolean;
    nodeId: string;
  }>();

  useEffect(() => {
    selectAgentInfoRef.current = selectAgentInfo;
  }, [selectAgentInfo]);

  const onRemoveNode = useCallback(
    (nodeId: string) => {
      if (selectAgentInfoRef.current?.nodeId === nodeId) {
        dispatch(basicWorkflow.setSelectedAgent.actions(undefined));
        setEditAgentOpen(false);
      }
    },
    [dispatch]
  );

  const [workflowName, setWorkflowName] = useState<string>(
    editWorkflow?.workflowName ?? "untitled_workflow"
  );
  const [nodeList, setNodeList] = useState<INode[]>();
  const nodeListRef = useRef<INode[]>();
  useEffect(() => {
    nodeListRef.current = nodeList;
  }, [nodeList]);

  useUpdateEffect(() => {
    setWorkflowName(editWorkflow?.workflowName ?? "untitled_workflow");
  }, [editWorkflow?.workflowName]);

  const publishWorkflow = useCallback(
    async ({ agentId }: { agentId: string }) => {
      try {
        return aevatarAI.services.workflow.publishWorkflowViewData(agentId);
      } catch (error) {
        console.error("publishWorkflow error:", error);
        return;
      }
    },
    []
  );

  const getWorkflowViewData = useCallback(() => {
    const workUnitRelations = workflowRef.current.getWorkUnitRelations();
    const { workflowNodeList, workflowNodeUnitList } =
      getWorkflowViewDataByUnit(
        gaevatarListRef.current,
        workUnitRelations,
        nodeListRef.current
      );
    return {
      name: workflowName,
      properties: {
        workflowNodeList,
        workflowNodeUnitList,
        name: workflowName,
      },
    };
  }, [workflowName]);

  const updateNodeList = useCallback((nodeList: IWorkflowNode[]) => {
    setNodeList((n) => {
      return n?.map((item) => {
        const node = nodeList.find((v) => v.nodeId === item.id);
        if (node)
          item.data.agentInfo = {
            ...item.data.agentInfo,
            ...node,
            id: node.agentId || item.data.agentInfo.id,
          };
        return item;
      });
    });
  }, []);

  const onSaveHandler = useCallback(async () => {
    const workflowViewData = getWorkflowViewData();
    let result: IAgentInfo;

    const workflowId = newWorkflowState?.workflowId || editWorkflow?.workflowId;

    if (newWorkflowState?.workflowAgentId || editWorkflow?.workflowAgentId) {
      const updateParam: any = { ...workflowViewData };
      updateParam.properties.workflowCoordinatorGAgentId = workflowId;

      result = await aevatarAI.services.workflow.updateWorkflowViewData(
        newWorkflowState?.workflowAgentId || editWorkflow?.workflowAgentId,
        updateParam
      );
    } else {
      if (
        !workflowViewData.properties.workflowNodeList.length &&
        !workflowViewData.properties.workflowNodeUnitList.length
      ) {
        throw new Error("workflowNodeList or workflowNodeUnitList is empty");
      }
      result = await aevatarAI.services.workflow.createWorkflowViewData(
        workflowViewData
      );
    }
    workflowViewDataRef.current = workflowViewData;

    const newState = {
      workflowAgentId: result.id,
      workflowViewData,
      workflowName: workflowViewData.name,
    };
    setNewWorkflowState((v) => ({ ...v, ...newState }));

    const publishResult = await publishWorkflow({ agentId: result.id });
    if (publishResult) {
      updateNodeList(publishResult?.properties?.workflowNodeList);
      setNewWorkflowState((v) => ({
        ...v,
        workflowId: publishResult.properties.workflowCoordinatorGAgentId,
      }));
    }

    return {
      workflowAgentId: result.id,
      workflowViewData,
      workflowName: workflowViewData.name,
    };
  }, [
    getWorkflowViewData,
    publishWorkflow,
    newWorkflowState,
    editWorkflow,
    updateNodeList,
  ]);

  // Auto save with debounce when nodeList changes
  const autoSaveTimerRef = useRef<NodeJS.Timeout>();
  const onSaveRef = useRef(onSaveHandler);

  // Update ref when onSave changes
  useEffect(() => {
    onSaveRef.current = onSaveHandler;
  }, [onSaveHandler]);

  const workflowViewDataRef = useRef<IWorkflowViewDataParams>();

  const debouncedAutoSave = useCallback(() => {
    if (isRunningRef.current) return;
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        await onSaveRef.current();
        setAutoSavedTime(Date.now());
      } catch (error) {
        console.error("Auto save failed:", error);
      }
    }, 5000); // 7 seconds delay
  }, []); // No dependencies to prevent recreation

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    debouncedAutoSave();
  }, [debouncedAutoSave, workflowName]);

  const onConfirmSaveHandler = useCallback(
    async (saved?: boolean) => {
      if (!saved) return onBack?.();
      try {
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current);
        }
        await onSaveRef.current();
        onBack?.();
      } catch (error) {
        console.error("onConfirmSaveHandler error:", error);
        toast({
          title: "error",
          description: "save failed, please try again.",
          duration: 3000,
        });
      }
    },
    [onBack, toast]
  );

  // TODO: mock api create gaevatar
  const onGaevatarChange: IWorkflowAevatarEditProps["onGaevatarChange"] =
    useCallback(
      async (isNew, data, nodeId, propertyJsonSchema) => {
        const agentInfo: IAgentInfoDetail = {
          id: data.agentId || nodeId,
          name: data.params.name,
          agentType: data.params.agentType,
          properties: data.params.properties,
          propertyJsonSchema,
          businessAgentGrainId: nodeId,
          agentGuid: nodeId,
        };
        setGaevatarList((v) => {
          const newList = [...v];
          const index = newList.findIndex((v) => v.id === data.agentId);
          if (index !== -1) newList[index] = agentInfo;
          else newList.push(agentInfo);
          return newList;
        });
        dispatch(
          basicWorkflow.setSelectedAgent.actions({
            agent: agentInfo,
            isNew,
            nodeId,
          })
        );
        return agentInfo;
      },
      [dispatch]
    );

  const onDefaultGaevatarChange: IWorkflowAevatarEditProps["onGaevatarChange"] =
    useCallback(
      async (...params) => {
        const nodeId = params[2];

        const result = await onGaevatarChange(...params);

        if (!result) return;
        workflowRef.current.setNodes((n) => {
          const newNodeList = n.map((item) => {
            if (item.id === nodeId) item.data.agentInfo = result;
            return item;
          });
          return [...newNodeList];
        });
        // setEditAgentOpen(false);
        // await sleep(50);
        // dispatch(basicWorkflow.setSelectedAgent.actions(undefined));
        return result;
      },
      [onGaevatarChange]
    );

  const onUnsavedBack = useCallback(() => {
    const viewData = getWorkflowViewData();
    const preViewData =
      workflowViewDataRef.current ?? editWorkflow?.workflowViewData;
    console.log(viewData, preViewData, "viewData===");
    if (isWorkflowDataEqual(viewData, preViewData)) {
      onBack?.();
    } else {
      setUnsavedModal(true);
    }
  }, [onBack, getWorkflowViewData, editWorkflow?.workflowViewData]);

  const onNodesChanged = useCallback(
    (nodes: INode[]) => {
      setNodeList((n) => {
        return nodes.map((item) => {
          const node = n?.find((v) => v?.id === item?.id);
          if (
            node &&
            (item.data.agentInfo.id === item.id || !item.data.agentInfo.id)
          ) {
            item.data.agentInfo.id =
              node.data.agentInfo.id || item.data.agentInfo.id;
          }
          return item;
        });
      });
      const isHasNode = nodes.some((i) => {
        return i.id === selectAgentInfo?.nodeId;
      });
      if (!isHasNode) {
        dispatch(basicWorkflow.setSelectedAgent.actions(undefined));
        setEditAgentOpen(false);
      }
      // Trigger auto save with debounce
      debouncedAutoSave();
    },
    [debouncedAutoSave, selectAgentInfo?.nodeId, dispatch]
  );

  const selectAgent = useMemo(() => {
    return (
      gaevatarList.find((item) => item.id === selectAgentInfo?.nodeId) ||
      selectAgentInfo?.agent
    );
  }, [gaevatarList, selectAgentInfo?.nodeId, selectAgentInfo?.agent]);

  const { getWorkflowState } = useWorkflowState();
  const looperWorkflowIdRef = useRef<string>();

  useEffect(() => {
    return () => {
      looperWorkflowIdRef.current = undefined;
    };
  }, []);

  const getWorkflowStateLoop = useCallback(
    async (workflowId: string, term: number) => {
      let workflowStatus = WorkflowStatus.pending;
      let currentTerm = term;
      looperWorkflowIdRef.current = workflowId;
      while (workflowStatus === WorkflowStatus.pending) {
        try {
          if (looperWorkflowIdRef.current !== workflowId) return;
          await sleep(1500);
          const workflowState = await getWorkflowState(workflowId);
          if (!workflowState) throw "workflow not found";
          currentTerm = workflowState.term;

          if (currentTerm > term) return WorkflowStatus.running;

          workflowStatus = workflowState.workflowStatus;
        } catch (error) {
          workflowStatus = WorkflowStatus.failed;
        }
      }
      return workflowStatus;
    },
    [getWorkflowState]
  );

  const [isRunning, setIsRunning] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const isRunningRef = useRef(isRunning);
  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  useEffect(() => {
    if (editWorkflow?.workflowId) {
      try {
        getWorkflowState(editWorkflow.workflowId).then((res) => {
          if (res?.workflowStatus === WorkflowStatus.running) {
            setIsRunning(true);
          }
        });
      } catch (error) {
        console.error("getWorkflowState error:", error);
      }
    }
  }, [editWorkflow?.workflowId, getWorkflowState]);

  const onRunWorkflow = useCallback(async () => {
    try {
      setIsRunning(true);
      const workUnitRelations = workflowRef.current.getWorkUnitRelations();
      if (!workUnitRelations.length) {
        toast({
          title: "error",
          description: "Please check your workflow before running it.",
          duration: 3000,
        });
        return;
      }
      let workflowId = editWorkflow?.workflowId ?? newWorkflowState?.workflowId;
      if (!workflowId) {
        // TODO auto save and publish workflow
        const result = await onSaveHandler();
        workflowId = result.workflowAgentId;
      }
      const workflowState = await getWorkflowState(workflowId);
      if (!workflowState) throw "workflow not found";
      if (workflowState.workflowStatus === WorkflowStatus.running)
        throw "workflow is running";
      if (workflowState.workflowStatus === WorkflowStatus.failed)
        throw "workflow is failed, please check the workflow";
      const term = workflowState.term;

      await aevatarAI.services.workflow.start({
        agentId: workflowId,
        eventProperties: {},
      });
      const workflowStatus = await getWorkflowStateLoop(workflowId, term);
      if (workflowStatus === WorkflowStatus.failed)
        throw "workflow is failed, please check the workflow";
      if (workflowStatus === WorkflowStatus.running) {
        toast({
          title: "success",
          description: "workflow executed successfully.",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("run workflow error:", error);
      setSaveFailed(SaveFailedError.workflowExecutionFailed);
    } finally {
      setIsRunning(false);
    }
  }, [
    editWorkflow,
    newWorkflowState,
    toast,
    getWorkflowState,
    getWorkflowStateLoop,
    onSaveHandler,
  ]);

  const [sidebarContainer, setSidebarContainer] = React.useState(null);
  const onStopWorkflow = useCallback(async () => {
    setIsStopping(true);
    await sleep(1000);
    setIsStopping(false);
  }, []);

  const onNewNode = useCallback((nodeAgentInfo: Partial<IAgentInfoDetail>) => {
    setGaevatarList((v) => {
      const newList = [...v];
      const index = newList.findIndex((v) => v.id === nodeAgentInfo.id);
      if (index !== -1)
        newList[index] = {
          ...newList[index],
          ...nodeAgentInfo,
        } as IAgentInfoDetail;
      else newList.push(nodeAgentInfo as IAgentInfoDetail);
      return newList;
    });
  }, []);

  const onEdgesChanged = useCallback(
    (_edges: Edge[]) => {
      debouncedAutoSave();
    },
    [debouncedAutoSave]
  );

  return (
    <>
      <div className="sdk:h-full sdk:workflow-common flex flex-col sdk:font-outfit">
        {/* header */}
        <div className=" sdk:relative sdk:w-full sdk:flex sdk:justify-between sdk:items-center sdk:border-b-[1px] sdk:px-[20px] sdk:py-[12px] sdk:sm:px-[16px] sdk:sm:py-[8px] sdk:workflow-common-border">
          <div
            className={clsx(
              "sdk:flex sdk:text-[18px] sdk:flex sdk:items-center sdk:gap-[16px] sdk:font-outfit sdk:workflow-title sdk:flex-wrap",
              "sdk:items-center"
            )}>
            {onBack && (
              <BackArrow
                role="img"
                className="cursor-pointer"
                onClick={onUnsavedBack}
              />
            )}
            <div>
              <div className="sdk:font-semibold">workflow configuration</div>
              <EditWorkflowNameDialog
                disabled={isRunning}
                className="sdk:inline-flex sdk:sm:hidden"
                defaultName={workflowName}
                onSave={setWorkflowName}
              />
            </div>
          </div>
          <div className="sdk:flex sdk:gap-[24px] sdk:items-center">
            {/* <Dialog>
                <DialogTrigger asChild>
                  <Button
                    onClick={onStimulate}
                    variant="outline"
                    className="sdk:workflow-common-border-stimulate sdk:cursor-pointer sdk:h-[30px]">
                    stimulate
                  </Button>
                </DialogTrigger>
                <DialogPortal container={container} asChild>
                  <DialogOverlay />
                  <DialogStimulate
                    data={stimulateResult?.data}
                    message={stimulateResult?.message}
                  />
                </DialogPortal>
              </Dialog> */}

            <div className="sdk:text-[13px] sdk:text-[#6F6F6F] sdk:font-outfit sdk:font-normal sdk:leading-[16px] sdk:text-lowercase">{`auto-saved ${dayjs(
              autoSavedTime
            ).format("HH:mm:ss")}`}</div>

            <EditWorkflowNameDialog
              className="sdk:hidden! sdk:sm:inline-flex!"
              disabled={isRunning}
              defaultName={workflowName}
              onSave={setWorkflowName}
            />
            {/* <Button
              variant="default"
              onClick={onSave}
              disabled={editAgentOpen || isRunning}
              className={clsx(
                "sdk:workflow-title-button-save sdk:cursor-pointer sdk:h-[30px]",
                (editAgentOpen || isRunning) &&
                  "sdk:workflow-title-button-save-disabled"
              )}>
              {btnLoading && (
                <Loading
                  key={"save"}
                  className={clsx("aevatarai-loading-icon")}
                  style={{ width: 14, height: 14 }}
                />
              )}
              save
            </Button> */}
          </div>
        </div>
        {/* content */}

        <div
          className="sdk:flex sdk:sm:h-[calc(100%-70px)] sdk:flex-1 sdk:relative sdk:sm:flex-row sdk:flex-col"
          ref={setContainer}>
          {/* Sidebar */}
          <div className="sdk:relative" ref={setSidebarContainer}>
            <SidebarSheet
              container={sidebarContainer}
              disabled={isRunning}
              gaevatarTypeList={sidebarConfig?.gaevatarTypeList}
              hiddenGAevatarType={hiddenGAevatarType}
            />
          </div>

          {/* Main Content */}
          <main className="sdk:flex-1 sdk:flex sdk:flex-col sdk:items-center sdk:justify-center sdk:relative">
            <Workflow
              extraControlBar={extraControlBar}
              editWorkflow={editWorkflow}
              editAgentOpen={editAgentOpen}
              gaevatarList={gaevatarList}
              gaevatarTypeList={sidebarConfig?.gaevatarTypeList}
              ref={workflowRef}
              onCardClick={onClickWorkflowItem}
              onNodesChanged={onNodesChanged}
              onEdgesChanged={onEdgesChanged}
              onRunWorkflow={onRunWorkflow}
              onStopWorkflow={onStopWorkflow}
              onRemoveNode={onRemoveNode}
              onNewNode={onNewNode}
              isRunning={isRunning}
              isStopping={isStopping}
            />
            <Dialog
              open={editAgentOpen}
              modal={false}
              onOpenChange={(v) => {
                console.log(v, "editAgentOpen=onClickWorkflowItem");
                // setEditAgentOpen(v);
              }}>
              <DialogPortal container={container} asChild>
                {/* <DialogOverlay /> */}
                <WorkflowDialog
                  disabled={isRunning}
                  agentItem={selectAgent}
                  isNew={selectAgentInfo?.isNew}
                  nodeId={selectAgentInfo?.nodeId}
                  onClose={() => {
                    setEditAgentOpen(false);
                  }}
                  onGaevatarChange={onDefaultGaevatarChange}
                />
              </DialogPortal>
            </Dialog>
            <div className="sdk:flex sdk:justify-center sdk:min-w-[100%] sdk:pl-[8px] sdk:pr-[8px] sdk:pb-[8px]">
              <ExecutionLogs
                stateName="WorkflowExecutionRecordState"
                workflowId={editWorkflow?.workflowAgentId}
                roundId={1}
              />
            </div>
          </main>
        </div>
      </div>

      <WorkflowSaveFailedModal
        saveFailed={saveFailed}
        // onSaveFailed={onSaveFailed}
        onOpenChange={setSaveFailed}
      />

      <WorkflowUnsaveModal
        open={unsavedModal}
        onOpenChange={setUnsavedModal}
        onSaveHandler={onConfirmSaveHandler}
      />
    </>
  );
};

export default function WorkflowConfiguration(
  props: IWorkflowConfigurationProps
) {
  // Determine if it is a mobile device
  const isMobile =
    typeof window !== "undefined" &&
    ("ontouchstart" in window || navigator.maxTouchPoints > 0);
  return (
    <ReactFlowProvider>
      <ReactDndProvider
        backend={isMobile ? TouchBackend : HTML5Backend}
        options={isMobile ? { enableMouseEvents: true } : undefined}>
        <DnDProvider>
          <WorkflowProvider>
            <WorkflowConfigurationInner {...props} />
          </WorkflowProvider>
        </DnDProvider>
      </ReactDndProvider>
    </ReactFlowProvider>
  );
}
