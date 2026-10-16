import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import type { ReactNode } from "react";

type EmptyStateAction = {
  readonly label: string;
  readonly href: string;
};

type EmptyStateProps = {
  readonly title: string;
  readonly description: string;
  readonly icon?: ReactNode;
  readonly action?: EmptyStateAction;
  readonly secondaryAction?: EmptyStateAction;
  readonly size?: "compact" | "default";
  readonly className?: string;
};

export function EmptyState({
  title,
  description,
  icon,
  action,
  secondaryAction,
  size = "default",
  className = "",
}: EmptyStateProps) {
  const compact = size === "compact";

  return (
    <section
      role="group"
      aria-label={`${title}. ${description}`}
      className={`flex min-w-0 flex-col items-center justify-center rounded-2xl border border-dashed border-[#d7e3f3] bg-[radial-gradient(ellipse_at_top,rgba(229,240,255,.72),transparent_72%)] px-5 text-center ${compact ? "min-h-40 py-6" : "min-h-64 py-10 sm:px-8"} ${className}`}
    >
      <span
        aria-hidden="true"
        className={`grid shrink-0 place-items-center rounded-2xl border border-[#dce9fb] bg-white text-[#075bff] shadow-[0_6px_18px_rgba(7,91,255,.08)] ${compact ? "size-11" : "size-14"}`}
      >
        {icon ?? <CalendarDays size={compact ? 21 : 25} strokeWidth={1.8} />}
      </span>
      <div className="mt-4 max-w-[36rem]">
        <h2
          className={`font-semibold tracking-[-.025em] text-[#101b43] ${compact ? "text-sm" : "text-base sm:text-lg"}`}
        >
          {title}
        </h2>
        <p
          className={`mx-auto mt-1.5 max-w-[48ch] leading-relaxed text-[#61708e] ${compact ? "text-xs" : "text-sm"}`}
        >
          {description}
        </p>
      </div>
      {(action || secondaryAction) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {action && (
            <Link
              href={action.href}
              className="focus-ring brand-gradient inline-flex min-h-10 items-center justify-center gap-2 rounded-[9px] px-4 text-xs font-semibold text-white shadow-[0_5px_14px_rgba(7,91,255,.16)] transition hover:brightness-105"
            >
              {action.label}
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          )}
          {secondaryAction && (
            <Link
              href={secondaryAction.href}
              className="focus-ring inline-flex min-h-10 items-center justify-center rounded-[9px] border border-[#dce5f2] bg-white px-4 text-xs font-semibold text-[#075bff] transition hover:bg-[#f6faff]"
            >
              {secondaryAction.label}
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
