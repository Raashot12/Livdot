import Link from "next/link";
import type { EventEntity } from "../../../domain/entities/event.entity";
import { eventStatusPresentation } from "@/shared/components/feedback/event-status";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { DASHBOARD_PANEL_CLASS } from "../../constants/dashboard-overview.constants";
import {
  formatDashboardDate,
  getEventReadinessCompletionCount,
} from "../../lib/dashboard-overview.utils";
import { CardHeading } from "./dashboard-overview-cards";

export function RecentEvents({ events }: { events: readonly EventEntity[] }) {
  return (
    <section className={`${DASHBOARD_PANEL_CLASS} overflow-hidden`}>
      <div className="px-4 pt-4 pb-2">
        <CardHeading title="Recent Events" href="/dashboard/events" />
      </div>
      {events.length ? (
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full min-w-[560px] text-left">
            <thead className="bg-[#f8faff] text-[10px] font-medium text-[#61708e]">
              <tr>
                <th scope="col" className="px-3 py-2">
                  Event
                </th>
                <th scope="col" className="px-3 py-2">
                  Date
                </th>
                <th scope="col" className="px-3 py-2">
                  Status
                </th>
                <th scope="col" className="px-3 py-2">
                  Readiness
                </th>
                <th scope="col" className="px-3 py-2">
                  <span className="sr-only">Action</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {events.slice(0, 5).map((event) => {
                const status = eventStatusPresentation[event.status];
                const complete = getEventReadinessCompletionCount(event);
                return (
                  <tr
                    key={event.id}
                    className="border-t border-[#edf1f6] text-[10px] text-[#53627e] hover:bg-[#fbfcff]"
                  >
                    <th
                      scope="row"
                      className="px-3 py-3 font-semibold text-[#101b43]"
                    >
                      <Link
                        href={`/dashboard/events/${event.id}`}
                        className="focus-ring rounded"
                      >
                        {event.title}
                      </Link>
                    </th>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {formatDashboardDate(event.scheduledAt, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`rounded-md px-2 py-1 text-[9px] font-semibold ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-3 py-3 tabular-nums">
                      {complete} of 3 requirements
                    </td>
                    <td className="px-3 py-3">
                      <Link
                        href={`/dashboard/events/${event.id}`}
                        className="focus-ring rounded-md border border-[#e5ebf4] px-2.5 py-1.5 font-semibold text-[#075bff]"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
      {events.length ? (
        <div className="divide-y divide-[#edf1f6] sm:hidden">
          {events.slice(0, 5).map((event) => {
            const status = eventStatusPresentation[event.status];
            const complete = getEventReadinessCompletionCount(event);
            return (
              <article
                key={event.id}
                className="flex items-center gap-3 px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="text-[11px] font-semibold break-words text-[#101b43]">
                    {event.title}
                  </h3>
                  <p className="mt-1 text-[10px] text-[#61708e]">
                    {formatDashboardDate(event.scheduledAt, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-md px-2 py-1 text-[9px] font-semibold ${status.className}`}
                    >
                      {status.label}
                    </span>
                    <span className="text-[9px] text-[#687693]">
                      {complete} of 3 requirements
                    </span>
                  </div>
                </div>
                <Link
                  href={`/dashboard/events/${event.id}`}
                  className="focus-ring shrink-0 rounded-md border border-[#e5ebf4] px-2.5 py-1.5 text-[10px] font-semibold text-[#075bff]"
                >
                  View
                </Link>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="p-3">
          <EmptyState
            size="compact"
            title="No recent events"
            description="Your events will show here once created."
            action={{ label: "Create event", href: "/dashboard/events/new" }}
          />
        </div>
      )}
    </section>
  );
}
