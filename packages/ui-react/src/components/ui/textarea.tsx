import * as React from "react";
import { cn } from "../../lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, rows = 3, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "sdk:flex sdk:min-h-[95px] sdk:rounded-md sdk:text-[var(--sdk-color-text-primary)] sdk:font-outfit sdk:font-outfit sdk:text-[12px] sdk:w-full sdk:border sdk:border-[var(--sdk-color-input)] sdk:bg-background sdk:px-[18px] sdk:py-[10px] sdk:pl-[14px] sdk:ring-offset-background sdk:placeholder:text-[var(--sdk-muted-foreground)] sdk:focus-visible:outline-none  sdk:disabled:cursor-not-allowed sdk:disabled:opacity-50",

        className,
        {
          "border-destructive": props["aria-invalid"],
        }
      )}
      rows={rows}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
