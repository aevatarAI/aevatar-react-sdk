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
}: {
  form: UseFormReturn<any>;
  name: string;
  schema: any;
  parentName?: string;
  label?: string;
  selectContentCls?: string;
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
          console.log(field, "field==enum");
          const value = field?.value;
          const valueIndex = schema.enum.indexOf(value);
          const enumNamesValue = schema["x-enumNames"]?.[valueIndex];
          return (
            <FormItem>
              <FormLabel>{label ?? name}</FormLabel>
              <Select
                value={enumNamesValue ?? field?.value}
                disabled={field?.disabled}
                onValueChange={field.onChange}>
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
        render={({ field }) => (
          <ArrayField
            name={name}
            schema={schema}
            value={field.value || []}
            onChange={(value) => {
              console.log("ArrayField===", value);
              field.onChange(value);
            }}
            label={name}
            renderItem={(item, idx, onItemChange, onDelete) =>
              renderSchemaField({
                form,
                name: idx.toString(),
                schema: schema.itemsSchema,
                parentName: fieldName,
                label: `${name}-${idx}`,
                selectContentCls,
              })
            }
          />
        )}
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
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label ?? name}</FormLabel>
            <FormControl>
              <Input
                type="file"
                placeholder={schema?.description ?? ""}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
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
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label ?? name}</FormLabel>
            <FormControl>
              <Textarea placeholder={schema?.description ?? ""} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
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
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label ?? name}</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder={schema?.description ?? ""}
                {...field}
                className="sdk:appearance-none sdk:[&::-webkit-outer-spin-button]:appearance-none sdk:[&::-webkit-inner-spin-button]:appearance-none sdk:[&::-ms-input-placeholder]:appearance-none"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }
  if (schema.type === "boolean") {
    // TODO: Implement boolean control
    return null;
  }
  // fallback
  return null;
};
