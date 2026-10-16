import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, CheckCircle2, CircleAlert } from "lucide-react";
import { EVENT_OVERVIEW_PANEL_CLASS } from "../constants/event-overview.constants";
import { EmptyState } from "@/shared/components/feedback/empty-state";

export function EventOverviewRequirement({
  title,
  done,
  href,
}: {
  title: string;
  done: boolean;
  href: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className={
          "focus-ring flex min-h-14 items-center gap-3 rounded-xl border border-[#edf1f6] px-3 py-2.5 transition hover:border-[#cbd9ee] hover:bg-[#fbfdff]"
        }
      >
        <span
          className={
            "grid size-9 shrink-0 place-items-center rounded-lg " +
            (done
              ? "bg-[#e7f9f1] text-[#08a973]"
              : "bg-[#fff3e0] text-[#dd8900]")
          }
        >
          {done ? (
            <CheckCircle2 size={18} aria-hidden="true" />
          ) : (
            <CircleAlert size={18} aria-hidden="true" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <strong className="block truncate text-[12px] font-semibold text-[#172544]">
            {title}
          </strong>
          <span
            className={
              "mt-0.5 block text-[10px] " +
              (done ? "text-[#07855e]" : "text-[#8a6a2c]")
            }
          >
            {done ? "Configured" : "Needs attention"}
          </span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold text-[#075bff]">
          View <ArrowRight size={13} aria-hidden="true" />
        </span>
      </Link>
    </li>
  );
}

export function EventOverviewEmptyPanel({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <section className={EVENT_OVERVIEW_PANEL_CLASS}>
      <h2 className="text-[15px] font-bold tracking-[-.025em] text-[#101b43]">
        {title}
      </h2>
      <EmptyState
        size="compact"
        icon={icon}
        title="Waiting for connected data"
        description={description}
      />
    </section>
  );
}
