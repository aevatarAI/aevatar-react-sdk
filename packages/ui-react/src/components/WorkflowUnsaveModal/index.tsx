import { Button, Dialog, DialogContent, DialogTrigger } from "../ui";
import Close from "../../assets/svg/close.svg?react";
import Unsaved from "../../assets/svg/unsaved.svg?react";
export enum SaveFailedError {
  insufficientQuota = "insufficient quota",
  maxAgents = "maximum agent",
}
export interface IWorkflowSaveFailedModalProps {
  open?: boolean;
  onOpenChange?: (open?: boolean) => void;
  onSaveHandler?: (save?: boolean) => void;
}
export default function WorkflowUnsaveModal({
  open,
  onOpenChange,
  onSaveHandler,
}: IWorkflowSaveFailedModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild />
      <DialogContent
        onClick={(e) => e.stopPropagation()}
        aria-describedby="delete g-agent"
        className="sdk:w-[328px] sdk:p-[20px] sdk:flex sdk:flex-col sdk:rounded-[6px] sdk:border sdk:border-[#303030]">
        <div className="sdk:flex sdk:items-center sdk:justify-between">
          <div />
          <Close onClick={() => onOpenChange?.(false)} />
        </div>
        <div className="sdk:flex sdk:flex-col sdk:items-center sdk:gap-[16px] sdk:pt-[10px]">
          <Unsaved />
          <div className="sdk:text-center sdk:font-syne sdk:text-[18px] sdk:w-[274px] sdk:leading-normal sdk:lowercase sdk:text-white">
            <div className="sdk:font-semibold sdk:leading-[22px] sdk:pb-[10px]">
              Unsaved Changes
            </div>
            <div className="sdk:font-pro sdk:text-[12px]">
              You've made changes that haven't been saved. Would you like to
              save them before closing?
            </div>
          </div>
        </div>
        <div className="sdk:flex sdk:justify-between sdk:items-start sdk:self-stretch  sdk:gap-[14px] sdk:pt-[28px] sdk:gap-[14px]">
          <Button
            className="sdk:text-[12px]  sdk:px-[5px] sdk:py-[7px] sdk:leading-[14px] sdk:font-semibold sdk:text-[#fff] sdk:flex-1 sdk:lowercase"
            onClick={() => {
              onOpenChange(false);
              onSaveHandler(false);
            }}>
            Close without saving
          </Button>
          <Button
            className="sdk:text-[12px] sdk:bg-white sdk:text-[#303030] sdk:py-[7px] sdk:leading-[14px] sdk:font-semibold sdk:flex-1 sdk:lowercase"
            onClick={(e) => {
              e.stopPropagation();
              onOpenChange?.(false);
              onSaveHandler(true);
            }}>
            Save and close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
