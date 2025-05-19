import * as DialogPrimitive from "@radix-ui/react-dialog";
import MsgLoadingIcon from "../../assets/svg/msg-loading.svg?react";
import CloseIcon from "../../assets/svg/close.svg?react";
import clsx from "clsx";
import { DialogClose, DialogTitle } from "../ui";
import type { IAgentInfoDetail } from "@aevatar-react-sdk/services";
import WorkflowAevatarEdit, {
  type IWorkflowAevatarEditProps,
} from "../WorkflowAevatarEdit";
import AevatarLogo from "../../assets/aevatar.png";

interface IProps {
  message?: string;
  data?: string;
}
enum MsgType {
  success = "success",
  error = "error",
  warning = "warning",
  info = "info",
  loading = "loading",
}

const MsgComp = ({ data, type }: { data?: string; type?: MsgType }) => {
  return (
    <div
      className={clsx(
        "sdk:workflow-common-desc-bg sdk:p-3 sdk:rounded-tl-none sdk:rounded-tr-[18px] sdk:rounded-br-[18px] sdk:rounded-bl-[18px] sdk:flex",
        !data && "sdk:w-fit",
        type === MsgType.success && "sdk:workflow-common-success-text",
        type === MsgType.warning && "sdk:workflow-common-warning-text",
        type === MsgType.error && "sdk:workflow-common-warning-text"
      )}>
      {data ? data : <MsgLoadingIcon />}
    </div>
  );
};

export default function DialogStimulate({ message, data }: IProps) {
  return (
    <DialogPrimitive.Content className="sdk:z-6 sdk:absolute sdk:right-[20px] sdk:left-[19px] sdk:top-[52px] sdk:sm:right-[11px] sdk:sm:left-auto sdk:sm:top-[12px] sdk:sm:bottom-[13px] sdk:workflow-common-bg sdk:w-auto sdk:sm:w-[232px] sdk:px-[26px] sdk:sm:px-[19px] sdk:pt-[19px] sdk:sm:pt-[40px] sdk:pb-[19px] sdk:workflow-common-border sdk:border sdk:flex">
      <DialogClose>
        <CloseIcon
          className="sdk:absolute sdk:right-[15px] sdk:sm:right-[6px] sdk:top-[17px] sdk:sm:top-[6px] sdk:cursor-pointer"
          width={24}
          height={24}
        />
      </DialogClose>

      <div className="sdk:overflow-auto sdk:h-full">
        <DialogTitle className="sdk:mb-[23px] sdk:text-[15px] sdk:font-bold">
          <p>stimulate workflow</p>
        </DialogTitle>
        <div className="sdk:flex sdk:gap-[10px] sdk:flex-col">
          <img src={AevatarLogo} alt="" width={32} height={32} />
          {!(message || data) && <MsgComp data={undefined} />}

          {message && <MsgComp data={message} type={MsgType.error} />}
          {data && <MsgComp data={data} />}
        </div>
      </div>
    </DialogPrimitive.Content>
  );
}
