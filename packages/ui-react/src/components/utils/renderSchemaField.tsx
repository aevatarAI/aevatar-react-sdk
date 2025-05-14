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
                const renderSchemaFieldOnchange = (value: any) => {
                  const newValue = [...field.value];
                  newValue[idx] = value;
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
