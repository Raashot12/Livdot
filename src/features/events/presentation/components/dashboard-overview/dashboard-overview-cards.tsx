import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { DASHBOARD_PANEL_CLASS } from "../../constants/dashboard-overview.constants";

export function CardHeading({ title, href }: { title: string; href?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-[15px] font-bold tracking-[-.035em] text-[#101b43]">
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="focus-ring inline-flex shrink-0 items-center gap-1 rounded text-[11px] font-semibold text-[#075bff] hover:text-[#0046d5]"
        >
          View all <ArrowRight size={13} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: number | string;
  tone: string;
}) {
  return (
    <article
      className={`${DASHBOARD_PANEL_CLASS} flex items-center gap-3 px-3 py-3.5 sm:gap-4 sm:px-4`}
    >
      <span
        className={`grid size-12 shrink-0 place-items-center rounded-[12px] sm:size-[58px] ${tone}`}
      >
        <Icon size={23} strokeWidth={2.3} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-medium text-[#667694]">
          {label}
        </p>
        <p className="mt-1 truncate text-[20px] leading-none font-bold tracking-[-.04em] text-[#101b43] tabular-nums sm:text-[22px]">
          {value}
        </p>
      </div>
    </article>
  );
}
