import { useState } from "react";
import { Button, Dialog, DialogContent, DialogTrigger } from "../ui";
import Delete from "../../assets/svg/delete.svg?react";
import DeleteTip from "../../assets/svg/delete-tip-logo.svg?react";
import Close from "../../assets/svg/close.svg?react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import clsx from "clsx";

export interface IDeleteWorkflowConfirmProps {
  handleConfirm: () => void;
}

export default function DeleteWorkflowConfirm({
  handleConfirm,
}: IDeleteWorkflowConfirmProps) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Delete
                  className="sdk:cursor-pointer sdk:text-[#606060] sdk:w-[14px] sdk:h-[14px]"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(true);
                  }}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent
              className={clsx(
                "sdk:z-1000 sdk:max-w-[200px] sdk:text-[10px] sdk:font-outfit sdk:text-[#B9B9B9] sdk:bg-[#141415] sdk:p-[4px]",
                "sdk:whitespace-pre-wrap sdk:break-words sdk:text-left"
              )}
              side="top">
              delete
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DialogTrigger>
      <DialogContent
        onClick={(e) => e.stopPropagation()}
        aria-describedby="delete g-agent"
        className="sdk:w-[328px] sdk:p-[20px] sdk:flex sdk:flex-col sdk:rounded-[6px] sdk:border sdk:border-[#303030]">
        <div className="sdk:flex sdk:items-center sdk:justify-between">
          <div />
          <Close onClick={() => setOpen(false)} />
        </div>
        <div className="sdk:flex sdk:flex-col sdk:items-center sdk:gap-[16px] sdk:pt-[10px]">
          <DeleteTip />

          <div className="sdk:text-center sdk:font-outfit sdk:text-[18px] sdk:w-[274px] sdk:font-semibold sdk:leading-normal sdk:lowercase sdk:text-white">
            Are you sure you want to delete this workflow?
          </div>
        </div>
        <div className="sdk:flex sdk:justify-between sdk:items-start sdk:self-stretch sdk:pt-[28px] sdk:gap-[14px]">
          <Button
            className="sdk:text-[12px] sdk:py-[7px] sdk:leading-[14px] sdk:font-semibold sdk:text-[#fff] sdk:flex-1"
            onClick={() => {
              setOpen(false);
            }}>
            cancel
          </Button>
          <Button
            className="sdk:text-[12px] sdk:bg-white sdk:text-[#303030] sdk:py-[7px] sdk:leading-[14px] sdk:font-semibold sdk:flex-1 sdk:disabled:bg-[#606060] sdk:disabled:text-[#B9B9B9]"
            onClick={(e) => {
              e.stopPropagation();
              handleConfirm();
              setOpen(false);
            }}>
            yes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
