"use client";

import * as ToastPrimitives from "@radix-ui/react-toast";
import { type VariantProps, cva } from "class-variance-authority";
import { X } from "lucide-react";
import * as React from "react";
import { cn } from "../../lib/utils";

const ToastProvider = ToastPrimitives.Provider;
const ToastViewportEle: React.ElementType = ToastPrimitives.Viewport;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport> &
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <ToastViewportEle
    ref={ref}
    className={cn(
      "sdk:absolute sdk:top-[10px] sdk:left-[50vw] sdk:-translate-x-[50%] sdk:bg-[var(--sdk-color-bg-primary)] sdk:w-auto sdk:z-[9999] sdk:flex sdk:flex-col sdk:transform-gpu sdk:will-change-transform sdk:backface-visibility-hidden sdk:sm:top-auto sdk:sm:bottom-[calc(22px+env(safe-area-inset-bottom,0px))] sdk:sm:right-[30px] sdk:sm:left-auto sdk:sm:-translate-x-0 sdk:sm:max-w-[420px] sdk:max-h-screen",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  "sdk:group sdk:pointer-events-auto sdk:relative sdk:flex sdk:w-full sdk:items-center sdk:justify-between sdk:space-x-4 sdk:overflow-hidden sdk:rounded-md sdk:border-[var(--sdk-color-bg-tertiary)] sdk:p-[20px] sdk:shadow-lg sdk:transition-all sdk:transform-gpu sdk:will-change-transform data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "sdk:border sdk:bg-background sdk:text-foreground",
        destructive:
          "sdk:destructive sdk:group sdk:border-destructive sdk:bg-destructive sdk:text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const ToastRoot: React.ElementType = ToastPrimitives.Root;

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants> &
    React.HTMLAttributes<HTMLDivElement>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastRoot
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastActionEle: React.ElementType = ToastPrimitives.Action;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action> &
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <ToastActionEle
    ref={ref}
    className={cn(
      "sdk:inline-flex sdk:h-8 sdk:shrink-0 sdk:items-center sdk:justify-center sdk:rounded-md sdk:border sdk:bg-transparent sdk:px-3 sdk:text-sm sdk:font-medium sdk:ring-offset-background sdk:transition-colors sdk:hover:bg-secondary sdk:focus:outline-none sdk:focus:ring-2 sdk:focus:ring-ring sdk:focus:ring-offset-2 sdk:disabled:pointer-events-none sdk:disabled:opacity-50 sdk:group-[.destructive]:border-muted/40 sdk:group-[.destructive]:hover:border-destructive/30 sdk:group-[.destructive]:hover:bg-destructive sdk:group-[.destructive]:hover:text-destructive-foreground sdk:group-[.destructive]:focus:ring-destructive",
      className
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastActionCloseEle: React.ElementType = ToastPrimitives.Close;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close> &
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <ToastActionCloseEle
    ref={ref}
    className={cn(
      "sdk:absolute sdk:right-2 sdk:top-2 sdk:rounded-md sdk:p-1 sdk:text-foreground/50 sdk:opacity-0 sdk:transition-opacity sdk:hover:text-foreground sdk:focus:opacity-100 sdk:focus:outline-none sdk:focus:ring-2 sdk:group-hover:opacity-100 sdk:group-[.destructive]:text-[var(--sdk-color-warning)] sdk:group-[.destructive]:hover:text-[var(--sdk-color-text-primary)] sdk:group-[.destructive]:focus:ring-[var(--sdk-color-warning)] sdk:group-[.destructive]:focus:ring-offset-[var(--sdk-color-warning)]",
      className
    )}
    toast-close=""
    {...props}>
    <X className="sdk:h-4 sdk:w-4" />
  </ToastActionCloseEle>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastActionTitleEle: React.ElementType = ToastPrimitives.Title;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title> &
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <ToastActionTitleEle
    ref={ref}
    className={cn(
      "sdk:text-[var(--sdk-color-text-primary)] sdk:text-[12px] sdk:font-normal  sdk:font-source-code",
      className
    )}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastActionDescriptionEle: React.ElementType =
  ToastPrimitives.Description;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description> &
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <ToastActionDescriptionEle
    ref={ref}
    className={cn(
      "sdk:text-[var(--sdk-color-text-primary)] sdk:text-[12px] sdk:font-normal  sdk:font-source-code",
      className
    )}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
