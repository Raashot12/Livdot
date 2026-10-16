import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";
const variants = cva("relative w-full rounded-lg border p-4 [&>svg~*]:pl-7", {
  variants: {
    variant: {
      default: "bg-card text-card-foreground",
      destructive: "border-destructive/40 bg-destructive/5 text-destructive",
    },
  },
  defaultVariants: { variant: "default" },
});
export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof variants> {}
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(variants({ variant }), className)}
      {...props}
    />
  ),
);
Alert.displayName = "Alert";
export const AlertTitle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h5 className={cn("mb-1 leading-none font-medium", className)} {...props} />
);
export const AlertDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm opacity-90", className)} {...props} />
);
