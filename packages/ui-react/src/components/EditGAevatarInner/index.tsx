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
import type { JSONSchemaType } from "../types";
import { useToast } from "../../hooks/use-toast";
import { handleErrorMessage } from "../../utils/error";
import ErrorBoundary from "../AevatarErrorBoundary";

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

  const onDelete = useCallback(async () => {
    if (btnLoadingRef.current) return;

    setBtnLoading("deleting");
    try {
      await aevatarAI.services.agent.deleteAgent(agentId);
      // TODO There will be some delay in cqrs
      await sleep(2000);
      onSuccess?.("delete");
    } catch (error) {
      console.error("deleteAgent:", error);
      toast({
        title: "error",
        description: handleErrorMessage(error, "Something went wrong."),
        duration: 3000,
      });
    }
    setBtnLoading(undefined);
  }, [onSuccess, toast, agentId]);

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
          key={"save"}
          className="sdk:p-[8px] sdk:px-[18px] sdk:gap-[10px] sdk:text-[#fff] sdk:hover:text-[#303030]"
          type="submit">
          {btnLoading === "saving" && (
            <Loading
              key={"save"}
              className={clsx("aevatarai-loading-icon")}
              style={{ width: 14, height: 14 }}
            />
          )}
          <span className="sdk:text-center sdk:font-syne sdk:text-[12px] sdk:font-semibold sdk:lowercase sdk:leading-[14px]">
            {text}
          </span>
        </Button>
        <Button
          key={"delete"}
          className={clsx(
            "sdk:p-[8px] sdk:px-[18px] sdk:gap-[10px] sdk:text-[#fff] sdk:hover:text-[#303030]",
            type === "create" && "sdk:hidden"
          )}
          onClick={onDelete}>
          {btnLoading === "deleting" && (
            <Loading
              key={"delete"}
              className={clsx("aevatarai-loading-icon")}
              style={{ width: 14, height: 14 }}
            />
          )}
          <span className="sdk:text-center sdk:font-syne sdk:text-[12px] sdk:font-semibold sdk:lowercase sdk:leading-[14px]">
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

  const JSONSchemaProperties: [string, JSONSchemaType<any>][] = useMemo(() => {
    const jsonSchema = JSON.parse(jsonSchemaString ?? "{}");

    const _properties = jsonSchema?.properties;
    if (!_properties) return [];

    return Object.entries(_properties).map((item) => {
      const name = item[0];

      let propertyInfo = item[1] as JSONSchemaType<any>;
      propertyInfo.value = properties?.[name];
      const type = propertyInfo.type;
      if (!type) {
        propertyInfo = {
          ...jsonSchema?.definitions?.[name],
          value: propertyInfo.value,
        };
        if (propertyInfo.enum) {
          const index = propertyInfo.enum.indexOf(propertyInfo.value);
          propertyInfo.value = propertyInfo?.["x-enumNames"][index];
        }
      }
      return [item[0], propertyInfo];
    });
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
        setBtnLoading("saving");

        const properties = paramsList.reduce((acc: any, curr) => {
          // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
          return { ...acc, ...curr };
        }, {});

        const params = {
          agentType: values.agentType ?? (defaultAgentType || agentTypeList[0]),
          name: values.agentName,
          properties: properties,
        };
        console.log(params, defaultAgentType, "params==updateAgentInfo");
        if (type === "create") {
          await aevatarAI.services.agent.createAgent(params);
        } else {
          await aevatarAI.services.agent.updateAgentInfo(agentId, params);
        }

        // TODO There will be some delay in cqrs
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
    <Form {...form}>
      <form
        className="sdk:h-full sdk:flex sdk:flex-col"
        onSubmit={form.handleSubmit(onSubmit)}>
        <CommonHeader leftEle={leftEle} rightEle={rightEle} />
        <div
          className={clsx(
            "sdk:flex-1 sdk:w-full sdk:m-auto sdk:bg-[#141415] sdk:pt-[22px] sdk:pb-[14px]",
            "sdk:md:pt-[0] sdk:md:px-[40px]"
          )}>
          <div className="sdk:flex sdk:flex-col sdk:justify-center sdk:gap-[2px] sdk:p-[8px] sdk:px-[10px] sdk:bg-white sdk:self-stretch">
            <div className="sdk:text-black sdk:font-syne sdk:text-sm sdk:font-semibold sdk:leading-normal sdk:lowercase">
              settings
            </div>
            <div className="sdk:text-[#606060] sdk:font-mono sdk:text-[11px] sdk:font-normal sdk:leading-normal sdk:lowercase">
              Manage your aevatar settings and preferences
            </div>
          </div>
          <div className="sdk:md:w-[360px] sdk:m-auto sdk:flex sdk:flex-col sdk:gap-y-[22px] sdk:p-[16px_16px_6px_16px] sdk:items-start sdk:content-start sdk:self-stretch">
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
                    }}>
                    <FormControl>
                      <SelectTrigger aria-disabled={field?.disabled}>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
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
                    />
                  </FormControl>
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
                      <FormItem>
                        <FormLabel>{name}</FormLabel>

                        <Select
                          value={field?.value}
                          disabled={field?.disabled}
                          onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger aria-disabled={field?.disabled}>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {propertyInfo?.["x-enumNames"]?.map((enumValue) => (
                              <SelectItem key={enumValue} value={enumValue}>
                                {enumValue}
                              </SelectItem>
                            ))}
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
                      <FormItem>
                        <FormLabel>{name}</FormLabel>
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

              // if (type.includes("file") || type.includes("object")) {
              //   return (
              //     <FormField
              //       key={key}
              //       control={form.control}
              //       defaultValue={value}
              //       name={name}
              //       render={() => (
              //         <FormItem>
              //           <FormControl>
              //             <DropzoneItem
              //               form={form}
              //               name={name}
              //               accept={{ "application/pdf": [] }}
              //             />
              //           </FormControl>
              //         </FormItem>
              //       )}
              //     />
              //   );
              // }
            })}
          </div>
        </div>
      </form>
    </Form>
  );
}

export default function EditGAevatarInner({
  className,
  ...props
}: IEditGAevatarProps) {
  return (
    <div
      className={clsx(
        "sdk:relative sdk:bg-black sdk:overflow-auto sdk:lg:pb-[40px] sdk:pb-[16px] aevatarai-edit-gaevatar-wrapper",
        className
      )}>
      <ErrorBoundary>
        <EditGAevatarInnerCom {...props} />
      </ErrorBoundary>
    </div>
  );
}
