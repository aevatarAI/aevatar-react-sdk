import React from "react";
import { cn } from "../../lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "sdk:flex sdk:h-10 sdk:w-full sdk:rounded-md sdk:text-[12px] sdk:text-[var(--sdk-color-text-primary)] sdk:font-outfit sdk:border sdk:border-[var(--sdk-color-input)] sdk:bg-background sdk:px-[18px] sdk:py-[10px] sdk:pl-[14px] sdk:ring-offset-background sdk:file:border-0 sdk:file:bg-transparent sdk:file:text-sm sdk:file:font-medium sdk:file:text-foreground sdk:placeholder:text-[var(--sdk-color-border-primary)] sdk:placeholder:text-[12px] sdk:focus-visible:outline-none sdk:disabled:cursor-not-allowed sdk:disabled:opacity-50",
          className,
          {
            "sdk:border-destructive": props["aria-invalid"],
          }
        )}
        ref={ref}
        autoComplete="off"
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
