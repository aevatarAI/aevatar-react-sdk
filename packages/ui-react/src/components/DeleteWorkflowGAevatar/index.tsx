import { useState } from "react";
import { Button, Dialog, DialogContent, DialogTrigger } from "../ui";
import Delete from "../../assets/svg/delete.svg?react";
import DeleteTip from "../../assets/svg/delete-tip-logo.svg?react";
import Close from "../../assets/svg/close.svg?react";

export interface IDeleteWorkflowGAevatarProps {
  handleDeleteClick: React.MouseEventHandler<HTMLButtonElement>;
}

export default function DeleteWorkflowGAevatar({
  handleDeleteClick,
}: IDeleteWorkflowGAevatarProps) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Delete
          className="sdk:cursor-pointer sdk:text-[var(--sdk-color-border-primary)]"
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
      </DialogTrigger>
      <DialogContent
        onClick={(e) => e.stopPropagation()}
        aria-describedby="delete g-agent"
        className="sdk:w-[328px] sdk:p-[20px] sdk:flex sdk:flex-col sdk:rounded-[6px] sdk:border sdk:border-[var(--sdk-color-border-primary)]">
        <div className="sdk:flex sdk:items-center sdk:justify-between">
          <div />
          <Close onClick={() => setOpen(false)} />
        </div>
        <div className="sdk:flex sdk:flex-col sdk:items-center sdk:gap-[16px] sdk:pt-[10px]">
          <DeleteTip />

          <div className="sdk:text-center sdk:font-outfit sdk:text-[18px] sdk:w-[274px] sdk:font-semibold sdk:leading-normal sdk:lowercase sdk:text-[var(--sdk-color-text-primary)]">
            Are you sure you want to delete this g-agent?
          </div>
        </div>
        <div className="sdk:flex sdk:justify-between sdk:items-start sdk:self-stretch sdk:pt-[28px] sdk:gap-[14px]">
          <Button
            variant="outline"
            className="sdk:text-[12px] sdk:py-[7px] sdk:leading-[14px] sdk:font-semibold sdk:flex-1"
            onClick={() => {
              setOpen(false);
            }}>
            cancel
          </Button>
          <Button
            variant="primary"
            className="sdk:text-[12px] sdk:py-[7px] sdk:leading-[14px] sdk:font-semibold sdk:flex-1"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(e);
            }}>
            yes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
