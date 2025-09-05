import { useState, useCallback, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  FormControl,
  SearchBar,
} from "../ui";
import { Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import clsx from "clsx";

const EnumTooltipContent = ({ enumValue, description }) => (
  <TooltipContent
    className={clsx(
      "sdk:z-1000 sdk:text-[12px] sdk:font-outfit sdk:text-[#B9B9B9] sdk:bg-[#141415] sdk:p-[4px]",
      "sdk:whitespace-pre-wrap sdk:break-words sdk:text-left sdk:z-[999999999]"
    )}
    side="left"
    sideOffset={10}>
    {/* <div className="sdk:font-semibold">{enumValue}</div> */}
    {description && (
      <div>
        <span className="sdk:font-normal">{description}</span>
      </div>
    )}
  </TooltipContent>
);

const EnumSelectItem = ({ enumValue, enumName, description, isVisible }) => {
  // Convert enumValue to string for SelectItem value prop
  const stringValue = String(enumValue);

  return (
    <SelectItem
      className={clsx(!isVisible && "sdk:hidden", "sdk:mx-[8px]")}
      key={enumValue}
      value={stringValue}>
      {description ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="sdk:w-full sdk:text-center">
              {enumName || enumValue}
            </span>
          </TooltipTrigger>
          <EnumTooltipContent
            enumValue={enumName || enumValue}
            description={description}
          />
        </Tooltip>
      ) : (
        <span className="sdk:w-full sdk:text-center">
          {enumName || enumValue}
        </span>
      )}
    </SelectItem>
  );
};

export const EnumSelect = ({
  field,
  schema,
  enumValues,
  enumNames,
  onChange,
  disabled,
  selectContentCls = "",
}) => {
  const [searchValue, setSearch] = useState("");

  // Convert current value to string for Select component
  const currentValue = useMemo(() => {
    const value = field?.value;
    return value !== undefined ? String(value) : undefined;
  }, [field?.value]);

  // Handle value change with comprehensive type conversion for all JSON Schema types
  const handleValueChange = useCallback(
    (stringValue) => {
      if (stringValue === undefined) {
        onChange?.(undefined);
        return;
      }

      // Find the original enum value by string comparison
      const originalValue = schema.enum.find(
        (enumValue) => String(enumValue) === stringValue
      );

      if (originalValue !== undefined) {
        // Convert back to original type based on schema type
        const schemaType = schema.type;
        const isNullable = schema.nullable === true;

        // Handle null values for nullable schemas
        if (stringValue === "null" && isNullable) {
          onChange?.(null);
          return;
        }

        // Type conversion based on JSON Schema types
        switch (schemaType) {
          case "string":
            onChange?.(String(originalValue));
            break;

          case "number": {
            const numValue = Number(originalValue);
            if (Number.isNaN(numValue)) {
              console.warn("Invalid number value in enum:", originalValue);
              onChange?.(originalValue);
            } else {
              onChange?.(numValue);
            }
            break;
          }

          case "integer": {
            const intValue = Number.parseInt(originalValue, 10);
            if (Number.isNaN(intValue)) {
              console.warn("Invalid integer value in enum:", originalValue);
              onChange?.(originalValue);
            } else {
              onChange?.(intValue);
            }
            break;
          }

          case "boolean":
            // Handle boolean conversion from string
            if (stringValue === "true") {
              onChange?.(true);
            } else if (stringValue === "false") {
              onChange?.(false);
            } else {
              // Try to convert original value to boolean
              const boolValue = Boolean(originalValue);
              onChange?.(boolValue);
            }
            break;

          case "null":
            onChange?.(null);
            break;

          case "array":
          case "object":
            // For complex types, try to parse as JSON if it's a string
            try {
              if (typeof originalValue === "string") {
                const parsedValue = JSON.parse(originalValue);
                onChange?.(parsedValue);
              } else {
                onChange?.(originalValue);
              }
            } catch (error) {
              console.warn(
                "Failed to parse complex type value:",
                originalValue,
                error
              );
              onChange?.(originalValue);
            }
            break;

          default:
            // For any other type or undefined type, return original value
            onChange?.(originalValue);
            break;
        }
      } else {
        // If original value not found, try to convert stringValue based on schema type
        const schemaType = schema.type;
        const isNullable = schema.nullable === true;

        if (stringValue === "null" && isNullable) {
          onChange?.(null);
        } else {
          // Fallback conversion
          switch (schemaType) {
            case "number": {
              const numValue = Number(stringValue);
              onChange?.(Number.isNaN(numValue) ? stringValue : numValue);
              break;
            }
            case "integer": {
              const intValue = Number.parseInt(stringValue, 10);
              onChange?.(Number.isNaN(intValue) ? stringValue : intValue);
              break;
            }
            case "boolean":
              onChange?.(stringValue === "true");
              break;
            default:
              onChange?.(stringValue);
              break;
          }
        }
      }
    },
    [onChange, schema.enum, schema.type, schema.nullable]
  );

  // Check if an enum item should be visible based on search
  const isItemVisible = useCallback(
    (enumValue, index) => {
      if (!searchValue) return true;

      const enumName = enumNames?.[index] || enumValue;
      const searchLower = searchValue.toLocaleLowerCase();
      const enumNameStr = String(enumName || "");
      return enumNameStr.toLocaleLowerCase().includes(searchLower);
    },
    [searchValue, enumNames]
  );

  const descriptionArray = useMemo(() => {
    if (!schema?.description) return [];
    const isCommonDes = enumValues.every((value) =>
      schema?.description.includes(value)
    );
    if (!isCommonDes) return [];
    const descriptions = schema?.description.split("\n");

    return descriptions
      .map((description) => description?.trim())
      .map((description) => description?.split("=")?.[1]?.trim());
  }, [schema?.description, enumValues]);

  return (
    <Select
      value={currentValue}
      disabled={field?.disabled || disabled}
      onValueChange={handleValueChange}>
      <FormControl>
        <SelectTrigger
          aria-disabled={field?.disabled || disabled}
          className={clsx((field?.disabled || disabled) && "sdk:bg-[#303030]")}>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
      </FormControl>
      <SelectContent
        className={clsx("sdk:p-0! sdk:pb-[8px]!", selectContentCls)}>
        <div className="sdk:flex sdk:flex-row sdk:mb-[8px] sdk:gap-[4px] sdk:border-b sdk:border-[#6F6F6F80] sdk:border-solid">
          <SearchBar
            placeholder="search"
            value={searchValue}
            onChange={setSearch}
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>
        {(enumNames || enumValues)?.map((enumName, index) => {
          const _enumValue = enumValues?.[index];
          const isVisible = isItemVisible(enumName, index);
          const description = descriptionArray?.[index];
          return (
            <EnumSelectItem
              key={enumName}
              isVisible={isVisible}
              enumValue={_enumValue}
              enumName={enumName}
              description={description}
            />
          );
        })}
      </SelectContent>
    </Select>
  );
};
