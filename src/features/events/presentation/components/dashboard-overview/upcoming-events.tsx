import Link from "next/link";
import type { EventEntity } from "../../../domain/entities/event.entity";
import { eventStatusPresentation } from "@/shared/components/feedback/event-status";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { DASHBOARD_PANEL_CLASS } from "../../constants/dashboard-overview.constants";
import {
  formatDashboardDate,
  formatDashboardEventTime,
  getUpcomingDashboardEvents,
} from "../../lib/dashboard-overview.utils";
import { CardHeading } from "./dashboard-overview-cards";

export function UpcomingEvents({ events }: { events: readonly EventEntity[] }) {
  const upcoming = getUpcomingDashboardEvents(events);

  return (
    <section className={`${DASHBOARD_PANEL_CLASS} p-4`}>
      <CardHeading title="Upcoming Events" href="/dashboard/events" />
      {upcoming.length ? (
        <ul className="mt-2 divide-y divide-[#edf1f6]">
          {upcoming.map((event) => {
            const status = eventStatusPresentation[event.status];
            return (
              <li key={event.id}>
                <Link
                  href={`/dashboard/events/${event.id}`}
                  className="focus-ring flex min-w-0 items-center gap-3 rounded-md py-3 hover:bg-[#f8faff]"
                >
                  <span className="grid h-12 w-11 shrink-0 content-center rounded-lg bg-[#f4f7fc] text-center">
                    <span className="text-[9px] font-semibold text-[#687693]">
                      {formatDashboardDate(event.scheduledAt, {
                        month: "short",
                      })}
                    </span>
                    <strong className="text-[17px] leading-tight text-[#101b43]">
                      {formatDashboardDate(event.scheduledAt, {
                        day: "numeric",
                      })}
                    </strong>
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-[11px] font-semibold text-[#101b43]">
                      {event.title}
                    </strong>
                    <span className="mt-1 block truncate text-[10px] text-[#687693]">
                      {formatDashboardEventTime(event)} · Lagos time
                    </span>
                  </span>
                  <span
                    className={`shrink-0 rounded-md px-2 py-1 text-[9px] font-semibold ${status.className}`}
                  >
                    {status.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState
          size="compact"
          title="Nothing scheduled next"
          description="Upcoming events will appear here after they have a future date."
        />
      )}
    </section>
  );
}
