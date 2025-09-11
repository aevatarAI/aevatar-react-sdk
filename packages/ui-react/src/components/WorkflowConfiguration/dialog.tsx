import * as DialogPrimitive from "@radix-ui/react-dialog";
import MsgLoadingIcon from "../../assets/svg/msg-loading.svg?react";
import CloseIcon from "../../assets/svg/close.svg?react";
import clsx from "clsx";
import { DialogClose, DialogTitle } from "../ui";
import type { IAgentInfoDetail } from "@aevatar-react-sdk/services";
import WorkflowAevatarEdit, {
  type IWorkflowAevatarEditProps,
} from "../WorkflowAevatarEdit";

interface IProps {
  disabled?: boolean;
  isNew?: boolean;
  agentItem?: Partial<IAgentInfoDetail>;
  nodeId?: string;
  onGaevatarChange?: IWorkflowAevatarEditProps["onGaevatarChange"];
  onClose?: () => void;
}

export default function WorkflowDialog({
  disabled,
  isNew,
  agentItem,
  nodeId,
  onGaevatarChange,
  onClose,
}: IProps) {
  return (
    <DialogPrimitive.Content
      className={clsx(
        "sdk:z-6 sdk:left-[19px] sdk:sm:left-auto  sdk:workflow-common-bg sdk:w-auto sdk:sm:w-[380px]  sdk:workflow-common-border sdk:border sdk:flex",
        "sdk:absolute sdk:right-[20px]  sdk:top-[58px] sdk:sm:right-[11px] sdk:sm:top-[58px] sdk:sm:bottom-[13px]"
      )}>
      <DialogClose
        className="sdk:border-none"
        onClick={(e) => {
          e.stopPropagation();
          onClose?.();
        }}>
        <CloseIcon
          className="sdk:absolute sdk:right-[15px] sdk:sm:right-[6px] sdk:top-[17px] sdk:sm:top-[6px] sdk:cursor-pointer"
          width={24}
          height={24}
        />
      </DialogClose>
      <div className="sdk:h-[500px] sdk:sm:h-full sdk:flex sdk:flex-col sdk:gap-[8px] sdk:w-full  sdk:pt-[8px] sdk:sm:pt-[8px]">
        <DialogTitle className="sdk:text-[var(--sdk-color-text-primary)] sdk:pb-[8px] sdk:text-[15px] sdk:font-outfit sdk:font-semibold sdk:border-b sdk:border-[var(--sdk-color-border-primary)] sdk:aevatar-title">
          <p className="sdk:px-[8px] sdk:sm:px-[8px] ">agent configuration</p>
        </DialogTitle>
        <WorkflowAevatarEdit
          key={nodeId || "default"}
          disabled={disabled}
          isNew={isNew}
          agentItem={agentItem}
          nodeId={nodeId}
          onGaevatarChange={onGaevatarChange}
        />
      </div>
    </DialogPrimitive.Content>
  );
}
