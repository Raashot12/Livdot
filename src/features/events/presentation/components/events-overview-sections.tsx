import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3, MoreHorizontal } from "lucide-react";
import type { EventEntity } from "../../domain/entities/event.entity";
import { countCompletedReadiness } from "../lib/events-overview.utils";
import { formatEventDateTime } from "../lib/event-view.utils";
import { eventStatusPresentation } from "@/shared/components/feedback/event-status";

export function EventsOverviewStatCard({
  icon: Icon,
  label,
  value,
  tone,
  detail,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: number;
  tone: string;
  detail?: string;
}) {
  return (
    <article className="flex min-w-0 items-center gap-3 rounded-[13px] border border-[#e5ebf4] bg-white px-3.5 py-3 shadow-[0_3px_12px_rgba(18,44,78,.025)] sm:px-4">
      <span
        className={`grid size-11 shrink-0 place-items-center rounded-[12px] ${tone}`}
      >
        <Icon size={21} strokeWidth={2.2} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[21px] leading-none font-bold tracking-[-.035em] text-[#0b1538] tabular-nums">
          {value}
        </p>
        <p className="mt-1.5 truncate text-[11px] font-medium text-[#687693]">
          {label}
        </p>
      </div>
      {detail && (
        <span className="ml-auto hidden shrink-0 items-center gap-1 text-[10px] font-semibold text-[#09a871] xl:flex">
          <ArrowRight size={13} aria-hidden="true" /> {detail}
        </span>
      )}
    </article>
  );
}

export function EventsOverviewRow({ event }: { event: EventEntity }) {
  const status = eventStatusPresentation[event.status];
  const readiness = countCompletedReadiness(event);
  const readinessPercent = Math.round((readiness / 3) * 100);
  const date = formatEventDateTime(
    event.scheduledAt,
    { month: "short", day: "numeric", year: "numeric" },
    "TBD",
  );
  const time = formatEventDateTime(
    event.scheduledAt,
    { hour: "numeric", minute: "2-digit", hour12: true },
    "Time to be set",
  );

  return (
    <tr className="group border-t border-[#edf1f6] text-[12px] transition-colors hover:bg-[#f9fbff]">
      <td className="w-10 px-3 py-3.5">
        <input
          type="checkbox"
          aria-label={`Select ${event.title}`}
          className="size-[17px] rounded-[5px] border-[#cbd5e3] accent-[#075bff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075bff]"
        />
      </td>
      <th
        scope="row"
        className="min-w-[250px] px-2 py-3.5 text-left font-normal"
      >
        <Link
          href={`/dashboard/events/${event.id}`}
          className="focus-ring flex w-fit max-w-full items-center gap-3 rounded-md"
        >
          <span className="grid size-[58px] shrink-0 place-items-center rounded-[9px] bg-[#edf4ff] text-[#075bff]">
            <CalendarDays size={23} aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <strong className="block truncate text-[12px] font-semibold tracking-[-.015em] text-[#0b1538]">
              {event.title}
            </strong>
            <span className="mt-1 block max-w-[210px] truncate text-[10px] text-[#687693]">
              {event.description || "No description added"}
            </span>
          </span>
        </Link>
      </th>
      <td className="px-2 py-3.5 whitespace-nowrap">
        <span
          className={`inline-flex items-center gap-1.5 rounded-[7px] px-2.5 py-1.5 text-[10px] font-semibold ${status.className}`}
        >
          <span
            className="size-1.5 rounded-full bg-current"
            aria-hidden="true"
          />
          {status.label}
        </span>
      </td>
      <td className="min-w-[132px] px-2 py-3.5">
        <span className="flex items-center gap-2 font-medium text-[#172747]">
          <CalendarDays
            size={15}
            className="shrink-0 text-[#637493]"
            aria-hidden="true"
          />
          {date}
        </span>
        <span className="mt-1.5 flex items-center gap-2 text-[10px] text-[#687693]">
          <Clock3
            size={15}
            className="shrink-0 text-[#7a89a3]"
            aria-hidden="true"
          />
          {time} (WAT)
        </span>
      </td>
      <td className="min-w-[150px] px-2 py-3.5">
        <div className="flex items-center gap-2 text-[10px] text-[#53627e]">
          <span>{readiness} of 3 complete</span>
          <strong className="ml-auto tabular-nums">{readinessPercent}%</strong>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#e9edf4]">
          <span
            className="block h-full rounded-full bg-gradient-to-r from-[#0764ff] to-[#09b6e2]"
            style={{ width: `${readinessPercent}%` }}
          />
        </div>
      </td>
      <td className="px-3 py-3.5">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/dashboard/events/${event.id}`}
            className="focus-ring inline-flex h-10 min-w-[70px] items-center justify-center rounded-[9px] border border-[#e2e9f3] bg-white px-3 text-[11px] font-semibold text-[#075bff] transition hover:border-[#b9d0f5] hover:bg-[#f6faff]"
          >
            {event.status === "DRAFT" ? "Edit" : "View"}
          </Link>
          <details className="group relative">
            <summary
              aria-label={`More actions for ${event.title}`}
              className="focus-ring grid size-10 cursor-pointer list-none place-items-center rounded-[9px] border border-[#e2e9f3] bg-white text-[#405477] hover:bg-[#f5f8fd] [&::-webkit-details-marker]:hidden"
            >
              <MoreHorizontal size={18} aria-hidden="true" />
            </summary>
            <div className="absolute top-11 right-0 z-20 w-40 rounded-xl border border-[#e1e8f2] bg-white p-1.5 shadow-[0_12px_32px_rgba(11,21,56,.14)]">
              <Link
                href={`/events/${encodeURIComponent(event.id)}`}
                className="block rounded-lg px-3 py-2 text-[11px] font-medium text-[#243454] hover:bg-[#f4f7fc]"
              >
                View event page
              </Link>
              <Link
                href={`/dashboard/events/${event.id}/tickets`}
                className="block rounded-lg px-3 py-2 text-[11px] font-medium text-[#243454] hover:bg-[#f4f7fc]"
              >
                Manage tickets
              </Link>
            </div>
          </details>
        </div>
      </td>
    </tr>
  );
}
