"use client";

import * as SheetPrimitive from "@radix-ui/react-dialog";
import { type VariantProps, cva } from "class-variance-authority";
import { X } from "lucide-react";
import * as React from "react";
import { cn } from "../../lib/utils";

const Sheet = SheetPrimitive.Root;

const SheetTrigger: React.ElementType  = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const SheetPortal = SheetPrimitive.Portal;

const SheetPrimitiveOverlay: React.ElementType = SheetPrimitive.Overlay;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay> &
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <SheetPrimitiveOverlay
    className={cn(
      "sdk:absolute sdk:inset-0 sdk:z-50 sdk:bg-[var(--sdk-bg-background)]/80  data-[state=open]:sdk:animate-in data-[state=closed]:sdk:animate-out data-[state=closed]:sdk:fade-out-0 data-[state=open]:sdk:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const sheetVariants = cva(
  "sdk:fixed sdk:z-50 sdk:gap-4 sdk:border-[var(--sdk-color-sidebar-border)]! sdk:focus-visible:outline-hidden sdk:bg-background sdk:p-6 sdk:shadow-lg sdk:transition sdk:ease-in-out data-[state=open]:sdk:animate-in data-[state=closed]:sdk:animate-out data-[state=closed]:sdk:duration-300 data-[state=open]:sdk:duration-500",
  {
    variants: {
      side: {
        top: "sdk:inset-x-0 sdk:top-0 sdk:border-b data-[state=closed]:sdk:slide-out-to-top data-[state=open]:sdk:slide-in-from-top",
        bottom:
          "sdk:inset-x-0 sdk:bottom-0 sdk:border-t data-[state=closed]:sdk:slide-out-to-bottom data-[state=open]:sdk:slide-in-from-bottom",
        left: "sdk:inset-y-0 sdk:left-0 sdk:h-full sdk:w-3/4 data-[state=closed]:sdk:slide-out-to-left data-[state=open]:sdk:slide-in-from-left sdk:sm:max-w-sm",
        right:
          "sdk:inset-y-0 sdk:right-0 sdk:h-full sdk:w-3/4  sdk:border-l data-[state=closed]:sdk:slide-out-to-right data-[state=open]:sdk:slide-in-from-right sdk:sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
);

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetPrimitiveClose: React.ElementType = SheetPrimitive.Close;

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps & { closable?: boolean, container?: HTMLElement }
>(({ side = "right", className, children, closable = true, container, ...props }, ref) => (
  <SheetPortal container={container} forceMount={props.forceMount}>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      {...props}>
      {children}
      {closable && (
        <SheetPrimitiveClose className="sdk:absolute sdk:right-4 sdk:top-4 sdk:rounded-sm sdk:opacity-70 sdk:ring-offset-background sdk:transition-opacity sdk:hover:opacity-100 sdk:focus:outline-hidden sdk:focus:ring-2 sdk:focus:ring-ring sdk:focus:ring-offset-2 sdk:disabled:pointer-events-none data-[state=open]:sdk:bg-secondary">
          <X className="sdk:h-4 sdk:w-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitiveClose>
      )}
    </SheetPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "sdk:flex sdk:flex-col sdk:space-y-2 sdk:text-center sdk:sm:text-left",
      className
    )}
    {...props}
  />
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "sdk:flex sdk:flex-col-reverse sdk:sm:flex-row sdk:sm:justify-end sdk:sm:space-x-2",
      className
    )}
    {...props}
  />
);
SheetFooter.displayName = "SheetFooter";

const SheetPrimitiveTitle: React.ElementType = SheetPrimitive.Title;

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title> &
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <SheetPrimitiveTitle
    ref={ref}
    className={cn("sdk:text-lg sdk:font-semibold sdk:text-foreground", className)}
    {...props}
  />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetPrimitiveDescription: React.ElementType = SheetPrimitive.Description;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description> &
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <SheetPrimitiveDescription
    ref={ref}
    className={cn("sdk:text-sm sdk:text-[var(--sdk-muted-foreground)]", className)}
    {...props}
  />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
