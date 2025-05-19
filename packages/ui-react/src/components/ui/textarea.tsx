import * as React from "react";
import { cn } from "../../lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, rows = 3, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "sdk:flex sdk:min-h-[95px] sdk:text-white sdk:font-pro sdk:font-pro sdk:text-[12px] sdk:w-full sdk:border sdk:border-[#303030] sdk:bg-background sdk:px-[18px] sdk:py-[10px] sdk:pl-[14px] sdk:ring-offset-background sdk:placeholder:text-muted-foreground sdk:focus-visible:outline-none  sdk:disabled:cursor-not-allowed sdk:disabled:opacity-50",

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
