import { useEffect, useState } from "react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui";
import Loading from "../../assets/svg/loading.svg?react";
import AIStar from "../../assets/svg/aiStar.svg?react";
import Close from "../../assets/svg/close.svg?react";
import clsx from "clsx";
import { usePostAIWorkflowGeneration } from "../../hooks/usePostAIWorkflowGeneration";

interface IWorkflowGenerationModalProps {
  workflowRef: any;
}

export const WorkflowGenerationModal = ({
  workflowRef,
}: IWorkflowGenerationModalProps) => {
  const { data, isLoading, refetch } = usePostAIWorkflowGeneration();
  const [isVisible, setIsVisible] = useState(true);
  const [inputPrompt, setInputPrompt] = useState("");

  useEffect(() => {
    if (data && workflowRef) {
      workflowRef?.current.onAiGenerateWorkflow(data);
    }
  }, [data, workflowRef]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleChange = (e) => {
    setInputPrompt(e.target.value);
  };

  const handleClick = async () => {
    await refetch(inputPrompt);
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      <div className="sdk:bg-[#000000] sdk:fixed sdk:inset-0 sdk:opacity-50 sdk:z-99" />
      <div className="sdk:flex sdk:justify-center sdk:p-[20px] sdk:bg-[#171717] sdk:absolute sdk:top-[25%] sdk:border sdk:border-[#FFFFFF14] sdk:rounded-md sdk:z-100">
        <div className="sdk:flex sdk:flex-col sdk:gap-[28px]">
          <div className="sdk:flex sdk:justify-between">
            <span className="sdk:font-outfit sdk:font-semibold sdk:text-[18px] sdk:bg-gradient-to-r sdk:from-white sdk:to-[#999] sdk:bg-clip-text sdk:text-transparent sdk:lowercase">
              generate workflow with ai
            </span>
            <button
              className="sdk:cursor-pointer"
              type="button"
              onClick={handleClose}
            >
              <Close />
            </button>
          </div>

          <div className="sdk:flex sdk:flex-col sdk:gap-2">
            <span className="sdk:text-[14px] sdk:text-[#B9B9B9]-600">
              prompt
            </span>
            <Textarea
              className="sdk:text-[13px] sdk:bg-[#171717] sdk:min-w-[595px] sdk:min-h-[120px]"
              placeholder="please describe what kind of agent workflow you want to create"
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="sdk:flex sdk:flex-row sdk:justify-between">
            <Button
              type="button"
              className="max-w-[35px] max-h-[35px]"
              onClick={handleClose}
              disabled={isLoading}
            >
              <span className="sdk:text-[14px] sdk:text-[#B9B9B9]-600">
                skip
              </span>
            </Button>
            <Button
              type="button"
              className={`sdk:min-w-[114px] ${isLoading && "sdk:bg-[#ffffff]"}`}
              disabled={!inputPrompt || isLoading}
              onClick={handleClick}
            >
              {isLoading ? (
                <Loading
                  key="generate"
                  className={clsx("aevatarai-loading-icon")}
                  style={{ width: 10, height: 10 }}
                />
              ) : (
                <div className="sdk:flex sdk:flex-row sdk:items-center sdk:gap-[5px]">
                  <AIStar />
                  <span className="sdk:text-[14px] sdk:text-[#B9B9B9]-600">
                    generate
                  </span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
