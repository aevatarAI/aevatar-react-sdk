import type React from "react";
import { cn } from "../../lib/utils";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  disabled?: boolean;
}

/**
 * Custom Checkbox component styled according to Figma spec.
 */
export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  ...props
}) => {
  return (
    <label className={cn(
      "sdk:flex sdk:items-center sdk:gap-[8px] sdk:cursor-pointer",
      disabled && "sdk:opacity-50 sdk:cursor-not-allowed"
    )}>
      <span
        className={cn(
          "sdk:relative sdk:w-[18px] sdk:h-[18px] sdk:rounded-[4px] sdk:box-border sdk:flex sdk:items-center sdk:justify-center",
          disabled && "sdk:bg-[var(--sdk-color-border-primary)] sdk:border sdk:border-[var(--sdk-color-border-primary)]",
          !disabled && checked
            ? "sdk:bg-[var(--sdk-border-foreground)] sdk:border-[2px] sdk:border-[var(--sdk-color-border-primary)]"
            : !disabled && "sdk:bg-[var(--sdk-color-bg-primary)] sdk:border sdk:border-[var(--sdk-color-border-primary)]"
        )}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sdk:absolute sdk:opacity-0 sdk:w-full sdk:h-full sdk:cursor-pointer"
          {...props}
        />
        {checked && (
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="sdk:w-[12px] sdk:h-[12px]"
          >
            <path
              d="M3 6.5L5.5 9L9 4.5"
              stroke="var(--sdk-color-border-primary)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      {label && (
        <span className="sdk:text-[var(--sdk-muted-foreground)] sdk:text-[13px] sdk:font-outfit sdk:lowercase">
          {label}
        </span>
      )}
    </label>
  );
}; 