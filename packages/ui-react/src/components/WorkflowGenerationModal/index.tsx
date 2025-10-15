import { useEffect, useRef, useState } from "react";
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
import { sleep } from "@aevatar-react-sdk/utils";
import GenerationTextInput from "./GenerationTextInput";
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
  const [isSelectingSuggestion, setIsSelectingSuggestion] = useState(false);
  const { data: searchData, isLoading: isLoadingAutoComplete } =
    useGetAutoComplete(inputPrompt, !isSelectingSuggestion);

  const [isGenerated, setIsGenerated] = useState<boolean>(false);

  useEffect(() => {
    if (data && workflowRef) {
      workflowRef?.current.onAiGenerateWorkflow(data);
    }
  }, [data, workflowRef]);

  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    sleep(200).then(() => {
      textRef.current?.focus();
    });
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleChange = (e) => {
    const newValue = e.target.value;

    setIsGenerated(false);
    setInputPrompt(newValue);
    setIsSelectingSuggestion(false);
  };

  const handleClick = async () => {
    setIsGenerated(true);
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
        aria-describedby="AI generate workflow"
        className="sdk:bg-[var(--sdk-color-dialog-dark)] sdk:min-w-[635px] sdk:p-[20px] sdk:flex sdk:flex-col sdk:rounded-md sdk:border sdk:border-[var(--sdk-bg-black-light)]">
        <div className="sdk:flex sdk:flex-col sdk:gap-[28px]">
          <div className="sdk:flex sdk:justify-between">
            <span className="sdk:font-geist sdk:font-semibold sdk:text-[18px] sdk:text-[var(--sdk-color-text-primary)]">
              Generate workflow with AI
            </span>
            <button
              className="sdk:cursor-pointer"
              type="button"
              onClick={handleClose}>
              <Close className="sdk:text-[var(--sdk-primary-foreground-text)]" />
            </button>
          </div>

          <div className="sdk:relative">
            <div className="sdk:font-geist sdk:pb-[28px] sdk:font-semibold sdk:text-[14px] sdk:text-[var(--sdk-muted-foreground)]">
              Prompt
            </div>
            <GenerationTextInput
              inputPrompt={inputPrompt}
              isLoading={isLoading}
              isGenerated={isGenerated}
              handleChange={handleChange}
              searchData={searchData}
              isLoadingAutoComplete={isLoadingAutoComplete}
              onSuggestionSelect={(value: string) => {
                console.log("onSuggestionSelect called with:", value);
                setIsSelectingSuggestion(true);
                setInputPrompt(value);
                // Set cursor to end after React re-renders
                requestAnimationFrame(() => {
                  setTimeout(() => {
                    if (textRef.current) {
                      textRef.current.focus();
                      const textLength = textRef.current.value.length;

                      textRef.current.setSelectionRange(textLength, textLength);
                    }
                  }, 50);
                });
              }}
            />
          </div>

          <div className="sdk:flex sdk:flex-row sdk:justify-between">
            <Button
              variant="outline"
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className={clsx("hover-skip")}>
              <span className="sdk:font-semibold sdk:text-[12px] sdk:cursor-pointer">
                Skip
              </span>
            </Button>
            <Button
              variant="primary"
              type="button"
              className={clsx("sdk:min-w-[114px]")}
              disabled={!inputPrompt || isLoading}
              onClick={handleClick}>
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
                    Generate
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
