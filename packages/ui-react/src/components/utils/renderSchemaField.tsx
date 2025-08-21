import { FormControl, FormMessage } from "../ui/form";
import { SelectContent, SelectItem } from "../ui/select";
import { SelectValue } from "../ui/select";
import { SelectTrigger } from "../ui/select";
import { FormField, FormItem, FormLabel } from "../ui/form";
import { Select } from "../ui/select";
import ArrayField from "../EditGAevatarInner/ArrayField";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "../ui";
import AddIcon from "../../assets/svg/add.svg?react";
import DeleteIcon from "../../assets/svg/delete_agent.svg?react";
import { Checkbox } from "../ui";
import type React from "react";
import { useState } from "react";
import clsx from "clsx";
import { validateSchemaField } from "../../utils/jsonSchemaValidate";
import { Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import Question from "../../assets/svg/question.svg?react";
import { useGetAIModels } from "../../hooks/useGetAIModels";
import { ModelSelect } from "../WorkflowAevatarEdit";

export const renderSchemaField = ({
  form,
  name,
  schema,
  parentName = "",
  label,
  selectContentCls = "",
  onChange,
  disabled = false,
}: {
  form: UseFormReturn<any>;
  name: string;
  schema: any;
  parentName?: string;
  label?: string;
  selectContentCls?: string;
  /**
   * Optional onChange callback, called after field.onChange with (value, {name, schema})
   */
  onChange?: (value: any, meta: { name: string; schema: any }) => void;
  disabled?: boolean;
}) => {
  const { data, isLoading } = useGetAIModels();
  console.log({ data });
  // Create validation rule for this field
  const createValidationRule = () => ({
    validate: (value: any) => {
      const { errors } = validateSchemaField(name, schema, value, parentName);
      if (errors.length > 0) {
        return errors[0].error;
      }
      return true;
    },
  });

  if (Array.isArray(schema.type)) {
    const types = schema.type;
    const nonNullTypes = types.filter((t) => t !== "null");
    if (types.length === 1 && types[0] === "null") {
      return null;
    }
    if (
      types.length === 2 &&
      types.includes("null") &&
      nonNullTypes.length === 1
    ) {
      schema = { ...schema, type: nonNullTypes[0], nullable: true };
    } else {
      return <></>;
    }
  }
  const fieldName = parentName ? `${parentName}.${name}` : name;
  const labelWithRequired = schema.required
    ? `*${label ?? name}`
    : label ?? name;
  // enum type
  if (schema.enum) {
    return (
      <FormField
        key={fieldName}
        control={form.control}
        defaultValue={schema.value}
        name={fieldName}
        disabled={disabled}
        rules={createValidationRule()}
        render={({ field }) => {
          // Wrap onValueChange to call both field.onChange and external onChange
          const handleChange = (value: any) => {
            field.onChange(value);
            onChange?.(value, { name: fieldName, schema });
          };
          const value = field?.value;
          const valueIndex = schema.enum.indexOf(value);
          const enumNamesValue = schema["x-enumNames"]?.[valueIndex];
          return (
            <FormItem>
              <FormLabel className="sdk:flex sdk:gap-[4px]">
                <span>{labelWithRequired}</span>
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
                    Choose the AI model that powers your agent’s responses.
                    Different models vary in speed, accuracy, and cost.
                  </TooltipContent>
                </Tooltip>
              </FormLabel>
              <Select
                value={enumNamesValue ?? field?.value}
                disabled={field?.disabled}
                onValueChange={handleChange}
              >
                <FormControl>
                  <SelectTrigger
                    aria-disabled={field?.disabled}
                    className={field?.disabled ? "sdk:bg-[#303030]" : ""}
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className={selectContentCls}>
                  {(schema["x-enumNames"] || schema.enum).map(
                    (enumValue: any, idx: number) => (
                      <SelectItem key={enumValue} value={enumValue}>
                        {enumValue}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    );
  }
  // array type
  if (schema.type === "array" && schema.itemsSchema) {
    return (
      <FormField
        key={fieldName}
        control={form.control}
        name={fieldName}
        defaultValue={schema.value || []}
        disabled={disabled}
        rules={createValidationRule()}
        render={({ field }) => {
          // Use useState to maintain the key for ArrayField
          const [arrayKey, setArrayKey] = useState(
            field.value?.length + JSON.stringify(field.value)
          );
          // Only update key when actionType is a structural change
          const handleChange = (
            value: any,
            actionType?: "add" | "delete" | "move" | "update"
          ) => {
            field.onChange(value);
            onChange?.(value, { name: fieldName, schema });
            value?.forEach((item: any, idx: number) => {
              form.setValue(`${name}.${idx}`, item, { shouldDirty: true });
            });
            if (
              actionType === "add" ||
              actionType === "delete" ||
              actionType === "move"
            ) {
              setArrayKey(value?.length + JSON.stringify(value));
            }
          };

          return (
            <>
              <ArrayField
                key={arrayKey}
                name={name}
                schema={schema}
                value={field.value || []}
                onChange={handleChange}
                label={labelWithRequired}
                renderItem={(item, idx, onItemChange, onDelete) => {
                  // Propagate onChange to children, treat as content update
                  const renderSchemaFieldOnchange = (
                    value: any,
                    meta: { name: string; schema: any }
                  ) => {
                    const baseArr = Array.isArray(field.value)
                      ? field.value
                      : [];
                    const newValue = baseArr.map((it, i) => {
                      if (i !== idx) return it;
                      if (typeof it === "undefined") {
                        if (schema.itemsSchema.type === "object") {
                          const key = meta.name.split(".").pop();
                          return { [key]: value };
                        }
                        return value;
                      }
                      if (typeof it === "object") {
                        const key = meta.name.split(".").pop();
                        return { ...it, [key]: value };
                      }
                      return value;
                    });
                    handleChange(newValue, "update");
                  };
                  return renderSchemaField({
                    form,
                    name: idx.toString(),
                    schema: schema.itemsSchema,
                    parentName: fieldName,
                    label: `${name}-${idx}`,
                    selectContentCls,
                    onChange: renderSchemaFieldOnchange, // propagate onChange to children
                    disabled,
                  });
                }}
                disabled={disabled}
              />
              <FormMessage />
            </>
          );
        }}
      />
    );
  }

  // object type with additionalProperties (dynamic key-value)
  if (
    schema.type === "object" &&
    Array.isArray(schema.children) &&
    schema.children[0]?.isAdditionalProperties
  ) {
    return (
      <FormField
        key={fieldName}
        control={form.control}
        name={fieldName}
        defaultValue={schema.value || {}}
        disabled={disabled}
        rules={createValidationRule()}
        render={({ field }) => {
          const value = field.value || {};
          const handleKeyChange = (oldKey: string, newKey: string) => {
            if (!newKey || oldKey === newKey) return;
            const entries = Object.entries(value);
            const idx = entries.findIndex(([k]) => k === oldKey);
            if (idx === -1) return;
            entries[idx][0] = newKey;
            const newValue = Object.fromEntries(entries);
            field.onChange(newValue);
            onChange?.(newValue, { name: fieldName, schema });
          };
          const handleValueChange = (key: string, val: any) => {
            const newValue = { ...value, [key]: val };
            field.onChange(newValue);
            onChange?.(newValue, { name: fieldName, schema });
          };
          const handleDelete = (key: string) => {
            const entries = Object.entries(value).filter(([k]) => k !== key);
            const newValue = Object.fromEntries(entries);
            field.onChange(newValue);
            onChange?.(newValue, { name: fieldName, schema });
          };
          const handleAdd = () => {
            const entries = Object.entries(value);
            let idx = 1;
            let newKey = `key${entries.length + 1}`;
            const existingKeys = new Set(entries.map(([k]) => k));
            while (existingKeys.has(newKey)) {
              idx++;
              newKey = `key${entries.length + idx}`;
            }
            entries.push([newKey, undefined]);
            const newValue = Object.fromEntries(entries);
            field.onChange(newValue);
            onChange?.(newValue, { name: fieldName, schema });
          };
          const valueSchema = schema.children[0].valueSchema;
          // --- UI branch ---
          if (Object.keys(value).length === 0) {
            // No items
            return (
              <div className="sdk:w-full sdk:mb-2">
                <FormLabel className="sdk:flex sdk:gap-[4px]">
                  <span>{labelWithRequired}</span>
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
                      Choose the AI model that powers your agent’s responses.
                      Different models vary in speed, accuracy, and cost.
                    </TooltipContent>
                  </Tooltip>
                </FormLabel>
                <Button
                  type="button"
                  disabled={disabled}
                  className="sdk:p-[8px] sdk:px-[18px] sdk:gap-[5px]! sdk:text-[#fff] sdk:hover:text-[#303030] sdk:lowercase"
                  onClick={handleAdd}
                >
                  <AddIcon />
                  <span className="sdk:text-[12px] sdk:leading-[14px]">
                    Add item
                  </span>
                </Button>
              </div>
            );
          }
          // Has items
          return (
            <div className="sdk:w-full sdk:mb-2">
              <FormLabel className="sdk:pb-[10px] sdk:border-b sdk:border-[#303030] sdk:flex sdk:gap-[4px]">
                <span>{labelWithRequired}</span>
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
                    Choose the AI model that powers your agent’s responses.
                    Different models vary in speed, accuracy, and cost.
                  </TooltipContent>
                </Tooltip>
              </FormLabel>
              <div className="sdk:rounded sdk:mb-2">
                {Object.entries(value).map(([k, v], idx) => (
                  <div
                    key={k}
                    className="sdk:flex sdk:flex-row sdk:items-end sdk:gap-[10px] sdk:mb-2"
                  >
                    {/* key area: use Input (uncontrolled), onBlur triggers key change, avoids name collision with value area */}
                    <div className="sdk:mr-2 sdk:w-32">
                      <FormItem>
                        {idx === 0 && <FormLabel>key</FormLabel>}
                        <FormControl>
                          <Input
                            disabled={disabled}
                            defaultValue={k}
                            onBlur={(e) => handleKeyChange(k, e.target.value)}
                            placeholder="key"
                            className={clsx(
                              "sdk:w-full",
                              disabled && "sdk:bg-[#303030]"
                            )}
                          />
                        </FormControl>
                      </FormItem>
                    </div>
                    {/* value area */}
                    <div className="sdk:mr-2 sdk:flex-1">
                      {renderSchemaField({
                        form,
                        name: k,
                        schema: valueSchema,
                        parentName: fieldName,
                        label: idx === 0 ? "value" : "",
                        selectContentCls,
                        onChange: (val) => handleValueChange(k, val),
                        disabled,
                      })}
                    </div>
                    <Button
                      type="button"
                      className="sdk:w-[40px] sdk:h-[40px] sdk:inline-block sdk:border-[#303030] sdk:p-[8px] sdk:px-[10px] sdk:hover:bg-[#303030] sdk:lowercase"
                      onClick={() => handleDelete(k)}
                    >
                      <DeleteIcon className="sdk:text-white" />
                    </Button>
                  </div>
                ))}
              </div>
              {/* <Button
                type="button"
                disabled={disabled}
                className="sdk:p-[8px] sdk:px-[18px] sdk:gap-[5px]! sdk:text-[#fff] sdk:hover:text-[#303030] sdk:lowercase"
                onClick={handleAdd}
              >
                <AddIcon />
                <span className="sdk:text-[12px] sdk:leading-[14px]">
                  Add item
                </span>
              </Button> */}
            </div>
          );
        }}
      />
    );
  }
  // object type
  if (schema.type === "object" && schema.children) {
    return (
      <FormField
        key={fieldName}
        control={form.control}
        name={fieldName}
        defaultValue={schema.value || {}}
        disabled={disabled}
        rules={createValidationRule()}
        render={({ field }) => (
          <div className="sdk:w-full sdk:mb-2">
            <FormLabel className="sdk:flex sdk:gap-[4px]">
              <span>{labelWithRequired}</span>
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
                  Choose the AI model that powers your agent’s responses.
                  Different models vary in speed, accuracy, and cost.
                </TooltipContent>
              </Tooltip>
            </FormLabel>
            <div className="sdk:pl-4  sdk:flex sdk:flex-col sdk:gap-y-[10px] sdk:border-l-2 sdk:border-l-[#303030]">
              {schema.children.map(([childName, childSchema]: [string, any]) =>
                renderSchemaField({
                  form,
                  name: childName,
                  schema: childSchema,
                  parentName: fieldName,
                  selectContentCls,
                  onChange, // propagate onChange to children
                  disabled,
                })
              )}
            </div>
            <FormMessage />
          </div>
        )}
      />
    );
  }
  // file/boolean type (TODO: implement if needed)
  if (schema.type === "file") {
    // TODO: Implement file upload control
    return (
      <FormField
        key={fieldName}
        control={form.control}
        defaultValue={schema.value}
        name={fieldName}
        disabled={disabled}
        render={({ field }) => {
          // Wrap onChange to call both field.onChange and external onChange
          const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            field.onChange(e);
            onChange?.(e, { name: fieldName, schema });
          };
          return (
            <FormItem>
              <FormLabel className="sdk:flex sdk:gap-[4px]">
                <span>{labelWithRequired}</span>
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
                    Choose the AI model that powers your agent’s responses.
                    Different models vary in speed, accuracy, and cost.
                  </TooltipContent>
                </Tooltip>
              </FormLabel>
              <FormControl>
                <Input
                  type="file"
                  placeholder={schema?.description ?? ""}
                  {...field}
                  onChange={handleChange}
                  disabled={field.disabled ?? disabled}
                  className={clsx(
                    (field.disabled ?? disabled) && "sdk:bg-[#303030]"
                  )}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    );
  }
  // string type
  if (schema.type === "string") {
    return (
      <FormField
        key={fieldName}
        control={form.control}
        defaultValue={schema.value}
        name={fieldName}
        disabled={disabled}
        rules={createValidationRule()}
        render={({ field }) => {
          // For string under object, use Input; otherwise use Textarea
          const handleInputChange = (
            e: React.ChangeEvent<HTMLInputElement>
          ) => {
            const val = e.target.value;
            if (schema.nullable && val === "") {
              field.onChange(null);
              onChange?.(null, { name: fieldName, schema });
            } else {
              field.onChange(e);
              onChange?.(val, { name: fieldName, schema });
            }
          };
          const handleTextareaChange = (
            e: React.ChangeEvent<HTMLTextAreaElement>
          ) => {
            const val = e.target.value;
            if (schema.nullable && val === "") {
              field.onChange(null);
              onChange?.(null, { name: fieldName, schema });
            } else {
              field.onChange(e);
              onChange?.(val, { name: fieldName, schema });
            }
          };
          return fieldName === "systemLLM" ? (
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
                        Choose the AI model that powers your agent’s responses.
                        Different models vary in speed, accuracy, and cost.
                      </TooltipContent>
                    </Tooltip>
                  </FormLabel>
                  {!isLoading && (
                    <ModelSelect
                      field={field}
                      data={data}
                      onAgentTypeChange={() => {}}
                    />
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <FormItem>
              <FormLabel className="sdk:flex sdk:gap-[4px]">
                <span>{labelWithRequired}</span>
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
                    Choose the AI model that powers your agent’s responses.
                    Different models vary in speed, accuracy, and cost.
                  </TooltipContent>
                </Tooltip>
              </FormLabel>
              <FormControl>
                {parentName ? (
                  <Input
                    placeholder={schema?.description ?? ""}
                    {...field}
                    onChange={handleInputChange}
                    disabled={field.disabled ?? disabled}
                    className={clsx(
                      (field.disabled ?? disabled) && "sdk:bg-[#303030]"
                    )}
                  />
                ) : (
                  <Textarea
                    placeholder={schema?.description ?? ""}
                    {...field}
                    onChange={handleTextareaChange}
                    disabled={field.disabled ?? disabled}
                    className={clsx(
                      (field.disabled ?? disabled) && "sdk:bg-[#303030]"
                    )}
                  />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    );
  }
  // number/integer type
  if (schema.type === "number" || schema.type === "integer") {
    return (
      <FormField
        key={fieldName}
        control={form.control}
        defaultValue={schema.value}
        name={fieldName}
        disabled={disabled}
        rules={createValidationRule()}
        render={({ field }) => {
          // Wrap onChange to call both field.onChange and external onChange
          const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value;
            console.log(val, "val==handleChange");

            // Only allow numeric input
            if (val !== "" && !/^\d*$/.test(val)) {
              return; // Prevent non-numeric input
            }

            if (schema.nullable && val === "") {
              field.onChange(null);
              onChange?.(null, { name: fieldName, schema });
            } else {
              field.onChange(e);
              onChange?.(val, { name: fieldName, schema });
            }
          };
          return (
            <FormItem>
              <FormLabel className="sdk:flex sdk:gap-[4px]">
                <span>{labelWithRequired}</span>
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
                    Choose the AI model that powers your agent’s responses.
                    Different models vary in speed, accuracy, and cost.
                  </TooltipContent>
                </Tooltip>
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder={schema?.description ?? ""}
                  {...field}
                  onChange={handleChange}
                  className={clsx(
                    (field.disabled ?? disabled) && "sdk:bg-[#303030]"
                  )}
                  disabled={field.disabled ?? disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    );
  }
  if (schema.type === "boolean") {
    // Render boolean as custom Checkbox
    return (
      <FormField
        key={fieldName}
        control={form.control}
        defaultValue={schema.value}
        name={fieldName}
        disabled={disabled}
        rules={createValidationRule()}
        render={({ field }) => {
          // Wrap onChange to call both field.onChange and external onChange
          const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (schema.nullable && e.target.indeterminate) {
              field.onChange(null);
              onChange?.(null, { name: fieldName, schema });
            } else {
              field.onChange(e.target.checked);
              onChange?.(e.target.checked, { name: fieldName, schema });
            }
          };
          return (
            <FormItem>
              <Checkbox
                checked={field.value === null ? false : !!field.value}
                onChange={handleChange}
                label={labelWithRequired}
                disabled={field.disabled ?? disabled}
              />
              <FormMessage />
            </FormItem>
          );
        }}
      />
    );
  }
  // fallback
  return <></>;
};
