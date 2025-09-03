import { useState } from "react";
import { Button, Dialog, DialogContent, DialogTrigger } from "../ui";
import Delete from "../../assets/svg/delete.svg?react";
import DeleteTip from "../../assets/svg/delete-tip-logo.svg?react";
import Close from "../../assets/svg/close.svg?react";

export interface IDeleteGAevatarConfirmProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  handleConfirm: () => void;
  handleCancel: () => void;
}

export default function DeleteGAevatarConfirm({
  open,
  onOpenChange,
  handleConfirm,
  handleCancel,
}: IDeleteGAevatarConfirmProps) {
  const [checked, setChecked] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger>
        <Delete
          className="sdk:cursor-pointer sdk:text-[var(--sdk-color-border-primary)] sdk:hidden"
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
      </DialogTrigger>
      <DialogContent
        onClick={(e) => e.stopPropagation()}
        aria-describedby="delete g-agent"
        className="sdk:w-[328px] sdk:p-[20px] sdk:flex sdk:flex-col sdk:rounded-[6px] sdk:border sdk:border-[var(--sdk-bg-black-light)]">
        <div className="sdk:flex sdk:items-center sdk:justify-between">
          <div />
          <Close onClick={handleCancel} />
        </div>
        <div className="sdk:flex sdk:flex-col sdk:items-center sdk:gap-[16px] sdk:pt-[10px]">
          <DeleteTip />

          <div className="sdk:text-center sdk:font-outfit sdk:text-[18px] sdk:w-[274px] sdk:font-semibold sdk:leading-normal sdk:lowercase sdk:text-[var(--sdk-color-text-primary)]">
            Are you sure you want to delete this g-agent?
          </div>
          <CheckboxWithDesc checked={checked} setChecked={setChecked} />
        </div>
        <div className="sdk:flex sdk:justify-between sdk:items-start sdk:self-stretch sdk:pt-[28px] sdk:gap-[14px]">
          <Button
            variant="outline"
            className="sdk:text-[12px] sdk:py-[7px] sdk:leading-[14px] sdk:font-semibold sdk:flex-1"
            onClick={(e) => {
              handleCancel();
            }}>
            cancel
          </Button>
          <Button
            variant="primary"
            className="sdk:text-[12px]  sdk:py-[7px] sdk:leading-[14px] sdk:font-semibold sdk:flex-1"
            onClick={(e) => {
              e.stopPropagation();
              handleConfirm();
            }}
            disabled={!checked}>
            delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CheckboxWithDesc({
  checked,
  setChecked,
}: {
  checked: boolean;
  setChecked: (v: boolean) => void;
}) {
  return (
    <div className="sdk:flex sdk:items-center sdk:justify-center sdk:gap-[8px] sdk:pt-[8px]">
      <button
        type="button"
        aria-checked={checked}
        onClick={() => setChecked(!checked)}
        className={`sdk:w-[16px] sdk:h-[16px] sdk:rounded-[4px] sdk:border sdk:border-[var(--sdk-border-foreground)] sdk:bg-[var(--sdk-color-bg-primary)] sdk:flex sdk:items-center sdk:justify-center sdk:transition-colors ${
          checked ? "sdk:border-[var(--sdk-border-foreground)]" : ""
        }`}
        style={{ minWidth: 16, minHeight: 16 }}>
        {checked && (
          <svg
            role="img"
            aria-label="checked"
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M2 5.5L4.5 8L8 2"
              stroke="var(--sdk-border-foreground)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
      <span className="sdk:font-[Source_Code_Pro] sdk:text-[12px] sdk:text-[var(--sdk-muted-foreground)] sdk:lowercase">
        I understand that all associated subagents will also be deleted
      </span>
    </div>
  );
}
