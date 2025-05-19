import { Button, FormLabel } from "../ui";
import AddIcon from "../../assets/svg/add.svg?react";
import DeleteIcon from "../../assets/svg/delete_agent.svg?react";
import ArrowUp from "../../assets/svg/arrow_up.svg?react";

interface ArrayFieldProps {
  name: string;
  schema: any;
  value: any[];
  onChange: (value: any[]) => void;
  renderItem: (
    item: any,
    idx: number,
    onItemChange: (v: any) => void,
    onDelete: () => void
  ) => React.ReactNode;
  label?: string;
}

export default function ArrayField({
  name,
  schema,
  value = [],
  onChange,
  renderItem,
  label,
}: ArrayFieldProps) {
  if (!value || value.length === 0) {
    return (
      <div className="sdk:w-full sdk:mb-2">
        <FormLabel>{label ?? name}</FormLabel>
        <Button
          type="button"
          className="sdk:p-[8px] sdk:px-[18px] sdk:gap-[5px]! sdk:text-[#fff] sdk:hover:text-[#303030] sdk:lowercase"
          onClick={() => onChange([undefined])}>
          <AddIcon className="text-white" />{" "}
          <span className="sdk:text-[12px] sdk:leading-[14px]">Add item</span>
        </Button>
      </div>
    );
  }
  if (value.length === 1) {
    return (
      <div className="sdk:w-full sdk:mb-2">
        <FormLabel>{label ?? name}</FormLabel>
        <div className="sdk:rounded sdk:mb-2">
          <div className="sdk:flex sdk:flex-row sdk:items-end sdk:gap-[10px]">
            {renderItem(
              value[0],
              0,
              (v) => onChange([v]),
              () => onChange([])
            )}
            <Button
              type="button"
              className="sdk:w-[40px] sdk:h-[40px] sdk:border-[#303030] sdk:p-[8px] sdk:px-[10px] sdk:hover:bg-[#303030] sdk:lowercase"
              onClick={() => onChange([])}>
              <DeleteIcon />
            </Button>
          </div>
        </div>
        <div className="sdk:flex sdk:gap-2">
          <Button
            type="button"
            className="sdk:p-[8px] sdk:px-[18px] sdk:gap-[5px]! sdk:text-[#fff] sdk:hover:text-[#303030] sdk:lowercase"
            onClick={() => onChange([...value, undefined])}>
            <AddIcon className="text-white" />
            <span className="sdk:text-[12px] sdk:leading-[14px]">Add item</span>
          </Button>
        </div>
      </div>
    );
  }
  if (value.length > 1) {
    return (
      <div className="sdk:w-full sdk:mb-2">
        <FormLabel>{label ?? name}</FormLabel>
        <div className="sdk:rounded sdk:mb-2">
          {value.map((item, idx) => {
            const key =
              item && (item.id || item.name)
                ? `${name}-${item.id || item.name}`
                : `${name}-${idx}`;
            return (
              <div key={key} className="sdk:flex sdk:items-end sdk:mb-2">
                <div className="sdk:flex sdk:flex-row sdk:items-end sdk:gap-[10px] sdk:flex-1">
                  {renderItem(
                    item,
                    idx,
                    (v) => onChange(value.map((it, i) => (i === idx ? v : it))),
                    () => onChange(value.filter((_, i) => i !== idx))
                  )}
                  <Button
                    type="button"
                    className="sdk:w-[40px] sdk:h-[40px] sdk:inline-block sdk:border-[#303030] sdk:p-[8px] sdk:px-[10px] sdk:hover:bg-[#303030] sdk:lowercase"
                    disabled={idx === 0}
                    onClick={() => {
                      if (idx === 0) return;
                      const newArr = [...value];
                      [newArr[idx - 1], newArr[idx]] = [
                        newArr[idx],
                        newArr[idx - 1],
                      ];
                      onChange(newArr);
                    }}>
                    <ArrowUp />
                  </Button>
                  <Button
                    type="button"
                    className="sdk:w-[40px] sdk:h-[40px] sdk:inline-block sdk:border-[#303030] sdk:p-[8px] sdk:px-[10px] sdk:hover:bg-[#303030] sdk:lowercase"
                    disabled={idx === value.length - 1}
                    onClick={() => {
                      if (idx === value.length - 1) return;
                      const newArr = [...value];
                      [newArr[idx], newArr[idx + 1]] = [
                        newArr[idx + 1],
                        newArr[idx],
                      ];
                      onChange(newArr);
                    }}>
                    <ArrowUp style={{ transform: "rotate(180deg)" }} />
                  </Button>
                  <Button
                    type="button"
                    className="sdk:w-[40px] sdk:h-[40px] sdk:inline-block sdk:px-[10px]  sdk:border-[#303030] sdk:p-[8px] sdk:hover:bg-[#303030] sdk:lowercase"
                    onClick={() => onChange(value.filter((_, i) => i !== idx))}>
                    <DeleteIcon />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        <Button
          type="button"
          className="sdk:p-[8px] sdk:px-[18px] sdk:gap-[5px]! sdk:text-[#fff] sdk:hover:text-[#303030] sdk:lowercase"
          onClick={() => onChange([...value, undefined])}>
          <AddIcon className="text-white" />
          <span className="sdk:text-[12px] sdk:leading-[14px]">Add item</span>
        </Button>
      </div>
    );
  }
  // ...TODO
  return null;
}
