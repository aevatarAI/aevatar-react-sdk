import type { IAgentInfoDetail } from "@aevatar-react-sdk/services";
import {
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
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../ui/tooltip";
import Question from "../../assets/svg/question.svg?react";
import { useGetAIModels } from "../../hooks/useGetAIModels";
import { TooltipDescriptor } from "../TooltipDescriptor";

export interface IWorkflowAevatarEditProps {
  agentItem?: Partial<
    IAgentInfoDetail & { defaultValues?: Record<string, any[]> }
  >;
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
    nodeId: string,
    propertyJsonSchema: string
  ) => Promise<IAgentInfoDetail>;
}

export default function WorkflowAevatarEdit({
  agentItem,
  isNew,
  nodeId,
  onGaevatarChange,
  disabled,
}: IWorkflowAevatarEditProps) {
  const form = useForm<any>({ mode: "onBlur" });
  const [btnLoading, setBtnLoading] = useState<boolean>();
  const { toast } = useToast();

  const btnLoadingRef = useRef(btnLoading);
  useEffect(() => {
    btnLoadingRef.current = btnLoading;
  }, [btnLoading]);

  const onGaevatarChangeRef = useRef(onGaevatarChange);
  useEffect(() => {
    onGaevatarChangeRef.current = onGaevatarChange;
  }, [onGaevatarChange]);

  // Debounce timer reference
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  // Store latest values to avoid circular triggers
  const agentItemRef = useRef(agentItem);
  const isNewRef = useRef(isNew);
  const nodeIdRef = useRef(nodeId);

  // Update refs with latest values
  useEffect(() => {
    agentItemRef.current = agentItem;
  }, [agentItem]);

  useEffect(() => {
    isNewRef.current = isNew;
  }, [isNew]);

  useEffect(() => {
    nodeIdRef.current = nodeId;
  }, [nodeId]);

  // useUpdateEffect(() => {
  //   form.setValue("agentName", agentItem?.name);
  // }, [agentItem?.name]);

  // useUpdateEffect(() => {
  //   form.setValue("agentType", agentItem?.agentType);
  // }, [agentItem?.agentType]);

  useUpdateEffect(() => {
    form.setValue("agentName", agentItem?.name ?? "");
    form.setValue("agentType", agentItem?.agentType ?? "");
  }, [agentItem?.name, agentItem?.agentType, nodeId]);

  const JSONSchemaProperties: [string, JSONSchemaType<any>][] = useMemo(() => {
    return jsonSchemaParse(
      agentItem?.propertyJsonSchema,
      agentItem?.properties,
      isNew ? agentItem?.defaultValues : undefined
    );
  }, [agentItem, isNew]);

  const agentTypeList = useMemo(
    () => (agentItem?.agentType ? [agentItem?.agentType] : []),
    [agentItem?.agentType]
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
          nodeId,
          agentItem?.propertyJsonSchema
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

  // Actual submit function (will be called after debounce)
  const actualSubmit = useCallback((values: any) => {
    // Get current form values inside function to avoid frequent triggers
    const currentFormValues = values;
    // Calculate JSONSchemaProperties inside function to avoid dependency issues
    const currentJSONSchemaProperties = jsonSchemaParse(
      agentItemRef.current?.propertyJsonSchema,
      agentItemRef.current?.properties
    );

    const params: any = {};
    currentJSONSchemaProperties?.forEach(([name, schema]) => {
      const { param } = validateSchemaField(
        name,
        schema,
        currentFormValues[name]
      );
      if (param !== undefined) params[name] = param;
    });

    const submitParams = {
      agentType: currentFormValues.agentType ?? agentItemRef.current?.agentType,
      name: currentFormValues.agentName,
      properties: params,
    };
    onGaevatarChangeRef.current(
      isNewRef.current,
      {
        params: submitParams,
        agentId: agentItemRef.current?.id || nodeIdRef.current,
      },
      nodeIdRef.current,
      agentItemRef.current?.propertyJsonSchema
    );
  }, []);

  // Debounced submit function with actual debounce logic
  const debouncedSubmit = useCallback(
    (values: any) => {
      // Clear previous timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new timer for debounced execution
      debounceTimerRef.current = setTimeout(() => {
        actualSubmit(values);
      }, 500); // 500ms debounce delay
    },
    [actualSubmit]
  );

  // Use form.subscribe to listen to form changes
  useEffect(() => {
    // make sure to unsubscribe;
    const callback = form.subscribe({
      formState: {
        values: true,
        isDirty: true,
      },
      callback: ({ values }) => {
        debouncedSubmit(values);
      },
    });

    return () => {
      // Clean up subscription
      callback();
      // Clean up debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [form, debouncedSubmit]);

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className="sdk:px-[8px] sdk:sm:px-[8px] sdk:overflow-auto sdk:flex-1"
        key={nodeId}
      >
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
                  rules={{
                    validate: (value: any) => {
                      if (!value) return "required";
                      return true;
                    },
                  }}
                  render={({ field }) => (
                    <FormItem aria-labelledby="agentNameLabel">
                      <FormLabel
                        id="agentNameLabel"
                        className="sdk:flex sdk:gap-[4px]"
                      >
                        <span>agent name</span>
                        <TooltipDescriptor type="agentName" />
                      </FormLabel>

                      <FormControl>
                        <Input
                          placeholder="atomic-aevatar name"
                          {...field}
                          value={field?.value}
                          onChange={field?.onChange}
                          className={clsx(
                            field?.disabled && "sdk:bg-[#303030]"
                          )}
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
                      <FormLabel
                        id="agentTypeLabel"
                        className="sdk:flex sdk:gap-[4px]"
                      >
                        <span>agent Type</span>
                        <TooltipDescriptor type="agentType" />
                      </FormLabel>
                      <Select value={field?.value} disabled={field?.disabled}>
                        <FormControl>
                          <SelectTrigger
                            aria-disabled={field?.disabled}
                            className={clsx(
                              field?.disabled && "sdk:bg-[#303030]"
                            )}
                          >
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
                    selectContentCls:
                      "sdk:w-[var(--radix-popper-anchor-width)]!",
                    disabled,
                  })
                )}
              </div>
            </div>
          </form>
        </Form>
      </div>
    </TooltipProvider>
  );
}

const getModelMetadata = (data, model) => {
  return data?.ChatAISystemLLMEnum?.["x-enumMetadatas"]?.[model];
};

const ModelTooltipContent = ({ model, metadata }) => (
  <TooltipContent
    className={clsx(
      "sdk:z-1000 sdk:max-w-[200px] sdk:text-[12px] sdk:font-outfit sdk:text-[#B9B9B9] sdk:bg-[#141415] sdk:p-[4px]",
      "sdk:whitespace-pre-wrap sdk:break-words sdk:text-left sdk:z-[999999999]"
    )}
    side="left"
    sideOffset={10}
  >
    <div className="sdk:font-semibold">{model}</div>
    <div>
      <span>Provider: </span>
      <span className="sdk:font-normal">{metadata?.provider}</span>
    </div>
    <div>
      <span>Type: </span>
      <span className="sdk:font-normal">{metadata?.type}</span>
    </div>
    <div>
      <span>Strengths: </span>
      <span className="sdk:font-normal">{metadata?.strengths}</span>
    </div>
    <div>
      <span>Best for: </span>
      <span className="sdk:font-normal">{metadata?.best_for}</span>
    </div>
    <div>
      <span>Speed: </span>
      <span className="sdk:font-normal">{metadata?.speed}</span>
    </div>
  </TooltipContent>
);

const ModelSelectItem = ({ model, data }) => {
  const metadata = getModelMetadata(data, model);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <SelectItem key={model} value={model}>
          <span className="sdk:w-full sdk:text-center">{model}</span>
        </SelectItem>
      </TooltipTrigger>
      <ModelTooltipContent model={model} metadata={metadata} />
    </Tooltip>
  );
};
export const ModelSelect = ({ field, form, data, names, onChange }) => {
  const [searchValue, setSearchValue] = useState("");
  const [modelNames, setModelNames] = useState(names);
  const [selectedModel, setSelectedModel] = useState("");

  return (
    <Select
      value={
        field?.value || form?.getValues()?.systemLLM || form?.getValues()?.model
      }
      disabled={field?.disabled}
      onValueChange={(value) => {
        setSelectedModel(value);
        onChange?.(value, field);
      }}
    >
      <FormControl>
        <SelectTrigger>
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
      </FormControl>
      <SelectContent className="sdk:min-w-[350px]">
        <Input
          autoFocus
          key="search-input-model"
          placeholder="search"
          onKeyDown={(e) => e.stopPropagation()}
          onKeyUp={(e) => e.stopPropagation()}
          onChange={(e) => {
            const value = e.target.value;
            if (!value) return setModelNames(names);

            setSearchValue(value);
            setModelNames((names) =>
              names.filter((name) =>
                name.toLowerCase().includes(value.toLowerCase())
              )
            );
          }}
        />
        {modelNames?.map((model) => (
          <ModelSelectItem key={model} model={model} data={data} />
        ))}
      </SelectContent>
    </Select>
  );
};
