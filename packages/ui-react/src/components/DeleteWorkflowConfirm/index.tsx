import { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui";
import Delete from "../../assets/svg/delete.svg?react";
import DeleteTip from "../../assets/svg/delete-tip-logo.svg?react";
import Close from "../../assets/svg/close.svg?react";

export interface IDeleteWorkflowConfirmProps {
  open?: boolean;
  onOpenChange?: (open?: boolean) => void;
  handleConfirm: () => void;
}

export default function DeleteWorkflowConfirm({
  open,
  onOpenChange,
  handleConfirm,
}: IDeleteWorkflowConfirmProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild />

      <DialogContent
        onClick={(e) => e.stopPropagation()}
        aria-describedby="delete-workflow-modal"
        className="sdk:w-[328px] sdk:p-[20px] sdk:flex sdk:flex-col sdk:rounded-[6px] sdk:border sdk:border-[var(--sdk-bg-black-light)]">
        <DialogTitle className="sdk:sr-only sdk:hidden">
          Delete Workflow Confirmation
        </DialogTitle>
        <div className="sdk:flex sdk:items-center sdk:justify-between">
          <div />
          <Close
            className="sdk:text-[var(--sdk-primary-foreground-text)]"
            onClick={() => onOpenChange(false)}
          />
        </div>
        <div className="sdk:flex sdk:flex-col sdk:items-center sdk:gap-[16px] sdk:pt-[10px]">
          <DeleteTip />

          <div className="sdk:text-center sdk:font-geist sdk:text-[18px] sdk:w-[274px] sdk:font-semibold sdk:leading-normal sdk:text-[var(--sdk-color-text-primary)]">
            Are you sure you want to delete this workflow?
          </div>
        </div>
        <div className="sdk:flex sdk:justify-between sdk:items-start sdk:self-stretch sdk:pt-[28px] sdk:gap-[14px]">
          <Button
            variant="outline"
            className="sdk:text-[12px] sdk:py-[7px] sdk:leading-[14px] sdk:font-semibold  sdk:flex-1"
            onClick={() => {
              onOpenChange(false);
            }}>
            cancel
          </Button>
          <Button
            variant="primary"
            className="sdk:text-[12px]  sdk:py-[7px] sdk:leading-[14px] sdk:font-semibold sdk:flex-1"
            onClick={(e) => {
              e.stopPropagation();
              handleConfirm();
              onOpenChange(false);
            }}>
            yes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
