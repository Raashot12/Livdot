"use client";
import { Toaster as Sonner, type ToasterProps } from "sonner";
export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="system"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-border",
          description: "group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
}
