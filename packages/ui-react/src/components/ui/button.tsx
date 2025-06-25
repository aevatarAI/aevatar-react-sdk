import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "sdk:inline-flex sdk:items-center sdk:justify-center sdk:gap-2 sdk:whitespace-nowrap sdk:font-syne sdk:text-[15px] sdk:font-semibold sdk:ring-offset-background sdk:transition-colors sdk:focus-visible:outline-none sdk:focus-visible:ring-2 sdk:focus-visible:ring-ring sdk:focus-visible:ring-offset-2 sdk:disabled:pointer-events-none sdk:disabled:opacity-50 [&_svg]:sdk:pointer-events-none [&_svg]:sdk:size-4 [&_svg]:sdk:shrink-0",
  {
    variants: {
      variant: {
        default:
          "sdk:border-solid sdk:bg-transparent sdk:border-[0.75px] sdk:border-[#606060] sdk:hover:bg-white sdk:hover:text-black",
        destructive:
          "sdk:bg-destructive sdk:text-destructive-foreground sdk:hover:bg-destructive/90",
        outline:
          "sdk:border sdk:border-input sdk:bg-background sdk:hover:bg-accent sdk:hover:text-accent-foreground",
        secondary:
          "sdk:bg-secondary sdk:text-secondary-foreground sdk:hover:bg-secondary/80",
        ghost: "sdk:hover:bg-accent sdk:hover:text-accent-foreground",
        link: "sdk:text-primary sdk:underline-offset-4 sdk:hover:underline",
      },
      size: {
        default: "sdk:px-[18px] sdk:py-[8px]",
        sm: "sdk:h-9 sdk:rounded-md sdk:px-3",
        lg: "sdk:h-11 sdk:rounded-md sdk:px-8",
        icon: "sdk:h-10 sdk:w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          "aevatar-ui-button-default",
          buttonVariants({ variant, size, className }),
          "aevatar-ui-button"
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
