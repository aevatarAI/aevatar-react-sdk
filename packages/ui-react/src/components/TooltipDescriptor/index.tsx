import { Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import Question from "../../assets/svg/question.svg?react";
import clsx from "clsx";

interface ITooltipDescriptor {
  type?: string;
  description?: string;
}

export function TooltipDescriptor({ type, description }: ITooltipDescriptor) {
  let desc = "";
  let shouldDisplay = true;

  switch (type) {
    case "agentName":
      desc =
        "The specific identifier of the agent responsible for performing tasks in the workflow";
      break;
    case "agentType":
      desc =
        "Agent type categorizes the kind of participant handling workflow tasks";
      break;

    default:
      if (description) {
        desc = description;
      } else {
        shouldDisplay = false;
      }
  }

  return (
    shouldDisplay && (
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button">
            <Question />
          </button>
        </TooltipTrigger>
        <TooltipContent
          className={clsx(
            "sdk:z-1000 sdk:text-[12px] sdk:font-outfit sdk:text-[#B9B9B9] sdk:bg-[#141415] sdk:p-[4px]",
            "sdk:whitespace-pre-wrap sdk:break-words sdk:text-left"
          )}
          side="top">
          {desc}
        </TooltipContent>
      </Tooltip>
    )
  );
}
