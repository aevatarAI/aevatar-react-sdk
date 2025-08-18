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
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../ui/tooltip";
import Question from "../../assets/svg/question.svg?react";
import { useQuery } from "@tanstack/react-query";

const useGetAIModels = () => {
  return useQuery({
    queryKey: ["models"],
    queryFn: () => {
      return Promise.resolve({
        ChatAISystemLLMEnum: {
          type: "integer",
          description:
            "0 = OpenAI\n1 = DeepSeek\n2 = AzureOpenAI\n3 = AzureOpenAIEmbeddings\n4 = OpenAIEmbeddings",
          "x-enumNames": [
            "OpenAI",
            "DeepSeek",
            "AzureOpenAI",
            "AzureOpenAIEmbeddings",
            "OpenAIEmbeddings",
          ],
          enum: [0, 1, 2, 3, 4],
          "x-enumMetadatas": {
            OpenAI: {
              provider: "openai",
              type: "general-purpose llm",
              strengths:
                "creative writing, general reasoning, versatile, well-balanced performance",
              best_for:
                "general tasks, creative writing, conversational AI, content generation",
              speed: "fast and reliable",
            },
            DeepSeek: {
              provider: "deepseek",
              type: "reasoning-optimized llm",
              strengths:
                "advanced reasoning, mathematical thinking, logical analysis, deep problem-solving",
              best_for:
                "complex reasoning, mathematical problems, analytical tasks, research assistance",
              speed: "moderate, optimized for accuracy over speed",
            },
            AzureOpenAI: {
              provider: "azure_openai",
              type: "enterprise llm",
              strengths:
                "enterprise security, compliance, scalability, data privacy, regional deployment",
              best_for:
                "enterprise applications, production systems, secure environments, regulated industries",
              speed: "fast with enterprise-grade reliability",
            },
            AzureOpenAIEmbeddings: {
              provider: "azure_openai",
              type: "embedding model",
              strengths:
                "semantic understanding, enterprise security, high-quality embeddings, data privacy",
              best_for:
                "semantic search, document similarity, enterprise RAG systems, secure vector operations",
              speed: "fast embedding generation with enterprise features",
            },
            OpenAIEmbeddings: {
              provider: "openai",
              type: "embedding model",
              strengths:
                "semantic understanding, high-quality embeddings, versatile text representation",
              best_for:
                "semantic search, similarity tasks, RAG applications, content recommendation",
              speed: "fast embedding generation",
            },
          },
        },
      });
    },
  });
};

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
  const { data } = useGetAIModels();
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
    // form.reset({
    //   agentName: agentItem?.name ?? "",
    //   agentType: agentItem?.agentType ?? "",
    // });
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
                            Choose the name for your agent.
                          </TooltipContent>
                        </Tooltip>
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
                            Choose the agent type that powers your responses.
                            Different agents vary in speed, accuracy, and cost.
                          </TooltipContent>
                        </Tooltip>
                      </FormLabel>
                      <Select
                        value={field?.value}
                        disabled={field?.disabled}
                        // onValueChange={(values) => {
                        //   onAgentTypeChange(values, field);
                        // }}
                      >
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

                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem aria-labelledby="model">
                      <FormLabel id="model" className="sdk:flex sdk:gap-[4px]">
                        <span>model</span>
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
                            Choose the AI model that powers your agent’s
                            responses. Different models vary in speed, accuracy,
                            and cost.
                          </TooltipContent>
                        </Tooltip>
                      </FormLabel>
                      <ModelSelect
                        field={field}
                        data={data}
                        onAgentTypeChange={() => {}}
                      />
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
            {/* <Button
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
          </Button> */}
          </form>
        </Form>
      </div>
    </TooltipProvider>
  );
}

// Extract metadata helper
const getModelMetadata = (data, model) => {
  return data?.ChatAISystemLLMEnum?.["x-enumMetadatas"]?.[model];
};

// Tooltip content component
const ModelTooltipContent = ({ model, metadata }) => (
  <TooltipContent
    className={clsx(
      "sdk:z-1000 sdk:max-w-[200px] sdk:text-[12px] sdk:font-outfit sdk:text-[#B9B9B9] sdk:bg-[#141415] sdk:p-[4px]",
      "sdk:whitespace-pre-wrap sdk:break-words sdk:text-left"
    )}
    side="left"
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

// Select item with tooltip component
const ModelSelectItem = ({ model, data }) => {
  const metadata = getModelMetadata(data, model);

  return (
    <SelectItem key={model} value={model}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className="sdk:w-full sdk:text-center">
            <span>{model}</span>
          </button>
        </TooltipTrigger>
        <ModelTooltipContent model={model} metadata={metadata} />
      </Tooltip>
    </SelectItem>
  );
};

// Main component
const ModelSelect = ({ field, data, onAgentTypeChange }) => {
  const modelNames = data?.ChatAISystemLLMEnum?.["x-enumNames"] || [];

  return (
    <Select
      value={field?.value}
      disabled={field?.disabled}
      onValueChange={(value) => onAgentTypeChange?.(value, field)}
    >
      <FormControl>
        <SelectTrigger>
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
      </FormControl>
      <SelectContent className="sdk:min-w-[100%]">
        {modelNames.map((model) => (
          <ModelSelectItem key={model} model={model} data={data} />
        ))}
      </SelectContent>
    </Select>
  );
};
