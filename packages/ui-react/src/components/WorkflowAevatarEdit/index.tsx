import type { IAgentInfoDetail } from "@aevatar-react-sdk/services";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui";
import clsx from "clsx";
import { useForm } from "react-hook-form";
import Loading from "../../assets/svg/loading.svg?react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { sleep } from "@aevatar-react-sdk/utils";
import { handleErrorMessage } from "../../utils/error";
import { useToast } from "../../hooks/use-toast";
import type { JSONSchemaType } from "../types";
import { jsonSchemaParse } from "../../utils/jsonSchemaParse";
import { validateSchemaField } from "../../utils/jsonSchemaValidate";
import { renderSchemaField } from "../utils/renderSchemaField";
import { useUpdateEffect } from "react-use";

export interface IWorkflowAevatarEditProps {
  agentItem?: Partial<IAgentInfoDetail>;
  isNew?: boolean;
  nodeId?: string;
  disabled?: boolean;
  onGaevatarChange?: (
    isCreate: boolean,
    data: {
      params: {
        agentType: string;
        name: string;
        properties: Record<string, any>;
      };
      agentId?: string;
    },
    nodeId: string
  ) => Promise<IAgentInfoDetail>;
}

export default function WorkflowAevatarEdit({
  agentItem,
  isNew,
  nodeId,
  onGaevatarChange,
  disabled,
}: IWorkflowAevatarEditProps) {
  const form = useForm<any>();
  const [btnLoading, setBtnLoading] = useState<boolean>();
  const { toast } = useToast();

  const btnLoadingRef = useRef(btnLoading);
  useEffect(() => {
    btnLoadingRef.current = btnLoading;
  }, [btnLoading]);

  // useUpdateEffect(() => {
  //   form.setValue("agentName", agentItem?.name);
  // }, [agentItem?.name]);

  // useUpdateEffect(() => {
  //   form.setValue("agentType", agentItem?.agentType);
  // }, [agentItem?.agentType]);

  useUpdateEffect(() => {
    form.reset({
      agentName: agentItem?.name ?? "",
      agentType: agentItem?.agentType ?? "",
    });
  }, [agentItem, nodeId]);

  const JSONSchemaProperties: [string, JSONSchemaType<any>][] = useMemo(() => {
    return jsonSchemaParse(
      agentItem?.propertyJsonSchema,
      agentItem?.properties
    );
  }, [agentItem]);

  const agentTypeList = useMemo(
    () => (agentItem?.agentType ? [agentItem?.agentType] : []),
    [agentItem]
  );

  const onSubmit = useCallback(
    async (values: any) => {
      // Use validateSchemaField for each schema field
      try {
        form.clearErrors();

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
        setBtnLoading(true);
        const submitParams = {
          agentType: values.agentType ?? agentItem?.agentType,
          name: values.agentName,
          properties: params,
        };
        await onGaevatarChange(
          isNew,
          { params: submitParams, agentId: agentItem?.id },
          nodeId
        );
        await sleep(2000);
        setBtnLoading(undefined);
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
      JSONSchemaProperties,
      toast,
      isNew,
      agentItem,
      onGaevatarChange,
      nodeId,
    ]
  );

  return (
    <div
      className="sdk:px-[8px] sdk:sm:px-[8px] sdk:overflow-auto sdk:flex-1"
      key={nodeId}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className={clsx("sdk:bg-[#141415] sdk:pb-[60px]")}>
            <div className="sdk:flex sdk:flex-col sdk:gap-y-[16px]  sdk:items-start sdk:content-start sdk:self-stretch">
              <FormField
                key={"agentName"}
                control={form.control}
                disabled={disabled}
                defaultValue={agentItem?.name}
                name={"agentName"}
                render={({ field }) => (
                  <FormItem aria-labelledby="agentNameLabel">
                    <FormLabel id="agentNameLabel">agent name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="atomic-aevatar name"
                        {...field}
                        value={field?.value}
                        onChange={field?.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="agentType"
                defaultValue={agentItem?.agentType}
                disabled={true}
                render={({ field }) => (
                  <FormItem aria-labelledby="agentTypeLabel">
                    <FormLabel id="agentTypeLabel">agent Type</FormLabel>
                    <Select
                      value={field?.value}
                      disabled={field?.disabled}
                      // onValueChange={(values) => {
                      //   onAgentTypeChange(values, field);
                      // }}
                    >
                      <FormControl>
                        <SelectTrigger aria-disabled={field?.disabled}>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="sdk:w-[192px]!">
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

              {/* Render schema fields recursively */}
              {JSONSchemaProperties?.map(([name, schema]) =>
                renderSchemaField({
                  form,
                  name,
                  schema,
                  selectContentCls: "sdk:w-[192px]!",
                  disabled,
                })
              )}
            </div>
          </div>
          <Button
            key={"save"}
            className="sdk:workflow-title-button-save sdk:cursor-pointer sdk:absolute sdk:bottom-[20px] sdk:w-[calc(100%-16px)]"
            type="submit"
            disabled={disabled}>
            {btnLoading && (
              <Loading
                key={"save"}
                className={clsx("aevatarai-loading-icon")}
                style={{ width: 14, height: 14 }}
              />
            )}
            <span className="sdk:text-center sdk:font-outfit sdk:text-[12px] sdk:font-semibold sdk:lowercase sdk:leading-[14px]">
              save
            </span>
          </Button>
        </form>
      </Form>
    </div>
  );
}
