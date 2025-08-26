import { Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import Question from "../../assets/svg/question.svg?react";
import { useGetAgentList } from "../../hooks/useGetAgentList";
import clsx from "clsx";

interface ITooltipDescriptor {
  type?: string;
}

export function TooltipDescriptor({ type }: ITooltipDescriptor) {
  const { data, isLoading } = useGetAgentList();

  if (isLoading) return null;

  const results = data?.data?.filter(
    (datum) =>
      datum.agentType ===
      "Aevatar.GAgents.Twitter.GAgents.ChatAIAgent.ChatAIGAgent"
  )?.[0];

  const parsedResults = JSON.parse(results.propertyJsonSchema);

  const {
    instructions,
    mcpServers,
    memberName,
    systemLLM,
    toolGAgentTypes,
    toolGAgents,
    serverConfig,
    requestTimeout,
  } = parsedResults.properties;

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
    case "instructions":
      desc = instructions.description;
      break;
    case "mcpServers":
    case "mcpServers-0":
      desc = mcpServers.description;
      break;
    case "memberName":
      desc = memberName.description;
      break;
    case "systemLLM":
      desc = systemLLM.description;
      break;
    case "toolGAgentTypes":
      desc = toolGAgentTypes.description;
      break;
    case "toolGAgents":
      desc = toolGAgents.description;
      break;
    case "serverConfig":
      desc =
        serverConfig?.description || "Server configuration for your workflow";
      break;
    case "requestTimeout":
      desc =
        requestTimeout?.description ||
        "The timeout duration before the request is closed";
      break;
    default:
      shouldDisplay = false;
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
            "sdk:z-1000 sdk:max-w-[200px] sdk:text-[12px] sdk:font-outfit sdk:text-[#B9B9B9] sdk:bg-[#141415] sdk:p-[4px]",
            "sdk:whitespace-pre-wrap sdk:break-words sdk:text-left"
          )}
          side="top"
        >
          {desc}
        </TooltipContent>
      </Tooltip>
    )
  );
}
