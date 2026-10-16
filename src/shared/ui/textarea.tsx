import * as React from "react";
import { cn } from "@/shared/lib/utils";
export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "focus-ring bg-background placeholder:text-muted-foreground flex min-h-24 w-full rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
