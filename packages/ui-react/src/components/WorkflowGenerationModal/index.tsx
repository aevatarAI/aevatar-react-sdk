import { useEffect, useState } from "react";
import { Textarea } from "../ui/textarea";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui";
import Loading from "../../assets/svg/loading.svg?react";
import AIStar from "../../assets/svg/aiStar.svg?react";
import Close from "../../assets/svg/close.svg?react";
import clsx from "clsx";
import { usePostAIWorkflowGeneration } from "../../hooks/usePostAIWorkflowGeneration";
import "./index.css";
import { useGetAutoComplete } from "../../hooks/useGetAutoComplete";
interface IWorkflowGenerationModalProps {
  workflowRef: any;
  defaultVisible?: boolean;
}

export const WorkflowGenerationModal = ({
  workflowRef,
  defaultVisible = true,
}: IWorkflowGenerationModalProps) => {
  const { data, isLoading, refetch } = usePostAIWorkflowGeneration();
  const [isVisible, setIsVisible] = useState(defaultVisible);
  const [inputPrompt, setInputPrompt] = useState("");
  const { data: searchData, isLoading: isLoadingAutoComplete } =
    useGetAutoComplete(inputPrompt);

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
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogTrigger asChild />
      <DialogContent
        onClick={(e) => e.stopPropagation()}
        aria-describedby="ai generate workflow"
        className="sdk:bg-[#171717] sdk:min-w-[635px] sdk:p-[20px] sdk:flex sdk:flex-col sdk:rounded-md sdk:border sdk:border-[#303030]"
      >
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
            <div className="sdk:font-outfit sdk:font-semibold sdk:text-[14px] sdk:text-[#B9B9B9]">
              prompt
            </div>
            <Textarea
              autoFocus
              className="sdk:text-[13px] sdk:bg-[#171717] sdk:min-w-[595px] sdk:min-h-[120px]"
              placeholder="please describe what kind of agent workflow you want to create"
              defaultValue={inputPrompt}
              disabled={isLoading}
              onChange={(v) => {
                console.log(v);
              }}
            />
          </div>

          {!isLoadingAutoComplete && (
            <Select
              key="select-suggestion"
              open={searchData?.completions?.length > 0}
              onValueChange={(value: string) => {
                setInputPrompt(value);
              }}
            >
              <SelectTrigger className="sdk:collapse sdk:absolute sdk:top-[140px] sdk:left-0 sdk:right-0">
                <SelectValue placeholder="suggested" />
              </SelectTrigger>
              <SelectContent>
                <div className="sdk:flex sdk:flex-row sdk:gap-2 sdk:items-center sdk:border-b sdk:border-[#303030] sdk:border-solid">
                  <AIStar />
                  <span className="sdk:text-[#6F6F6F] sdk:text-[12px]">
                    suggested
                  </span>
                </div>
                {searchData?.completions?.map((suggestion) => {
                  return (
                    <SelectItem key={suggestion} value={suggestion}>
                      {suggestion}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          )}

          <div className="sdk:flex sdk:flex-row sdk:justify-between">
            <Button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className={clsx("hover-skip", "sdk:text-white")}
            >
              <span className="sdk:font-semibold sdk:text-[12px] sdk:cursor-pointer">
                skip
              </span>
            </Button>
            <Button
              type="button"
              className={clsx(
                "sdk:min-w-[114px]",
                "sdk:text-white",
                isLoading && "sdk:bg-[#ffffff]"
              )}
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
                  <span className="sdk:font-semibold sdk:text-[12px] sdk:cursor-pointer">
                    generate
                  </span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
