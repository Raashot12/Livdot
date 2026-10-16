"use client";
import * as React from "react";
import * as Menu from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight, Circle } from "lucide-react";
import { cn } from "@/shared/lib/utils";
export const DropdownMenu = Menu.Root;
export const DropdownMenuTrigger = Menu.Trigger;
export const DropdownMenuGroup = Menu.Group;
export const DropdownMenuPortal = Menu.Portal;
export const DropdownMenuSub = Menu.Sub;
export const DropdownMenuRadioGroup = Menu.RadioGroup;
export const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof Menu.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof Menu.SubTrigger> & { inset?: boolean }
>(({ className, inset, children, ...props }, ref) => (
  <Menu.SubTrigger
    ref={ref}
    className={cn(
      "focus:bg-accent flex cursor-default items-center rounded px-2 py-1.5 text-sm outline-none",
      inset && "pl-8",
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto" size={14} />
  </Menu.SubTrigger>
));
DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger";
export const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof Menu.SubContent>,
  React.ComponentPropsWithoutRef<typeof Menu.SubContent>
>(({ className, ...props }, ref) => (
  <Menu.SubContent
    ref={ref}
    className={cn(
      "bg-popover z-50 min-w-32 rounded-lg border p-1 shadow-lg",
      className,
    )}
    {...props}
  />
));
DropdownMenuSubContent.displayName = "DropdownMenuSubContent";
export const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof Menu.Content>,
  React.ComponentPropsWithoutRef<typeof Menu.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <Menu.Portal>
    <Menu.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "bg-popover text-popover-foreground z-50 min-w-36 rounded-lg border p-1 shadow-lg",
        className,
      )}
      {...props}
    />
  </Menu.Portal>
));
DropdownMenuContent.displayName = "DropdownMenuContent";
export const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof Menu.Item>,
  React.ComponentPropsWithoutRef<typeof Menu.Item> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <Menu.Item
    ref={ref}
    className={cn(
      "focus:bg-accent flex cursor-default items-center rounded px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className,
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = "DropdownMenuItem";
export const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof Menu.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof Menu.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <Menu.CheckboxItem
    ref={ref}
    checked={checked}
    className={cn(
      "focus:bg-accent relative flex cursor-default items-center rounded py-1.5 pr-2 pl-8 text-sm outline-none",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2">{checked && <Check size={14} />}</span>
    {children}
  </Menu.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";
export const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof Menu.RadioItem>,
  React.ComponentPropsWithoutRef<typeof Menu.RadioItem>
>(({ className, children, ...props }, ref) => (
  <Menu.RadioItem
    ref={ref}
    className={cn(
      "focus:bg-accent relative flex cursor-default items-center rounded py-1.5 pr-2 pl-8 text-sm outline-none",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2">
      <Menu.ItemIndicator>
        <Circle size={8} fill="currentColor" />
      </Menu.ItemIndicator>
    </span>
    {children}
  </Menu.RadioItem>
));
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem";
export const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof Menu.Label>,
  React.ComponentPropsWithoutRef<typeof Menu.Label> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <Menu.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-xs font-semibold",
      inset && "pl-8",
      className,
    )}
    {...props}
  />
));
DropdownMenuLabel.displayName = "DropdownMenuLabel";
export const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof Menu.Separator>,
  React.ComponentPropsWithoutRef<typeof Menu.Separator>
>(({ className, ...props }, ref) => (
  <Menu.Separator
    ref={ref}
    className={cn("bg-border -mx-1 my-1 h-px", className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";
