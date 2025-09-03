import { Button, FormLabel } from "../ui";
import AddIcon from "../../assets/svg/add.svg?react";
import DeleteIcon from "../../assets/svg/delete_agent.svg?react";
import ArrowUp from "../../assets/svg/arrow_up.svg?react";
import { TooltipProvider } from "../ui/tooltip";
import { TooltipDescriptor } from "../TooltipDescriptor";
interface ArrayFieldProps {
  name: string;
  schema: any;
  value: any[];
  onChange: (
    value: any[],
    actionType?: "add" | "delete" | "move" | "update"
  ) => void;
  renderItem: (
    item: any,
    idx: number,
    onItemChange: (v: any) => void,
    onDelete: () => void,
    disabled?: boolean
  ) => React.ReactNode;
  label?: string;
  disabled?: boolean;
}

export default function ArrayField({
  name,
  schema,
  value = [],
  onChange,
  renderItem,
  label,
  disabled = false,
}: ArrayFieldProps) {
  if (!value || value.length === 0) {
    return (
      <TooltipProvider delayDuration={0}>
        <div className="sdk:w-full sdk:mb-2">
          <FormLabel className="sdk:pb-[10px] sdk:border-b sdk:border-[var(--sdk-bg-black-light)] sdk:flex sdk:gap-[4px]">
            <span> {label ?? name}</span>
            <TooltipDescriptor type={label ?? name} />
          </FormLabel>
          <Button
            variant="outline"
            type="button"
            className="sdk:p-[8px] sdk:px-[18px] sdk:gap-[5px]! sdk:lowercase"
            onClick={() => onChange([undefined], "add")}
            disabled={disabled}>
            <AddIcon />
            <span className="sdk:text-[12px] sdk:leading-[14px]">Add item</span>
          </Button>
        </div>
      </TooltipProvider>
    );
  }
  if (value.length === 1) {
    return (
      <div className="sdk:w-full sdk:mb-2">
        <FormLabel className="sdk:pb-[10px] sdk:border-b sdk:border-[var(--sdk-color-border-primary)]">
          {label ?? name}
        </FormLabel>
        <div className="sdk:rounded sdk:mb-2">
          <div className="sdk:relative">
            {renderItem(
              value[0],
              0,
              (v) => onChange([v], "update"),
              () => onChange([], "delete"),
              disabled
            )}
            <div className="sdk:flex sdk:flex-row sdk:items-start sdk:gap-[10px] sdk:absolute sdk:right-0 sdk:top-0">
              <Button
                variant="outline"
                type="button"
                className="sdk:w-[24pxpx] sdk:h-[20px] sdk:inline-block  sdk:p-[3px] sdk:px-[5px] sdk:lowercase"
                disabled={true || disabled}>
                <ArrowUp
                  className="sdk:text-[var(--sdk-color-text-primary)]"
                  style={{ width: "12px", height: "12px" }}
                />
              </Button>
              <Button
                variant="outline"
                type="button"
                className="sdk:w-[24px] sdk:h-[20px] sdk:inline-block  sdk:p-[3px] sdk:px-[5px] sdk:lowercase"
                disabled={true || disabled}>
                <ArrowUp
                  className="sdk:text-[var(--sdk-color-text-primary)]"
                  style={{
                    transform: "rotate(180deg)",
                    width: "12px",
                    height: "12px",
                  }}
                />
              </Button>
              <Button
                variant="outline"
                type="button"
                className="sdk:w-[24px] sdk:h-[20px] sdk:inline-block sdk:px-[5px]  sdk:p-[3px] sdk:lowercase"
                onClick={() => onChange([], "delete")}
                disabled={disabled}>
                <DeleteIcon
                  className="sdk:mx-auto sdk:text-[var(--sdk-color-text-primary)]"
                  style={{ width: "12px", height: "12px" }}
                />
              </Button>
            </div>
          </div>
        </div>
        <div className="sdk:flex sdk:gap-2">
          <Button
            variant="outline"
            type="button"
            className="sdk:p-[8px] sdk:px-[18px] sdk:gap-[5px]! sdk:lowercase"
            onClick={() => onChange([...value, undefined], "add")}
            disabled={disabled}>
            <AddIcon />
            <span className="sdk:text-[12px] sdk:leading-[14px]">Add item</span>
          </Button>
        </div>
      </div>
    );
  }
  if (value.length > 1) {
    return (
      <div className="sdk:w-full sdk:mb-2">
        <FormLabel className="sdk:pb-[10px] sdk:border-b sdk:border-[var(--sdk-color-border-primary)]">
          {label ?? name}
        </FormLabel>
        <div className="sdk:rounded sdk:mb-2">
          {value.map((item, idx) => {
            const key = `${name}-${idx}`;
            return (
              <div key={key} className="sdk:mb-2">
                <div className="sdk:relative">
                  {renderItem(
                    item,
                    idx,
                    (v) =>
                      onChange(
                        value.map((it, i) => (i === idx ? v : it)),
                        "update"
                      ),
                    () =>
                      onChange(
                        value.filter((_, i) => i !== idx),
                        "delete"
                      ),
                    disabled
                  )}
                  <div className="sdk:flex sdk:flex-row sdk:items-start sdk:gap-[10px] sdk:absolute sdk:right-0 sdk:top-0">
                    <Button
                      variant="outline"
                      type="button"
                      className="sdk:w-[24pxpx] sdk:h-[20px] sdk:inline-block  sdk:p-[3px] sdk:px-[5px] sdk:lowercase"
                      disabled={idx === 0 || disabled}
                      onClick={() => {
                        if (idx === 0 || disabled) return;
                        const newArr = value.map((obj) =>
                          obj && typeof obj === "object" ? { ...obj } : obj
                        );
                        [newArr[idx - 1], newArr[idx]] = [
                          newArr[idx],
                          newArr[idx - 1],
                        ];
                        onChange(newArr, "move");
                      }}>
                      <ArrowUp
                        className="sdk:text-[var(--sdk-color-text-primary)]"
                        style={{ width: "12px", height: "12px" }}
                      />
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      className="sdk:w-[24px] sdk:h-[20px] sdk:inline-block sdk:p-[3px] sdk:px-[5px] sdk:lowercase"
                      disabled={idx === value.length - 1 || disabled}
                      onClick={() => {
                        if (idx === value.length - 1 || disabled) return;
                        const newArr = value.map((obj) =>
                          obj && typeof obj === "object" ? { ...obj } : obj
                        );
                        [newArr[idx], newArr[idx + 1]] = [
                          newArr[idx + 1],
                          newArr[idx],
                        ];
                        onChange(newArr, "move");
                      }}>
                      <ArrowUp
                        className="sdk:text-[var(--sdk-color-text-primary)]"
                        style={{
                          transform: "rotate(180deg)",
                          width: "12px",
                          height: "12px",
                        }}
                      />
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      className="sdk:w-[24px] sdk:h-[20px] sdk:inline-block sdk:px-[5px]  sdk:p-[3px] sdk:lowercase"
                      onClick={() =>
                        onChange(
                          value.filter((_, i) => i !== idx),
                          "delete"
                        )
                      }
                      disabled={disabled}>
                      <DeleteIcon
                        className="sdk:mx-auto sdk:text-[var(--sdk-color-text-primary)]"
                        style={{ width: "12px", height: "12px" }}
                      />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <Button
          variant="outline"
          type="button"
          className="sdk:p-[8px] sdk:px-[18px] sdk:gap-[5px]! sdk:lowercase"
          onClick={() => onChange([...value, undefined], "add")}
          disabled={disabled}>
          <AddIcon />
          <span className="sdk:text-[12px] sdk:leading-[14px]">Add item</span>
        </Button>
      </div>
    );
  }
  return null;
}
