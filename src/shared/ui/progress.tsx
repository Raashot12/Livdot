"use client";
import * as React from "react";
import * as Primitive from "@radix-ui/react-progress";
import { cn } from "@/shared/lib/utils";
export const Progress = React.forwardRef<
  React.ElementRef<typeof Primitive.Root>,
  React.ComponentPropsWithoutRef<typeof Primitive.Root>
>(({ className, value, ...props }, ref) => (
  <Primitive.Root
    ref={ref}
    className={cn(
      "bg-secondary relative h-2 w-full overflow-hidden rounded-full",
      className,
    )}
    {...props}
  >
    <Primitive.Indicator
      className="bg-primary h-full w-full flex-1 transition-transform"
      style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
    />
  </Primitive.Root>
));
Progress.displayName = "Progress";
