import clsx from "clsx";
import EditGAevatarInner from "../EditGAevatarInner";
import { useCallback, useEffect, useMemo, useState } from "react";
import { aevatarAI } from "../../utils";
import PageLoading from "../PageLoading";
import { useAtom } from "jotai";
import { loadingAtom } from "../../state/atoms";
import { useUpdateEffect } from "react-use";
import { useToast } from "../../hooks/use-toast";
import { handleErrorMessage } from "../../utils/error";
import { useAevatar } from "../context/AevatarProvider";

export interface IEditGAevatarProps {
  className?: string;
  onBack?: () => void;
  onSuccess?: () => void;
}

export default function EditGAevatar({
  className,
  onBack,
  onSuccess,
}: IEditGAevatarProps) {
  const [, setShow] = useAtom(loadingAtom);
  const { toast } = useToast();

  const [agentConfiguration, setAgentConfiguration] =
    useState<Record<string, string>>();
  const [{ hiddenGAevatarType }] = useAevatar();

  const getAllAgentsConfiguration = useCallback(async () => {
    try {
      const result = await aevatarAI.services.agent.getAllAgentsConfiguration();
      if (!result) return;
      const configuration: any = {};
      result
        .filter((item) => !hiddenGAevatarType.includes(item.agentType))
        .forEach((item) => {
          configuration[item.agentType] = item.propertyJsonSchema;
        });
      setAgentConfiguration(configuration);
    } catch (error) {
      toast({
        title: "error",
        description: handleErrorMessage(error, "Something went wrong."),
        duration: 3000,
      });
    }
  }, [toast, hiddenGAevatarType]);

  const agentTypeList = useMemo(
    () => Object.keys(agentConfiguration ?? {}),
    [agentConfiguration]
  );

  const [agentType, setAgentType] = useState<string>();

  const jsonSchemaString = useMemo(() => {
    return agentConfiguration?.[agentType ?? agentTypeList[0]];
  }, [agentConfiguration, agentType, agentTypeList]);

  useEffect(() => {
    if (agentConfiguration) setShow(false);
    else setShow(true);
  }, [agentConfiguration, setShow]);

  useUpdateEffect(() => {
    setAgentType(agentTypeList[0]);
  }, [agentTypeList]);

  useEffect(() => {
    getAllAgentsConfiguration();
  }, [getAllAgentsConfiguration]);

  return (
    <div
      className={clsx(
        "sdk:relative sdk:bg-black sdk:overflow-auto aevatarai-edit-gaevatar-wrapper",
        className
      )}>
      {agentType && (
        <EditGAevatarInner
          defaultAgentType={agentType}
          agentTypeList={agentTypeList}
          jsonSchemaString={jsonSchemaString}
          onGagentChange={setAgentType}
          onBack={onBack}
          onSuccess={onSuccess}
        />
      )}
      <PageLoading />
    </div>
  );
}
