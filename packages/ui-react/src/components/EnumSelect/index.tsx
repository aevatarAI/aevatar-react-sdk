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
import {
  isPlainObject,
  safeStringify,
  isReactElement,
  safeKey,
} from "../../utils";
import clsx from "clsx";

// Type definitions for better type safety
interface EnumTooltipContentProps {
  enumValue: string | number | boolean | null | undefined;
  description?: string | Record<string, any> | null | undefined;
}

interface EnumSelectItemProps {
  enumValue: string | number | boolean | null | undefined;
  enumName?: string | number | boolean | null | undefined;
  description?: string | Record<string, any> | null | undefined;
  isVisible: boolean;
}

interface EnumSelectProps {
  field?: {
    value?: any;
    disabled?: boolean;
  };
  schema: {
    enum: any[];
    type?: string;
    nullable?: boolean;
    description?: string;
    "x-descriptions"?: string[];
  };
  enumValues: any[];
  enumNames?: any[];
  onChange?: (value: any) => void;
  disabled?: boolean;
  selectContentCls?: string;
}

const EnumTooltipContent = ({
  enumValue,
  description,
}: EnumTooltipContentProps) => {
  // Safe value conversion
  const safeEnumValue = safeStringify(enumValue);

  // Handle different description types with better error handling
  const renderDescription = () => {
    try {
      // Handle null/undefined descriptions
      if (description === null || description === undefined) {
        return <div className="sdk:font-semibold">{safeEnumValue}</div>;
      }

      // Handle string descriptions
      if (typeof description === "string") {
        return <div className="sdk:font-normal">{safeEnumValue}</div>;
      }

      // Handle object descriptions with safer type checking
      if (isPlainObject(description)) {
        const entries = Object.entries(description);

        // Check if object has any enumerable properties
        if (entries.length === 0) {
          return <div className="sdk:font-normal">{safeEnumValue}</div>;
        }

        return entries.map(([key, value]) => (
          <div key={safeKey(key)}>
            <span className="sdk:font-semibold sdk:text-[12px] sdk:text-[var(--sdk-color-text-primary)]">
              {safeStringify(key)}:&nbsp;
            </span>
            <span className="sdk:font-normal sdk:text-[12px] sdk:text-[var(--sdk-color-text-secondary)]">
              {safeStringify(value)}
            </span>
          </div>
        ));
      }

      // Handle React elements safely
      if (isReactElement(description)) {
        return description;
      }

      // Fallback for other types
      return <div className="sdk:font-normal">{safeEnumValue}</div>;
    } catch (error) {
      console.warn("Error rendering tooltip description:", error);
      return <div className="sdk:font-semibold">{safeEnumValue}</div>;
    }
  };

  return (
    <TooltipContent
      className={clsx(
        // SDK prefix styles for backward compatibility
        "sdk:z-1000 sdk:text-[12px] sdk:font-geist sdk:text-[var(--sdk-color-text-secondary)] sdk:bg-[var(--sdk-color-bg-primary)] sdk:p-[4px]",
        "sdk:whitespace-pre-wrap sdk:break-words sdk:text-left sdk:z-[99999]"
      )}
      side="left"
      sideOffset={10}>
      {renderDescription()}
    </TooltipContent>
  );
};

const EnumSelectItem = ({
  enumValue,
  enumName,
  description,
  isVisible,
}: EnumSelectItemProps) => {
  // Convert enumValue to string for SelectItem value prop with safe conversion
  const stringValue = safeStringify(enumValue);

  return (
    <SelectItem
      className={clsx(!isVisible && "sdk:hidden", "sdk:mx-[8px]")}
      key={safeStringify(enumValue)}
      value={stringValue}>
      {description ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="sdk:w-full sdk:text-center">
              {safeStringify(enumName || enumValue)}
            </span>
          </TooltipTrigger>
          <EnumTooltipContent
            enumValue={enumName || enumValue}
            description={description}
          />
        </Tooltip>
      ) : (
        <span className="sdk:w-full sdk:text-center">
          {safeStringify(enumName || enumValue)}
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
}: EnumSelectProps) => {
  const [searchValue, setSearch] = useState("");

  // Convert current value to string for Select component with safe conversion
  const currentValue = useMemo(() => {
    const value = field?.value;
    return value !== undefined ? safeStringify(value) : undefined;
  }, [field?.value]);

  // Handle value change with comprehensive type conversion for all JSON Schema types
  const handleValueChange = useCallback(
    (stringValue) => {
      if (stringValue === undefined) {
        onChange?.(undefined);
        return;
      }

      // Find the original enum value by string comparison with safe conversion
      const originalValue = schema.enum.find(
        (enumValue) => safeStringify(enumValue) === stringValue
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
            onChange?.(safeStringify(originalValue));
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

  // Check if an enum item should be visible based on search with safe conversion
  const isItemVisible = useCallback(
    (enumValue, index) => {
      if (!searchValue) return true;

      const enumName = enumNames?.[index] || enumValue;
      const searchLower = searchValue.toLocaleLowerCase();
      const enumNameStr = safeStringify(enumName || "");
      return enumNameStr.toLocaleLowerCase().includes(searchLower);
    },
    [searchValue, enumNames]
  );

  const descriptionArray = useMemo(() => {
    if (schema?.["x-descriptions"]) {
      return schema?.["x-descriptions"];
    }
    return [];
    // if (!schema?.description) return [];
    // const isCommonDes = enumValues.every((value) =>
    //   schema?.description.includes(value)
    // );
    // if (!isCommonDes) return [];
    // const descriptions = schema?.description.split("\n");

    // return descriptions
    //   .map((description) => description?.trim())
    //   .map((description) => description?.split("=")?.[1]?.trim());
  }, [schema]);

  return (
    <Select
      value={currentValue}
      disabled={field?.disabled || disabled}
      onValueChange={handleValueChange}>
      <FormControl>
        <SelectTrigger
          aria-disabled={field?.disabled || disabled}
          className={clsx(
            "sdk:bg-[var(--sdk-bg-background)]",
            (field?.disabled || disabled) &&
              "sdk:bg-[var(--sdk-color-border-primary)]"
          )}>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
      </FormControl>
      <SelectContent
        className={clsx(
          "sdk:p-0! sdk:pb-[8px]! sdk:overflow-visible sdk:bg-[var(--sdk-bg-popover)]!",
          selectContentCls
        )}>
        <div className="sdk:flex sdk:flex-row sdk:mb-[8px] sdk:gap-[4px] sdk:border-b sdk:border-[var(--sdk-color-border-primary)] sdk:border-solid">
          <SearchBar
            className="sdk:bg-[var(--sdk-bg-popover)]!"
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
              key={safeKey(enumName, index)}
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
