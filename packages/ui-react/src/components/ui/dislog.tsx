import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "../../lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger: React.ElementType = DialogPrimitive.Trigger;
const DialogPortal: React.ElementType = DialogPrimitive.Portal;
const DialogClose: React.ElementType = DialogPrimitive.Close;
const DialogPrimitiveOverlay: React.ElementType = DialogPrimitive.Overlay;
const DialogPrimitiveClose: React.ElementType = DialogPrimitive.Close;
const DialogPrimitiveTitle: React.ElementType = DialogPrimitive.Title;
const DialogPrimitiveDescription: React.ElementType =
  DialogPrimitive.Description;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> &
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <DialogPrimitiveOverlay
    ref={ref}
    className={cn(
      "sdk:absolute sdk:inset-0 sdk:z-5 sdk:bg-black/80 data-[state=open]:sdk:animate-in data-[state=closed]:sdk:animate-out data-[state=closed]:sdk:fade-out-0 data-[state=open]:sdk:fade-in-0",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "sdk:fixed sdk:left-[50%] sdk:top-[50%] sdk:z-50 sdk:grid sdk:w-full sdk:max-w-lg sdk:translate-x-[-50%] sdk:translate-y-[-50%] sdk:border sdk:bg-[#171717] sdk:p-6 sdk:shadow-lg sdk:duration-200 data-[state=open]:sdk:animate-in data-[state=closed]:sdk:animate-out data-[state=closed]:sdk:fade-out-0 data-[state=open]:sdk:fade-in-0 data-[state=closed]:sdk:zoom-out-95 data-[state=open]:sdk:zoom-in-95 data-[state=closed]:sdk:slide-out-to-left-1/2 data-[state=closed]:sdk:slide-out-to-top-[48%] data-[state=open]:sdk:slide-in-from-left-1/2 data-[state=open]:sdk:slide-in-from-top-[48%] sm:sdk:rounded-lg",
        className
      )}
      {...props}>
      {children}
      <DialogPrimitiveClose className="sdk:absolute sdk:right-4 sdk:top-4 sdk:rounded-sm sdk:opacity-70 sdk:ring-offset-background sdk:transition-opacity hover:sdk:opacity-100 focus:sdk:outline-none focus:sdk:ring-2 focus:sdk:ring-ring focus:sdk:ring-offset-2 disabled:sdk:pointer-events-none data-[state=open]:sdk:bg-accent data-[state=open]:sdk:text-muted-foreground">
        <span className="sdk:sr-only">Close</span>
      </DialogPrimitiveClose>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "sdk:flex sdk:flex-col sdk:space-y-1.5 sdk:text-center sm:sdk:text-left",
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "sdk:flex sdk:flex-col-reverse sm:sdk:flex-row sm:sdk:justify-end sm:sdk:space-x-2",
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> &
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <DialogPrimitiveTitle
    ref={ref}
    className={cn(
      "sdk:text-lg sdk:font-semibold sdk:leading-none sdk:tracking-tight",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description> &
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <DialogPrimitiveDescription
    ref={ref}
    className={cn("sdk:text-sm sdk:text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
