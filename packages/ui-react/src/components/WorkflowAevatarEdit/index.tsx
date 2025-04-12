import type { IAgentInfoDetail } from "@aevatar-react-sdk/services";
import {
  Button,
  DialogTitle,
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

export interface IWorkflowAevatarEditProps {
  agentItem?: Partial<IAgentInfoDetail>;
  isNew?: boolean;
  nodeId?: string;
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
}: IWorkflowAevatarEditProps) {
  const form = useForm<any>();
  const [btnLoading, setBtnLoading] = useState<boolean>();
  const { toast } = useToast();

  const btnLoadingRef = useRef(btnLoading);
  useEffect(() => {
    btnLoadingRef.current = btnLoading;
  }, [btnLoading]);

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
      console.log("onSubmit====", values);
      try {
        if (btnLoadingRef.current) return;
        const errorFields: { name: string; error: string }[] = [];
        const paramsList = [];
        JSONSchemaProperties?.forEach((item) => {
          const name = item[0];
          const propertyInfo = item[1];

          let type = propertyInfo.type;
          if (typeof propertyInfo.type === "string") type = [propertyInfo.type];

          const isNumberType =
            (type.includes("number") || type.includes("integer")) &&
            !propertyInfo.enum;

          const isTypeError = isNumberType
            ? Number.isNaN(Number(values[name]))
            : false;

          const notSupport =
            type.includes("array") ||
            type.includes("boolean") ||
            type.includes("file");

          // if (notSupport)
          //   return toast({
          //     title: "error",
          //     description: "Not support type",
          //     duration: 3000,
          //   });

          if (!values[name] && !notSupport) {
            errorFields.push({
              name: name,
              error: "required",
            });
          } else if (isTypeError) {
            errorFields.push({
              name: name,
              error: "Please enter a number",
            });
          } else if (isNumberType) {
            const value = values[name];
            if (propertyInfo.maximum) {
              value > propertyInfo.maximum &&
                errorFields.push({
                  name: name,
                  error: `maximum: ${propertyInfo.maximum}`,
                });
            }
            if (propertyInfo.maximum) {
              value < propertyInfo.maximum &&
                errorFields.push({
                  name: name,
                  error: `maximum: ${propertyInfo.maximum}`,
                });
            }
            paramsList.push({ [name]: Number(values[name]) });
          } else if (propertyInfo.type.includes("string")) {
            const value = values[name];

            if (propertyInfo.pattern) {
              const regex = new RegExp(propertyInfo.pattern);
              const isValid = regex.test(value);
              if (!isValid) {
                errorFields.push({
                  name: name,
                  error: `Please enter ${propertyInfo.pattern}`,
                });
              }
            }
            if (
              propertyInfo.minLength &&
              value.length < propertyInfo.minLength
            ) {
              errorFields.push({
                name: name,
                error: `Minlength ${propertyInfo.minLength}`,
              });
            }
            if (
              propertyInfo.maxLength &&
              value.length > propertyInfo.maxLength
            ) {
              errorFields.push({
                name: name,
                error: `maxLength ${propertyInfo.maxLength}`,
              });
            }
            paramsList.push({ [name]: values[name] });
          } else {
            let value = values[name];
            if (propertyInfo.enum) {
              const _index = propertyInfo["x-enumNames"]?.indexOf(value);
              value = propertyInfo.enum[_index];
            }

            paramsList.push({ [name]: value });
          }
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

        const properties = paramsList.reduce((acc: any, curr) => {
          // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
          return { ...acc, ...curr };
        }, {});

        const params = {
          agentType: values.agentType ?? agentItem?.agentType,
          name: values.agentName,
          properties: properties,
        };

        await onGaevatarChange(
          isNew,
          { params, agentId: agentItem?.id },
          nodeId
        );

        // TODO There will be some delay in cqrs
        await sleep(2000);

        setBtnLoading(undefined);
        // onSuccess?.(type);
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
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className={clsx(" sdk:bg-[#141415]")}>
            <div className="sdk:flex sdk:flex-col sdk:gap-y-[24px]  sdk:items-start sdk:content-start sdk:self-stretch">
              <FormField
                key={"agentName"}
                control={form.control}
                defaultValue={agentItem?.name}
                name={"agentName"}
                render={({ field }) => (
                  <FormItem aria-labelledby="agentNameLabel">
                    <FormLabel id="agentNameLabel">g-aevatar name</FormLabel>
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
                    <FormLabel id="agentTypeLabel">
                      *Atomic-aevatars Type
                    </FormLabel>
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

              {JSONSchemaProperties?.map((item, index) => {
                const name = item[0];
                const propertyInfo = item[1];

                let type = propertyInfo.type;
                if (!type) return null;
                if (typeof propertyInfo.type === "string")
                  type = [propertyInfo.type];

                const value = item[1]?.value;
                const key = `${name}-${index}`;
                if (propertyInfo.enum) {
                  return (
                    <FormField
                      key={key}
                      control={form.control}
                      defaultValue={value}
                      name={name}
                      render={({ field }) => (
                        <FormItem aria-labelledby={name}>
                          <FormLabel id={name}>{name}</FormLabel>

                          <Select
                            value={field?.value}
                            disabled={field?.disabled}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger aria-disabled={field?.disabled}>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="sdk:w-[192px]!">
                              {propertyInfo?.["x-enumNames"]?.map(
                                (enumValue) => (
                                  <SelectItem key={enumValue} value={enumValue}>
                                    {enumValue}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  );
                }
                if (
                  type.includes("string") ||
                  type.includes("number") ||
                  type.includes("integer")
                ) {
                  return (
                    <FormField
                      key={key}
                      control={form.control}
                      defaultValue={value}
                      name={name}
                      render={({ field }) => (
                        <FormItem aria-labelledby={name}>
                          <FormLabel id={name}>{name}</FormLabel>
                          <FormControl>
                            <Input
                              // placeholder="atomic-aevatar name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  );
                }
              })}
            </div>
          </div>
          <Button
            key={"save"}
            className="sdk:workflow-title-button-save sdk:cursor-pointer sdk:absolute sdk:bottom-[20px] sdk:w-[192px]"
            type="submit">
            {btnLoading && (
              <Loading
                key={"save"}
                className={clsx("aevatarai-loading-icon")}
                style={{ width: 14, height: 14 }}
              />
            )}
            <span className="sdk:text-center sdk:font-syne sdk:text-[12px] sdk:font-semibold sdk:lowercase sdk:leading-[14px]">
              save
            </span>
          </Button>
        </form>
      </Form>
    </div>
  );
}
