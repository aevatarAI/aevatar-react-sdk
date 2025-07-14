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
  isNew?: boolean;
  agentItem?: Partial<IAgentInfoDetail>;
  nodeId?: string;
  onGaevatarChange?: IWorkflowAevatarEditProps["onGaevatarChange"];
  onClose?: () => void;
}

export default function WorkflowDialog({
  isNew,
  agentItem,
  nodeId,
  onGaevatarChange,
  onClose,
}: IProps) {
  console.log(isNew, agentItem, nodeId, "WorkflowDialog");
  return (
    <DialogPrimitive.Content
      className={clsx(
        "sdk:z-6 sdk:left-[19px] sdk:sm:left-auto  sdk:workflow-common-bg sdk:w-auto sdk:sm:w-[380px] sdk:px-[8px] sdk:sm:px-[8px] sdk:pt-[8px] sdk:sm:pt-[8px] sdk:pb-[19px] sdk:workflow-common-border sdk:border sdk:flex",
        "sdk:absolute sdk:right-[20px]  sdk:top-[58px] sdk:sm:right-[11px] sdk:sm:top-[58px] sdk:sm:bottom-[13px]"
      )}>
      <DialogClose
        className="sdk:border-none"
        onClick={(e) => {
          e.stopPropagation();
          console.log("close");
          onClose?.();
        }}>
        <CloseIcon
          className="sdk:absolute sdk:right-[15px] sdk:sm:right-[6px] sdk:top-[17px] sdk:sm:top-[6px] sdk:cursor-pointer"
          width={24}
          height={24}
        />
      </DialogClose>
      <div className="sdk:overflow-auto sdk:h-full sdk:flex sdk:flex-col sdk:gap-[8px] sdk:w-full">
        <DialogTitle className="sdk:pb-[8px] sdk:text-[15px] sdk:font-outfit sdk:font-semibold sdk:border-b sdk:border-[#303030] sdk:aevatar-title">
          <p
            className="sdk:bg-gradient-to-r sdk:from-white sdk:to-[#999] sdk:bg-clip-text sdk:text-transparent"
            style={{ WebkitTextFillColor: "transparent" }}>
            agent configuration
          </p>
        </DialogTitle>
        <WorkflowAevatarEdit
          isNew={isNew}
          agentItem={agentItem}
          nodeId={nodeId}
          onGaevatarChange={onGaevatarChange}
        />
      </div>
    </DialogPrimitive.Content>
  );
}
