import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui";
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
        aria-describedby="unsaved-changes-modal"
        className="sdk:w-[328px] sdk:p-[20px] sdk:flex sdk:flex-col sdk:rounded-[6px] sdk:border sdk:border-[var(--sdk-bg-black-light)]">
        <DialogTitle className="sdk:sr-only sdk:hidden">
          Unsaved Changes
        </DialogTitle>
        <div className="sdk:flex sdk:items-center sdk:justify-between">
          <div />
          <Close
            className="sdk:text-[var(--sdk-primary-foreground-text)]"
            onClick={() => onOpenChange?.(false)}
          />
        </div>
        <div className="sdk:flex sdk:flex-col sdk:items-center sdk:gap-[16px] sdk:pt-[10px]">
          <Unsaved />
          <div className="sdk:text-center sdk:font-geist sdk:text-[18px] sdk:w-[274px] sdk:leading-normal sdk:text-[var(--sdk-color-text-primary)]">
            <div className="sdk:font-semibold sdk:leading-[22px] sdk:pb-[10px]">
              Unsaved Changes
            </div>
            <div className="sdk:font-geist sdk:text-[12px]">
              You've made changes that haven't been saved. Would you like to
              save them before closing?
            </div>
          </div>
        </div>
        <div className="sdk:flex sdk:justify-between sdk:items-start sdk:self-stretch  sdk:gap-[14px] sdk:pt-[28px] sdk:gap-[14px]">
          <Button
            variant="outline"
            className="sdk:text-[12px]  sdk:px-[5px] sdk:py-[7px] sdk:leading-[14px] sdk:font-semibold sdk:flex-1"
            onClick={() => {
              onOpenChange(false);
              onSaveHandler(false);
            }}>
            Close without saving
          </Button>
          <Button
            variant="primary"
            className="sdk:text-[12px]  sdk:py-[7px] sdk:leading-[14px] sdk:font-semibold sdk:flex-1"
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
