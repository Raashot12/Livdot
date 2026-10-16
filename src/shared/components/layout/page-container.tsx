import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

export function PageContainer({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl", className)} {...props} />
  );
}
