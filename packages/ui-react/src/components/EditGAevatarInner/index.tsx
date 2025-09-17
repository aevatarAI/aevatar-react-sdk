import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CommonHeader from "../CommonHeader";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { type ControllerRenderProps, useForm } from "react-hook-form";
import { Button, Input } from "../ui";
import clsx from "clsx";
import BackArrow from "../../assets/svg/back-arrow.svg?react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
// import DropzoneItem from "../DropzoneItem";
import { sleep } from "@aevatar-react-sdk/utils";
import Loading from "../../assets/svg/loading.svg?react";

import { aevatarAI } from "../../utils";
import { useToast } from "../../hooks/use-toast";
import { handleErrorMessage } from "../../utils/error";
import ErrorBoundary from "../AevatarErrorBoundary";
import { jsonSchemaParse } from "../../utils/jsonSchemaParse";
import { validateSchemaField } from "../../utils/jsonSchemaValidate";
import { renderSchemaField } from "../utils/renderSchemaField";
import { AgentError } from "../../constants/error/agentError";
import DeleteGAevatarConfirm from "../DeleteGAevatarConfirm";
import { TooltipProvider } from "../ui/tooltip";

export type TEditGaevatarSuccessType = "create" | "edit" | "delete";

export interface IEditGAevatarProps {
  className?: string;
  type?: "edit" | "create";
  agentName?: string;
  agentId?: string;
  agentTypeList: string[];
  defaultAgentType?: string;
  jsonSchemaString?: string;
  properties?: Record<string, string>;
  onGagentChange?: (value: string) => void;
  onBack?: () => void;
  onSuccess?: (type: TEditGaevatarSuccessType) => void;
}

function EditGAevatarInnerCom({
  type = "create",
  agentName,
  agentId,
  agentTypeList,
  defaultAgentType,
  properties,
  jsonSchemaString,
  onBack,
  onGagentChange,
  onSuccess,
}: IEditGAevatarProps) {
  const [btnLoading, setBtnLoading] = useState<
    "saving" | "deleting" | undefined
  >();

  const btnLoadingRef = useRef(btnLoading);
  useEffect(() => {
    btnLoadingRef.current = btnLoading;
  }, [btnLoading]);

  const { toast } = useToast();

  const onDelete = useCallback(
    async (isConfirm = false) => {
      if (!isConfirm && btnLoadingRef.current) return;

      setBtnLoading("deleting");
      try {
        await aevatarAI.services.agent.deleteAgent(agentId);
        // TODO There will be some delay in cqrs
        await sleep(2000);
        onSuccess?.("delete");
      } catch (error) {
        console.error("deleteAgent:", error);
        const errorMessage = handleErrorMessage(error, "Something went wrong.");
        if (errorMessage.includes(AgentError.AgentHasSubagents)) {
          setDeleteOpen(true);
          return;
        }

        toast({
          title: "error",
          description: handleErrorMessage(error, "Something went wrong."),
          duration: 3000,
        });
      }
      setBtnLoading(undefined);
    },
    [onSuccess, toast, agentId]
  );

  const [deleteOpen, setDeleteOpen] = useState(false);

  const onDeleteConfirm = useCallback(async () => {
    setDeleteOpen(false);

    try {
      const result = await aevatarAI.services.agent.removeAllSubAgent(agentId);

      await onDelete(true);
    } catch (error) {
      console.error("removeAllSubAgent:", error);
      toast({
        title: "error",
        description: handleErrorMessage(error, "Something went wrong."),
        duration: 3000,
      });
    }
  }, [onDelete, toast, agentId]);

  const rightEle = useMemo(() => {
    let text = "create";
    if (type === "create") {
      text = btnLoading === "saving" ? "creating" : "create";
    } else {
      text = btnLoading === "saving" ? "saving" : "save";
    }
    return (
      <div
        data-testid="edit-gaevatar-inner"
        className="sdk:flex sdk:items-center sdk:gap-[8px]">
        <Button
          variant="primary"
          className="sdk:p-[8px] sdk:px-[18px] sdk:gap-[10px]"
          type="submit">
          {btnLoading === "saving" && (
            <Loading
              key={"save"}
              className={clsx("aevatarai-loading-icon")}
              style={{ width: 14, height: 14 }}
            />
          )}
          <span className="sdk:text-center sdk:font-geist sdk:text-[12px] sdk:font-semibold  sdk:leading-[14px]">
            {text}
          </span>
        </Button>
        <Button
          variant="outline"
          className={clsx(
            "sdk:p-[8px] sdk:px-[18px] sdk:gap-[10px]",
            type === "create" && "sdk:hidden"
          )}
          onClick={() => onDelete(false)}>
          {btnLoading === "deleting" && (
            <Loading
              key={"delete"}
              className={clsx("aevatarai-loading-icon")}
              style={{ width: 14, height: 14 }}
            />
          )}
          <span className="sdk:text-center sdk:font-geist sdk:text-[12px] sdk:font-semibold  sdk:leading-[14px]">
            delete
          </span>
        </Button>
      </div>
    );
  }, [type, btnLoading, onDelete]);

  const leftEle = useMemo(() => {
    return (
      <div className="sdk:flex sdk:items-center sdk:gap-[16px]">
        {onBack && (
          <BackArrow
            role="img"
            className="cursor-pointer"
            onClick={() => onBack?.()}
          />
        )}
        <span className="sdk:hidden sdk:sm:inline-block">
          g-agents configuration
        </span>
        <span className="sdk:inline-block sdk:sm:hidden">configuration</span>
      </div>
    );
  }, [onBack]);

  // Use recursively parsed schema
  const JSONSchemaProperties: [string, any][] = useMemo(() => {
    return jsonSchemaParse(jsonSchemaString, properties);
  }, [jsonSchemaString, properties]);

  const form = useForm<any>();
  useEffect(() => {
    const agentType = form.getValues("agentType");
    if (!agentType) {
      form.setValue("agentType", defaultAgentType || agentTypeList[0]);
    }
    if (agentName) {
      form.setValue("agentName", agentName);
    }
  }, [defaultAgentType, agentTypeList, agentName, form]);

  const onSubmit = useCallback(
    async (values: any) => {
      form.clearErrors();
      try {
        if (btnLoadingRef.current) return;
        const errorFields: { name: string; error: string }[] = [];
        const params: any = {};
        JSONSchemaProperties?.forEach(([name, schema]) => {
          const { errors, param } = validateSchemaField(
            name,
            schema,
            values[name]
          );
          errorFields.push(...errors);
          if (param !== undefined) params[name] = param;
        });
        if (!values?.agentName) {
          errorFields.push({ name: "agentName", error: "required" });
        }
        if (errorFields.length > 0) {
          errorFields.forEach((item) => {
            form.setError(item.name, { message: item.error });
          });
          return;
        }
        setBtnLoading("saving");
        const submitParams = {
          agentType: values.agentType ?? (defaultAgentType || agentTypeList[0]),
          name: values.agentName,
          properties: params,
        };
        if (type === "create") {
          const result = await aevatarAI.services.agent.createAgent(
            submitParams
          );
          // TODO: add subAgents to receive publishEvent
          await aevatarAI.services.agent.addSubAgents(result.id, {
            subAgents: [],
          });
        } else {
          await aevatarAI.services.agent.updateAgentInfo(agentId, submitParams);
        }
        await sleep(2000);
        setBtnLoading(undefined);
        onSuccess?.(type);
      } catch (error: any) {
        toast({
          title: "error",
          description: handleErrorMessage(error, "Something went wrong."),
          duration: 3000,
        });
        setBtnLoading(undefined);
      }
    },
    [
      form,
      agentId,
      type,
      defaultAgentType,
      agentTypeList,
      JSONSchemaProperties,
      toast,
      onSuccess,
    ]
  );

  const onAgentTypeChange = useCallback(
    (value: string, field: ControllerRenderProps<any, "agentType">) => {
      onGagentChange?.(value);
      field.onChange(value);
    },
    [onGagentChange]
  );

  return (
    <TooltipProvider delayDuration={0}>
      <Form {...form}>
        <form
          className="sdk:h-full sdk:flex sdk:flex-col sdk:font-geist"
          onSubmit={form.handleSubmit(onSubmit)}>
          <CommonHeader leftEle={leftEle} rightEle={rightEle} />
          <div
            className={clsx(
              "sdk:flex-1 sdk:w-full sdk:m-auto sdk:bg-[var(--sdk-color-bg-primary)] sdk:pt-[22px] sdk:pb-[14px]",
              "sdk:md:pt-[0] sdk:md:px-[40px] sdk:font-geist"
            )}>
            <div className="sdk:flex sdk:flex-col sdk:justify-center sdk:gap-[2px] sdk:p-[8px] sdk:px-[10px] sdk:bg-[var(--sdk-color-bg-primary)] sdk:self-stretch">
              <div className="sdk:text-[var(--sdk-color-text-primary)] sdk:font-geist sdk:text-sm sdk:font-semibold sdk:leading-normal ">
                Settings
              </div>
              <div className="sdk:text-[var(--sdk-muted-foreground)] sdk:font-mono sdk:text-[12px] sdk:font-normal sdk:leading-normal ">
                Manage your aevatar settings and preferences
              </div>
            </div>
            <div className="sdk:md:w-[380px] sdk:m-auto sdk:flex sdk:flex-col sdk:gap-y-[22px] sdk:p-[16px_16px_6px_16px] sdk:items-start sdk:content-start sdk:self-stretch">
              <FormField
                control={form.control}
                name="agentType"
                disabled={agentTypeList.length === 0 || type === "edit"}
                render={({ field }) => (
                  <FormItem aria-labelledby="agentTypeLabel">
                    <FormLabel id="agentTypeLabel">
                      *Atomic-aevatars Type
                    </FormLabel>
                    <Select
                      value={field?.value}
                      disabled={field?.disabled}
                      onValueChange={(values) => {
                        onAgentTypeChange(values, field);
                        form.clearErrors();
                      }}>
                      <FormControl>
                        <SelectTrigger
                          aria-disabled={field?.disabled}
                          className={clsx(
                            field?.disabled &&
                              "sdk:bg-[var(--sdk-color-border-primary)]"
                          )}>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="sdk:w-[var(--radix-popper-anchor-width)]!">
                        {agentTypeList.map((agentType) => (
                          <SelectItem key={agentType} value={agentType}>
                            {agentType}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                key={"agentName"}
                control={form.control}
                defaultValue={agentName}
                name={"agentName"}
                render={({ field }) => (
                  <FormItem aria-labelledby="agentNameLabel">
                    <FormLabel id="agentNameLabel">
                      *atomic-aevatar name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="atomic-aevatar name"
                        {...field}
                        value={field?.value}
                        onChange={field?.onChange}
                        className={clsx(
                          "sdk:w-full sdk:bg-[var(--sdk-bg-background)]",
                          field?.disabled &&
                            "sdk:bg-[var(--sdk-color-border-primary)]"
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {JSONSchemaProperties?.map(([name, schema]) =>
                renderSchemaField({
                  form,
                  name,
                  schema,
                })
              )}
            </div>
          </div>
        </form>
      </Form>
      <DeleteGAevatarConfirm
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        handleConfirm={onDeleteConfirm}
        handleCancel={() => {
          setBtnLoading(undefined);
          setDeleteOpen(false);
        }}
      />
    </TooltipProvider>
  );
}

export default function EditGAevatarInner({
  className,
  ...props
}: IEditGAevatarProps) {
  return (
    <div
      className={clsx(
        "sdk:relative sdk:bg-[var(--sdk-bg-background)] sdk:overflow-auto sdk:lg:pb-[40px] sdk:pb-[16px] aevatarai-edit-gaevatar-wrapper",
        className
      )}>
      <ErrorBoundary>
        <EditGAevatarInnerCom {...props} />
      </ErrorBoundary>
    </div>
  );
}
