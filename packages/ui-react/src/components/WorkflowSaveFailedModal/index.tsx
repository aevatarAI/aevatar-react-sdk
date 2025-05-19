import { Button, Dialog, DialogContent, DialogTrigger } from "../ui";
import Close from "../../assets/svg/close.svg?react";
import SaveFailedTip from "../../assets/svg/save-error-tip.svg?react";
import type { ReactNode } from "react";
export enum SaveFailedError {
  insufficientQuota = "insufficient quota",
  maxAgents = "maximum agent",
}
export interface IWorkflowSaveFailedModalProps {
  saveFailed?: SaveFailedError | boolean;
  onOpenChange?: (open?: boolean) => void;
  onSaveFailed?: (SaveFailedError) => void;
}
export default function WorkflowSaveFailedModal({
  saveFailed,
  onOpenChange,
  onSaveFailed,
}: IWorkflowSaveFailedModalProps) {
  return (
    <Dialog open={Boolean(saveFailed)} onOpenChange={onOpenChange}>
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
          <SaveFailedTip />

          <div className="sdk:text-center sdk:font-syne sdk:text-[18px] sdk:w-[274px] sdk:font-semibold sdk:leading-normal sdk:lowercase sdk:text-white">
            {saveFailed === SaveFailedError.insufficientQuota && (
              <>
                saving failed :( <br />
                Please purchase more quota
              </>
            )}
            {saveFailed === SaveFailedError.maxAgents &&
              "Maximum agent creation count reached"}
          </div>
        </div>
        <div className="sdk:flex sdk:justify-between sdk:items-start sdk:self-stretch  sdk:gap-[14px] sdk:pt-[28px]">
          <Button
            className="sdk:text-[12px] sdk:bg-white sdk:text-[#303030] sdk:py-[7px] sdk:leading-[14px] sdk:font-semibold sdk:flex-1 sdk:lowercase"
            onClick={(e) => {
              e.stopPropagation();
              onSaveFailed?.(saveFailed);
              onOpenChange?.(false);
            }}>
            {saveFailed === SaveFailedError.insufficientQuota && "Purchase now"}
            {saveFailed === SaveFailedError.maxAgents && "ok"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
