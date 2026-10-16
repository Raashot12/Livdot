"use client";

import type { ReactNode } from "react";
import { Check, ChevronDown } from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";
import {
  fieldClass,
  fieldLabelClass,
  steps,
} from "../constants/create-event.constants";
export function StepProgress({
  currentStep,
  progress,
  onSelect,
}: {
  currentStep: number;
  progress: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="mb-5 overflow-x-auto pb-1">
      <ol
        aria-label="Event setup progress"
        className="relative flex min-w-[650px] items-start justify-between"
      >
        <li
          aria-hidden="true"
          className="absolute top-[14px] right-[8.33%] left-[8.33%] h-[2px] bg-[#e1e8f2]"
        >
          <span
            className="block h-full bg-gradient-to-r from-[#075bff] to-[#00bdd1] transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </li>
        {steps.map((label, index) => {
          const completed = index < currentStep;
          const active = index === currentStep;
          return (
            <li key={label} className="relative z-[1] w-[16.666%] text-center">
              <button
                type="button"
                onClick={() => onSelect(index)}
                disabled={index > currentStep}
                aria-current={active ? "step" : undefined}
                aria-label={`${label}${completed ? ", completed" : active ? ", current step" : ", upcoming"}`}
                className="group inline-flex min-w-[78px] flex-col items-center gap-1.5 disabled:cursor-default"
              >
                <span
                  className={`grid size-[30px] place-items-center rounded-full border text-[12px] font-semibold transition ${active ? "border-[#075bff] bg-[#075bff] text-white shadow-[0_3px_8px_rgba(7,91,255,.2)]" : completed ? "border-[#168aff] bg-[#168aff] text-white" : "border-[#d6dfec] bg-white text-[#52627f] group-hover:border-[#9bbcf0]"}`}
                >
                  {completed ? <Check size={15} /> : index + 1}
                </span>
                <span
                  className={`text-[10px] font-semibold whitespace-nowrap sm:text-[11px] ${active ? "text-[#075bff]" : "text-[#647491]"}`}
                >
                  {label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function PanelHeading({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-[38px] shrink-0 place-items-center rounded-[10px] bg-[#eaf2ff] text-[#075bff] ring-1 ring-[#d8e6ff] ring-inset">
        {icon}
      </span>
      <span className="min-w-0">
        <h2 className="text-[14px] leading-tight font-bold tracking-[-.025em] text-[#0b1538] sm:text-[15px]">
          {title}
        </h2>
        <p className="mt-1 text-[10px] leading-[1.4] text-[#667794] sm:text-[11px]">
          {description}
        </p>
      </span>
    </div>
  );
}

export function Field({
  id,
  label,
  registration,
  error,
  hint,
  required,
  type = "text",
  placeholder,
  maxLength,
  inputMode,
  min,
}: {
  id: string;
  label: string;
  registration: UseFormRegisterReturn;
  error?: string;
  hint?: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  maxLength?: number;
  inputMode?: "text" | "numeric" | "decimal";
  min?: string;
}) {
  const hintId = `${id}-hint`;
  const accessibleLabel = label || id.replace(/-\d+$/, "").replaceAll("-", " ");
  return (
    <div className="min-w-0">
      <label htmlFor={id} className={label ? fieldLabelClass : "sr-only"}>
        {accessibleLabel} {required && <RequiredMark />}
      </label>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        placeholder={placeholder}
        maxLength={maxLength}
        min={min}
        aria-invalid={Boolean(error)}
        aria-describedby={hint || error ? hintId : undefined}
        {...registration}
        className={`${fieldClass} ${error ? "border-[#e65260] focus:border-[#e65260] focus:ring-[#e65260]/10" : ""}`}
      />
      {(hint || error) && (
        <p
          id={hintId}
          className={`mt-1 text-[10px] leading-[1.4] ${error ? "font-medium text-[#c52c3d]" : "text-[#6c7c98]"}`}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

export function SelectField({
  id,
  label,
  registration,
  children,
  error,
  hint,
  required,
  icon,
}: {
  id: string;
  label: string;
  registration: UseFormRegisterReturn;
  children: ReactNode;
  error?: string;
  hint?: string;
  required?: boolean;
  icon?: ReactNode;
}) {
  const hintId = `${id}-hint`;
  return (
    <div className="min-w-0">
      <label htmlFor={id} className={fieldLabelClass}>
        {label} {required && <RequiredMark />}
      </label>
      <span className="relative block">
        {icon && (
          <span className="pointer-events-none absolute top-1/2 left-2 z-[1] grid size-7 -translate-y-1/2 place-items-center rounded-[7px] bg-[#f0f5ff] text-[#075bff]">
            {icon}
          </span>
        )}
        <select
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={hint || error ? hintId : undefined}
          {...registration}
          className={`${fieldClass} appearance-none pr-9 ${icon ? "pl-11" : "pl-3"} ${error ? "border-[#e65260]" : ""}`}
        >
          {children}
        </select>
        <ChevronDown
          size={15}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[#617391]"
        />
      </span>
      {(hint || error) && (
        <p
          id={hintId}
          className={`mt-1 text-[10px] leading-[1.4] ${error ? "font-medium text-[#c52c3d]" : "text-[#6c7c98]"}`}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

export function SwitchRow({
  id,
  title,
  description,
  registration,
  icon,
  compact = false,
}: {
  id: string;
  title: string;
  description: string;
  registration: UseFormRegisterReturn;
  icon?: ReactNode;
  compact?: boolean;
}) {
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer items-center justify-between gap-4 ${compact ? "py-3" : "mt-5 rounded-[9px] border border-[#e5ebf4] bg-[#fbfcff] px-3.5 py-3"}`}
    >
      <span className="flex min-w-0 items-center gap-3">
        {icon && (
          <span className="grid size-8 shrink-0 place-items-center rounded-[8px] bg-[#eaf2ff] text-[#075bff]">
            {icon}
          </span>
        )}
        <span className="min-w-0">
          <span className="block text-[11px] font-semibold text-[#172b49]">
            {title}
          </span>
          <span className="mt-0.5 block text-[10px] leading-[1.4] text-[#6c7c98]">
            {description}
          </span>
        </span>
      </span>
      <SwitchControl id={id} label={title} registration={registration} />
    </label>
  );
}

export function SwitchControl({
  id,
  label,
  registration,
}: {
  id: string;
  label: string;
  registration: UseFormRegisterReturn;
}) {
  return (
    <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
      <input
        id={id}
        type="checkbox"
        aria-label={label}
        {...registration}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-[#c7d1df] transition peer-checked:bg-[#075bff] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#075bff]"
      />
      <span
        aria-hidden="true"
        className="absolute left-1 size-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5"
      />
    </span>
  );
}

export function RadioOption({
  value,
  checked,
  registration,
  title,
  description,
}: {
  value: string;
  checked: boolean;
  registration: UseFormRegisterReturn;
  title: string;
  description: string;
}) {
  return (
    <label
      className={`flex min-h-[70px] cursor-pointer items-start gap-3 rounded-[9px] border px-3.5 py-3 transition ${checked ? "border-[#83adf3] bg-[#f5f9ff]" : "border-[#e3eaf4] bg-white hover:border-[#c7d8f1]"}`}
    >
      <input
        type="radio"
        value={value}
        {...registration}
        checked={checked}
        className="mt-1 size-4 accent-[#075bff]"
      />
      <span>
        <span className="block text-[11px] font-semibold text-[#1b3152]">
          {title}
        </span>
        <span className="mt-1 block text-[10px] leading-[1.4] text-[#6c7c98]">
          {description}
        </span>
      </span>
    </label>
  );
}

export function ProviderOption({
  selected,
  onSelect,
  icon,
  title,
  description,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`focus-ring flex min-h-[74px] items-start gap-3 rounded-[10px] border px-3.5 py-3 text-left transition ${selected ? "border-[#83adf3] bg-[#f4f8ff]" : "border-[#e3eaf4] bg-white hover:border-[#c7d8f1]"}`}
    >
      <span
        className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-full ${selected ? "bg-[#075bff] text-white" : "bg-[#f0f4fa] text-[#8390a6]"}`}
      >
        {selected ? <Check size={15} /> : icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] font-semibold text-[#1b3152]">
          {title}
        </span>
        <span className="mt-1 block text-[10px] leading-[1.4] text-[#6c7c98]">
          {description}
        </span>
      </span>
    </button>
  );
}

export function VenueTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`relative -mb-px min-h-9 px-2 text-[11px] font-semibold transition ${active ? "border-b-2 border-[#075bff] text-[#075bff]" : "border-b-2 border-transparent text-[#657591] hover:text-[#075bff]"}`}
    >
      {children}
    </button>
  );
}

export function SummaryDetail({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 gap-3">
      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-[8px] bg-[#f0f5ff] text-[#075bff]">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] font-medium text-[#75839c]">
          {label}
        </span>
        <span className="mt-1 block text-[11px] leading-[1.45] font-semibold text-[#243755]">
          {children}
        </span>
      </span>
    </div>
  );
}

export function ToolbarDivider() {
  return (
    <span aria-hidden="true" className="mx-1 h-5 border-l border-[#e2e8f1]" />
  );
}

export function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="focus-ring grid size-7 place-items-center rounded-md transition hover:bg-[#edf3ff] hover:text-[#075bff]"
    >
      {children}
    </button>
  );
}

export function RequiredMark() {
  return (
    <span aria-hidden="true" className="ml-0.5 text-[#e53d4b]">
      *
    </span>
  );
}

export function ErrorText({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="mt-1.5 text-[10px] font-medium text-[#c52c3d]">
      {children}
    </p>
  );
}
