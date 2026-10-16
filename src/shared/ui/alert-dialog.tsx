"use client";
import * as React from "react";
import * as Primitive from "@radix-ui/react-alert-dialog";
import { cn } from "@/shared/lib/utils";
export const AlertDialog = Primitive.Root;
export const AlertDialogTrigger = Primitive.Trigger;
export const AlertDialogPortal = Primitive.Portal;
export const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof Primitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof Primitive.Overlay>
>(({ className, ...props }, ref) => (
  <Primitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/45", className)}
    {...props}
  />
));
AlertDialogOverlay.displayName = "AlertDialogOverlay";
export const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof Primitive.Content>,
  React.ComponentPropsWithoutRef<typeof Primitive.Content>
>(({ className, ...props }, ref) => (
  <Primitive.Portal>
    <AlertDialogOverlay />
    <Primitive.Content
      ref={ref}
      className={cn(
        "bg-card fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border p-6 shadow-xl",
        className,
      )}
      {...props}
    />
  </Primitive.Portal>
));
AlertDialogContent.displayName = "AlertDialogContent";
export const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("space-y-2", className)} {...props} />
);
export const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
      className,
    )}
    {...props}
  />
);
export const AlertDialogTitle = Primitive.Title;
export const AlertDialogDescription = Primitive.Description;
export const AlertDialogAction = Primitive.Action;
export const AlertDialogCancel = Primitive.Cancel;
