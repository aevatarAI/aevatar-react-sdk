import React, { useCallback, useRef, useState } from "react";
import { Button, Dialog, DialogPortal } from "../ui";
import { type IWorkflowInstance, Workflow } from "../Workflow";
import Sidebar from "./sidebar";
import { ReactFlowProvider } from "@xyflow/react";
import { DnDProvider } from "../Workflow/DnDContext";
import WorkflowDialog from "./dialog";
import BackArrow from "../../assets/svg/back-arrow.svg?react";
import WorkflowSaveFailedModal, {
  type SaveFailedError,
} from "../WorkflowSaveFailedModal";
import WorkflowUnsaveModal from "../WorkflowUnsaveModal";
import type {
  IAgentInfoDetail,
  IAgentsConfiguration,
  IWorkflowUnitListItem,
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

export interface IWorkflowConfigurationProps {
  sidebarConfig: {
    gaevatarList?: IAgentInfoDetail[];
    gaevatarTypeList?: IAgentsConfiguration[];
    isNewGAevatar?: boolean;
  };
  editWorkflow?: {
    workflowAgentId: string;
    workflowName: string;
    workUnitRelations: IWorkflowUnitListItem[];
  };

  onBack?: () => void;
  onSave?: (workflowAgentId: string) => void;
  onGaevatarChange: IWorkflowAevatarEditProps["onGaevatarChange"];
}

const WorkflowConfiguration = ({
  sidebarConfig,
  editWorkflow,
  onBack,
  onSave: onSaveHandler,
  onGaevatarChange,
}: IWorkflowConfigurationProps) => {
  const [container, setContainer] = React.useState(null);
  const { toast } = useToast();
  const [editAgentOpen, setEditAgentOpen] = useState(false);
  const [selectAgentInfo, setSelectAgentInfo] = useState<{
    agent: Partial<IAgentInfoDetail>;
    isNew?: boolean;
    nodeId: string;
  }>();
  const [{ hiddenGAevatarType }] = useAevatar();

  const [unsavedModal, setUnsavedModal] = useState(false);

  const [saveFailed, setSaveFailed] = useState<boolean | SaveFailedError>(
    false
  );

  const workflowRef = useRef<IWorkflowInstance>();

  const onClickWorkflowItem = useCallback(
    (data: Partial<IAgentInfoDetail>, isNew: boolean, nodeId: string) => {
      setSelectAgentInfo({ agent: data, isNew, nodeId });
      setEditAgentOpen(true);
    },
    []
  );

  const [btnLoading, setBtnLoading] = useState<boolean>();

  const isWorkflowChanged = useRef<boolean>();
  const [workflowName, setWorkflowName] = useState<string>(
    editWorkflow?.workflowName ?? "untitled_workflow"
  );

  useUpdateEffect(() => {
    setWorkflowName(editWorkflow?.workflowName ?? "untitled_workflow");
  }, [editWorkflow]);

  const onSave = useCallback(async () => {
    const workUnitRelations = workflowRef.current.getWorkUnitRelations();
    try {
      setBtnLoading(true);
      console.log(workflowName, "workflowName===");
      // workflowName
      if (!workUnitRelations.length) throw "Please finish workflow";
      let workflowAgentId = editWorkflow?.workflowAgentId;
      if (editWorkflow?.workflowAgentId) {
        await aevatarAI.services.workflow.edit(editWorkflow?.workflowAgentId, {
          name: workflowName,

          properties: {
            workflowUnitList: workUnitRelations,
          },
        });
      } else {
        const result = await aevatarAI.services.workflow.create({
          name: workflowName,
          properties: {
            workflowUnitList: workUnitRelations,
          },
        });
        // TODO: add subAgents to receive publishEvent
        await aevatarAI.services.agent.addSubAgents(result.id, {
          subAgents: [],
        });
        workflowAgentId = result.id;
      }

      onSaveHandler?.(workflowAgentId);
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
  console.log(selectAgentInfo, "selectAgentInfo===");
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
        setSelectAgentInfo(undefined);
        return result;
      },
      [onGaevatarChange]
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
    setUnsavedModal(true);
  }, []);

  const onNodesChanged = useCallback((nodes: INode[]) => {
    setNodeList(nodes);
    setDisabledAgent(nodes.map((item) => item.id));
  }, []);

  useUpdateEffect(() => {
    isWorkflowChanged.current = true;
  }, [nodeList]);

  return (
    <ReactFlowProvider>
      <DnDProvider>
        <div className="sdk:h-full sdk:workflow-common flex flex-col">
          {/* header */}
          <div className=" sdk:relative sdk:w-full sdk:flex sdk:justify-between sdk:items-center sdk:border-b-[1px] sdk:px-[20px] sdk:py-[22px] sdk:sm:px-[40px] sdk:sm:py-[15px] sdk:workflow-common-border">
            <div className="sdk:flex sdk:text-[18px] sdk:flex sdk:items-center sdk:gap-[16px] sdk:font-syne sdk:workflow-title sdk:w-[146px] sdk:sm:w-[300px] sdk:flex-wrap">
              {onBack && (
                <BackArrow
                  role="img"
                  className="cursor-pointer"
                  onClick={onUnsavedBack}
                />
              )}
              workflow configuration
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
                defaultName={workflowName}
                onSave={setWorkflowName}
              />
              <Button
                variant="default"
                onClick={onSave}
                disabled={editAgentOpen}
                className={clsx(
                  "sdk:workflow-title-button-save sdk:cursor-pointer sdk:h-[30px]",
                  editAgentOpen && "sdk:workflow-title-button-save-disabled"
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
            <Sidebar
              disabledGeavatarIds={disabledAgent}
              hiddenGAevatarType={hiddenGAevatarType}
              gaevatarList={sidebarConfig.gaevatarList}
              isNewGAevatar={sidebarConfig.isNewGAevatar}
              gaevatarTypeList={sidebarConfig?.gaevatarTypeList}
            />

            {/* Main Content */}
            <main className="sdk:flex-1 sdk:flex sdk:flex-col sdk:items-center sdk:justify-center sdk:relative">
              <Dialog open={editAgentOpen} onOpenChange={setEditAgentOpen}>
                <Workflow
                  editWorkflow={editWorkflow}
                  gaevatarList={sidebarConfig?.gaevatarList}
                  ref={workflowRef}
                  onCardClick={onClickWorkflowItem}
                  onNodesChanged={onNodesChanged}
                />
                <DialogPortal container={container} asChild>
                  {/* <DialogOverlay /> */}
                  <WorkflowDialog
                    agentItem={selectAgentInfo?.agent}
                    isNew={selectAgentInfo?.isNew}
                    nodeId={selectAgentInfo?.nodeId}
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
      </DnDProvider>
    </ReactFlowProvider>
  );
};

export default WorkflowConfiguration;
