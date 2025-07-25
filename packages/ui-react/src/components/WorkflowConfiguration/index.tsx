import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, Dialog, DialogPortal } from "../ui";
import { type IWorkflowInstance, Workflow } from "../Workflow";
import Sidebar from "./sidebar";
import { ReactFlowProvider } from "@xyflow/react";
import { DnDProvider } from "../Workflow/DnDContext";
import WorkflowDialog from "./dialog";
import BackArrow from "../../assets/svg/back-arrow.svg?react";
import WorkflowSaveFailedModal, {
  SaveFailedError,
} from "../WorkflowSaveFailedModal";
import WorkflowUnsaveModal from "../WorkflowUnsaveModal";
import {
  type IAgentInfo,
  WorkflowStatus,
  type IAgentInfoDetail,
  type IAgentsConfiguration,
  type IWorkflowCoordinatorState,
  type IWorkflowUnitListItem,
} from "@aevatar-react-sdk/services";
import type { IWorkflowAevatarEditProps } from "../WorkflowAevatarEdit";
import { sleep } from "@aevatar-react-sdk/utils";
import Loading from "../../assets/svg/loading.svg?react";
import { aevatarAI } from "../../utils";
import { handleErrorMessage } from "../../utils/error";
import { useToast } from "../../hooks/use-toast";
import type { INode } from "../Workflow/types";
import clsx from "clsx";
import { useUpdateEffect } from "react-use";
import EditWorkflowNameDialog from "../EditWorkflowNameDialog";
import { useAevatar } from "../context/AevatarProvider";
import SidebarWithNewAgent from "./sidebarWithNewAgent";
import { useWorkflowState } from "../../hooks/useWorkflowState";
import WorkflowProvider, { useWorkflow } from "../context/WorkflowProvider";
import { basicWorkflow } from "../context/WorkflowProvider/actions";
import { DndProvider as ReactDndProvider } from "react-dnd";
import { TouchBackend } from "react-dnd-touch-backend";
import { HTML5Backend } from "react-dnd-html5-backend";

export interface IWorkflowConfigurationProps {
  sidebarConfig: {
    gaevatarList?: IAgentInfoDetail[];
    gaevatarTypeList?: IAgentsConfiguration[];
    isNewGAevatar?: boolean;
    type?: "newAgent" | "allAgent";
  };
  editWorkflow?: {
    workflowAgentId: string;
    workflowName: string;
    workUnitRelations: IWorkflowUnitListItem[];
  };
  extraControlBar?: React.ReactNode;
  onBack?: () => void;
  onSave?: (
    workflowAgentId: string,
    {
      workflowUnitList,
      workflowName,
    }: { workflowUnitList: IWorkflowUnitListItem[]; workflowName: string }
  ) => void;
  onGaevatarChange: IWorkflowAevatarEditProps["onGaevatarChange"];
}

const WorkflowConfigurationInner = ({
  sidebarConfig,
  editWorkflow,
  extraControlBar,
  onBack,
  onSave: onSaveHandler,
  onGaevatarChange,
}: IWorkflowConfigurationProps) => {
  const [container, setContainer] = React.useState(null);
  const { toast } = useToast();
  const [editAgentOpen, setEditAgentOpen] = useState(false);
  const [{ hiddenGAevatarType }] = useAevatar();

  const [{ selectedAgent: selectAgentInfo }, { dispatch }] = useWorkflow();

  const [newWorkflowState, setNewWorkflowState] =
    useState<IWorkflowConfigurationProps["editWorkflow"]>();

  const [unsavedModal, setUnsavedModal] = useState(false);

  const [saveFailed, setSaveFailed] = useState<boolean | SaveFailedError>(
    false
  );

  const workflowRef = useRef<IWorkflowInstance>();

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

  const [btnLoading, setBtnLoading] = useState<boolean>();

  const isWorkflowChanged = useRef<boolean>();
  const [workflowName, setWorkflowName] = useState<string>(
    editWorkflow?.workflowName ?? "untitled_workflow"
  );
  const isSaveRef = useRef<boolean>(true);

  useUpdateEffect(() => {
    setWorkflowName(editWorkflow?.workflowName ?? "untitled_workflow");
  }, [editWorkflow]);

  const onSave = useCallback(async () => {
    const workUnitRelations = workflowRef.current.getWorkUnitRelations();
    try {
      setBtnLoading(true);
      // workflowName
      if (!workUnitRelations.length) throw "Please finish workflow";
      let workflowAgentId = editWorkflow?.workflowAgentId;
      let workflowInfo: IAgentInfoDetail | IAgentInfo;
      if (editWorkflow?.workflowAgentId) {
        workflowInfo = await aevatarAI.services.workflow.edit(
          editWorkflow?.workflowAgentId,
          {
            name: workflowName,

            properties: {
              workflowUnitList: workUnitRelations,
            },
          }
        );
      } else {
        workflowInfo = await aevatarAI.services.workflow.create({
          name: workflowName,
          properties: {
            workflowUnitList: workUnitRelations,
          },
        });
        // TODO: add subAgents to receive publishEvent
        await aevatarAI.services.agent.addSubAgents(workflowInfo.id, {
          subAgents: [],
        });
        workflowAgentId = workflowInfo.id;
      }
      setNewWorkflowState({
        workflowAgentId: workflowAgentId,
        workflowName,
        workUnitRelations,
      });
      toast({
        description: "workflow saved successfully",
        duration: 3000,
      });
      isSaveRef.current = true;
      console.log(workflowInfo, "workflowInfo===");
      onSaveHandler?.(workflowAgentId, {
        workflowUnitList: workflowInfo?.properties?.workflowUnitList,
        workflowName: workflowInfo?.name,
      });
    } catch (error) {
      console.log("error===");
      toast({
        title: "error",
        description: handleErrorMessage(error, "create workflow error"),
        duration: 3000,
      });
    }
    setBtnLoading(false);
    // setSaveFailed(SaveFailedError.maxAgents);
  }, [editWorkflow, toast, onSaveHandler, workflowName]);

  const onConfirmSaveHandler = useCallback(
    (saved?: boolean) => {
      if (!saved) return onBack?.();
      return onSave?.();
    },
    [onBack, onSave]
  );

  const onDefaultGaevatarChange: IWorkflowAevatarEditProps["onGaevatarChange"] =
    useCallback(
      async (...params) => {
        const nodeId = params[2];
        const result = await onGaevatarChange(...params);
        workflowRef.current.setNodes((n) => {
          const newNodeList = n.map((item) => {
            if (item.id === nodeId) item.data.agentInfo = result;
            return item;
          });
          return [...newNodeList];
        });
        setEditAgentOpen(false);
        await sleep(50);
        dispatch(basicWorkflow.setSelectedAgent.actions(undefined));
        return result;
      },
      [onGaevatarChange, dispatch]
    );

  // const [stimulateResult, setStimulateResult] = useState<{
  //   data?: string;
  //   message?: string;
  // }>();

  // const onStimulate = useCallback(async () => {
  //   try {
  //     const workUnitRelations = workflowRef.current.getWorkUnitRelations();
  //     await sleep(1000);
  //     const result = await aevatarAI.services.workflow.simulate({
  //       workflowGrainId: "",
  //       workUnitRelations,
  //     });
  //     setStimulateResult({ data: result });
  //   } catch (error) {
  //     setStimulateResult({ message: handleErrorMessage(error) });
  //   }
  // }, []);

  const [disabledAgent, setDisabledAgent] = useState<string[]>();
  const [nodeList, setNodeList] = useState<INode[]>();

  const onUnsavedBack = useCallback(() => {
    if (!isSaveRef.current) {
      setUnsavedModal(true);
    } else {
      onBack?.();
    }
  }, [onBack]);

  const onNodesChanged = useCallback((nodes: INode[]) => {
    console.log(nodes, "nodes===onNodesChanged");
    setNodeList(nodes);
    // isSaveRef.current = false;
    setDisabledAgent(nodes.map((item) => item.id));
  }, []);

  useUpdateEffect(() => {
    isWorkflowChanged.current = true;
  }, [nodeList]);

  const { getWorkflowState } = useWorkflowState();
  const getWorkflowStateLoop = useCallback(
    async (workflowAgentId: string, term: number) => {
      let workflowStatus = WorkflowStatus.pending;
      let currentTerm = term;
      while (workflowStatus === WorkflowStatus.pending) {
        try {
          await sleep(1500);
          const workflowState = await getWorkflowState(workflowAgentId);
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

  useEffect(() => {
    if (editWorkflow?.workflowAgentId) {
      try {
        getWorkflowState(editWorkflow.workflowAgentId).then((res) => {
          if (res?.workflowStatus === WorkflowStatus.running) {
            setIsRunning(true);
          }
        });
      } catch (error) {
        console.error("getWorkflowState error:", error);
      }
    }
  }, [editWorkflow?.workflowAgentId, getWorkflowState]);

  const onRunWorkflow = useCallback(async () => {
    console.log("onRunWorkflow===");
    try {
      setIsRunning(true);
      const workUnitRelations = workflowRef.current.getWorkUnitRelations();
      if (!workUnitRelations.length || !newWorkflowState?.workUnitRelations) {
        toast({
          title: "error",
          description: "Please save your workflow before running it.",
          duration: 3000,
        });
        return;
      }
      const workflowAgentId =
        editWorkflow?.workflowAgentId ?? newWorkflowState?.workflowAgentId;
      if (!workflowAgentId) throw "workflowAgentId is required";
      const workflowState = await getWorkflowState(workflowAgentId);
      if (!workflowState) throw "workflow not found";
      if (workflowState.workflowStatus === WorkflowStatus.running)
        throw "workflow is running";
      if (workflowState.workflowStatus === WorkflowStatus.failed)
        throw "workflow is failed, please check the workflow";
      const term = workflowState.term;

      await aevatarAI.services.workflow.start({
        agentId: workflowAgentId,
        eventProperties: {},
      });
      const workflowStatus = await getWorkflowStateLoop(workflowAgentId, term);
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
  ]);

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
          <div className="sdk:flex sdk:gap-[24px] ">
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

            <EditWorkflowNameDialog
              className="sdk:hidden! sdk:sm:inline-flex!"
              disabled={isRunning}
              defaultName={workflowName}
              onSave={setWorkflowName}
            />
            <Button
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
            </Button>
          </div>
        </div>
        {/* content */}

        <div
          className="sdk:flex sdk:sm:h-[calc(100%-70px)] sdk:flex-1 sdk:relative sdk:sm:flex-row sdk:flex-col"
          ref={setContainer}>
          {/* Sidebar */}
          {sidebarConfig.type === "newAgent" && (
            <SidebarWithNewAgent
              disabled={isRunning}
              gaevatarTypeList={sidebarConfig?.gaevatarTypeList}
              hiddenGAevatarType={hiddenGAevatarType}
            />
          )}
          {(!sidebarConfig.type || sidebarConfig.type === "allAgent") && (
            <Sidebar
              disabled={isRunning}
              disabledGeavatarIds={disabledAgent}
              hiddenGAevatarType={hiddenGAevatarType}
              gaevatarList={sidebarConfig.gaevatarList}
              isNewGAevatar={sidebarConfig.isNewGAevatar}
              gaevatarTypeList={sidebarConfig?.gaevatarTypeList}
            />
          )}

          {/* Main Content */}
          <main className="sdk:flex-1 sdk:flex sdk:flex-col sdk:items-center sdk:justify-center sdk:relative">
            <Workflow
              extraControlBar={extraControlBar}
              editWorkflow={editWorkflow}
              editAgentOpen={editAgentOpen}
              gaevatarList={sidebarConfig?.gaevatarList}
              ref={workflowRef}
              onCardClick={onClickWorkflowItem}
              onNodesChanged={onNodesChanged}
              onRunWorkflow={onRunWorkflow}
              onRemoveNode={onRemoveNode}
              isRunning={isRunning}
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
                  agentItem={selectAgentInfo?.agent}
                  isNew={selectAgentInfo?.isNew}
                  nodeId={selectAgentInfo?.nodeId}
                  onClose={() => {
                    setEditAgentOpen(false);
                  }}
                  onGaevatarChange={onDefaultGaevatarChange}
                />
              </DialogPortal>
            </Dialog>
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
