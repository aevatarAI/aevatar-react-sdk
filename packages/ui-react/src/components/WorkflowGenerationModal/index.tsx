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
import { useGetAutoCompleteGeneration } from "../../hooks/useGetAutoCompleteGeneration";
import getCaretCoordinates from "textarea-caret";
interface IWorkflowGenerationModalProps {
  workflowRef: any;
}

export const WorkflowGenerationModal = ({
  workflowRef,
}: IWorkflowGenerationModalProps) => {
  const { data: results, refetch: refetching } = useGetAutoCompleteGeneration();
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

  const handleChange = async (value: string) => {
    setInputPrompt(value);
    await refetching(value);
  };

  const handleClick = async () => {
    await refetch(inputPrompt);
    setIsVisible(false);
  };

  const handleSelectChange = (value: string) => {
    setInputPrompt(value);
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
            <SmartTextArea
              input={inputPrompt}
              isLoading={isLoading}
              data={results}
              onChange={handleChange}
              onInputChange={setInputPrompt}
              onSelectChange={handleSelectChange}
            />
          </div>

          <div className="sdk:flex sdk:flex-row sdk:justify-between">
            <Button type="button" onClick={handleClose} disabled={isLoading}>
              <div className="sdk:font-semibold sdk:text-[12px] sdk:text-white hover:!sdk:text-[#303030] cursor-pointer">
                skip
              </div>
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
                  <div className="sdk:font-semibold sdk:text-[12px] sdk:text-white !hover:sdk:text-[#303030] cursor-pointer">
                    generate
                  </div>
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface SmartTextAreaProps {
  input: string;
  isLoading: boolean;
  data: string[];
  onChange: (value: any) => void;
  onInputChange: (value: string) => void;
  onSelectChange: (value: string) => void;
}

export const SmartTextArea = ({
  input,
  isLoading,
  data,
  onChange,
  onInputChange,
  onSelectChange,
}: SmartTextAreaProps) => {
  const [caretPos, setCaretPos] = useState({ top: 0, left: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef?.current) {
      const { top, left } = getCaretCoordinates(
        textareaRef.current,
        textareaRef.current.selectionStart
      );
      // const rect = textareaRef.current.getBoundingClientRect();
      setCaretPos({
        top: top + textareaRef.current.scrollTop,
        left: left,
      });
    }
  }, [input]);

  return (
    <div className="sdk:flex sdk:flex-col sdk:relative sdk:w-full">
      <Textarea
        ref={textareaRef}
        className="sdk:text-[13px] sdk:bg-[#171717] sdk:min-w-[595px] sdk:min-h-[120px]"
        placeholder="please describe what kind of agent workflow you want to create"
        onChange={(e) => {
          onInputChange(e.target.value);
          onChange?.(e.target.value);
        }}
        value={input}
        disabled={isLoading}
      />
      <div
        className="sdk:absolute sdk:bg-[#171717]"
        style={{
          top: caretPos.top + 20, // offset to appear *below* the line
          left: 14,
          zIndex: 50,
        }}
      >
        <Select onValueChange={onSelectChange} open={data?.length > 0}>
          <SelectTrigger className="sdk:invisible" />
          <SelectContent className="sdk:min-w-[571px] sdk:left-[46%]">
            {data?.map((item) => (
              <SelectItem
                className="text-[14px] lower-case"
                key={crypto.randomUUID()}
                value={item}
              >
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
