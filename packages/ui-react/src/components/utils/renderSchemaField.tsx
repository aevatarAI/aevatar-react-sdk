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

export const renderSchemaField = ({
  form,
  name,
  schema,
  parentName = "",
  label,
  selectContentCls = "",
  onChange,
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
}) => {
  const fieldName = parentName ? `${parentName}.${name}` : name;

  // enum type
  if (schema.enum) {
    return (
      <FormField
        key={fieldName}
        control={form.control}
        defaultValue={schema.value}
        name={fieldName}
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
              <FormLabel>{label ?? name}</FormLabel>
              <Select
                value={enumNamesValue ?? field?.value}
                disabled={field?.disabled}
                onValueChange={handleChange}>
                <FormControl>
                  <SelectTrigger aria-disabled={field?.disabled}>
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
        render={({ field }) => {
          // Wrap onChange to call both field.onChange and external onChange
          const handleChange = (value: any) => {
            field.onChange(value);
            onChange?.(value, { name: fieldName, schema });
            value?.forEach((item: any, idx: number) => {
              form.setValue(`${name}.${idx}`, item, { shouldDirty: true });
            });
          };

          return (
            <ArrayField
              name={name}
              schema={schema}
              value={field.value || []}
              onChange={handleChange}
              label={name}
              renderItem={(item, idx, onItemChange, onDelete) => {
                const renderSchemaFieldOnchange = (
                  value: any,
                  meta: { name: string; schema: any }
                ) => {
                  const newValue = [...field.value];
                  let newValueItem = newValue[idx];
                  if (typeof newValueItem === "object") {
                    const key = meta.name.split(".").pop();
                    newValueItem = { ...newValueItem, [key]: value };
                  } else {
                    newValueItem = value;
                  }
                  newValue[idx] = newValueItem;

                  handleChange(newValue);
                };
                return renderSchemaField({
                  form,
                  name: idx.toString(),
                  schema: schema.itemsSchema,
                  parentName: fieldName,
                  label: `${name}-${idx}`,
                  selectContentCls,
                  onChange: renderSchemaFieldOnchange, // propagate onChange to children
                });
              }}
            />
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
    // valueSchema: schema.children[0].valueSchema
    return (
      <FormField
        key={fieldName}
        control={form.control}
        name={fieldName}
        defaultValue={schema.value || {}}
        render={({ field }) => {
          // field.value: { [key: string]: any }
          const value = field.value || {};
          const handleKeyChange = (oldKey: string, newKey: string) => {
            if (!newKey || oldKey === newKey) return;
            const newValue = { ...value };
            newValue[newKey] = newValue[oldKey];
            delete newValue[oldKey];
            field.onChange(newValue);
            onChange?.(newValue, { name: fieldName, schema });
          };
          const handleValueChange = (key: string, val: any) => {
            const newValue = { ...value, [key]: val };
            field.onChange(newValue);
            onChange?.(newValue, { name: fieldName, schema });
          };
          const handleDelete = (key: string) => {
            const newValue = { ...value };
            delete newValue[key];
            field.onChange(newValue);
            onChange?.(newValue, { name: fieldName, schema });
          };
          const handleAdd = () => {
            let idx = 1;
            let newKey = `key${Object.keys(value).length + 1}`;
            while (value[newKey]) {
              idx++;
              newKey = `key${Object.keys(value).length + idx}`;
            }
            const newValue = { ...value, [newKey]: undefined };
            field.onChange(newValue);
            onChange?.(newValue, { name: fieldName, schema });
          };
          const valueSchema = schema.children[0].valueSchema;
          return (
            <div className="sdk:w-full sdk:mb-2">
              <FormLabel>{label ?? name}</FormLabel>
              <div className="sdk:pl-4">
                {Object.entries(value).map(([k, v], idx) => (
                  <div key={k} className="sdk:flex sdk:items-center sdk:mb-2">
                    <Input
                      value={k}
                      onChange={(e) => handleKeyChange(k, e.target.value)}
                      className="sdk:mr-2 sdk:w-32"
                      placeholder="Key"
                    />
                    <div className="sdk:mr-2 sdk:flex-1">
                      {renderSchemaField({
                        form,
                        name: k,
                        schema: valueSchema,
                        parentName: fieldName,
                        label: undefined,
                        selectContentCls,
                        onChange: (val) => handleValueChange(k, val),
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(k)}
                      className="sdk:text-red-500 sdk:ml-2">
                      delete
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAdd}
                  className="sdk:mt-2 sdk:text-blue-500">
                  + add
                </button>
              </div>
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
        render={({ field }) => (
          <div className="sdk:w-full sdk:mb-2">
            <FormLabel>{label ?? name}</FormLabel>
            <div className="sdk:pl-4">
              {schema.children.map(([childName, childSchema]: [string, any]) =>
                renderSchemaField({
                  form,
                  name: childName,
                  schema: childSchema,
                  parentName: fieldName,
                  selectContentCls,
                  onChange, // propagate onChange to children
                })
              )}
            </div>
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
        render={({ field }) => {
          // Wrap onChange to call both field.onChange and external onChange
          const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            field.onChange(e);
            onChange?.(e, { name: fieldName, schema });
          };
          return (
            <FormItem>
              <FormLabel>{label ?? name}</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  placeholder={schema?.description ?? ""}
                  {...field}
                  onChange={handleChange}
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
        render={({ field }) => {
          // Wrap onChange to call both field.onChange and external onChange
          const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            field.onChange(e);
            onChange?.(e.target.value, { name: fieldName, schema });
          };
          return (
            <FormItem>
              <FormLabel>{label ?? name}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={schema?.description ?? ""}
                  {...field}
                  onChange={handleChange}
                />
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
        render={({ field }) => {
          // Wrap onChange to call both field.onChange and external onChange
          const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            field.onChange(e);
            onChange?.(e.target.value, { name: fieldName, schema });
          };
          return (
            <FormItem>
              <FormLabel>{label ?? name}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder={schema?.description ?? ""}
                  {...field}
                  onChange={handleChange}
                  className="sdk:appearance-none sdk:[&::-webkit-outer-spin-button]:appearance-none sdk:[&::-webkit-inner-spin-button]:appearance-none sdk:[&::-ms-input-placeholder]:appearance-none"
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
    // TODO: Implement boolean control
    return <></>;
  }
  // fallback
  return <></>;
};
