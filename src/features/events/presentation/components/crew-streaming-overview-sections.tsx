"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Circle,
  Radio,
  Settings,
  Ticket,
  Users,
  Video,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { EventEntity } from "../../domain/entities/event.entity";
import type { EventStatus } from "../../domain/types/event-status";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { eventStatusPresentation } from "@/shared/components/feedback/event-status";
import {
  CREW_MODULE_STARTED_AT,
  panel,
} from "../constants/crew-streaming-overview.constants";
import {
  crewHref,
  dateLabel,
  eventHref,
  hasReplay,
  needsSetup,
  primaryAction,
  timeLabel,
} from "../lib/crew-streaming-overview.utils";
export function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <article
      className={`${panel} flex min-w-0 items-center gap-3 px-3.5 py-3.5 sm:px-4`}
    >
      <span
        className={`grid size-14 shrink-0 place-items-center rounded-[11px] ${tone}`}
      >
        <Icon size={25} strokeWidth={2.2} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-medium text-[#596988]">
          {label}
        </p>
        <strong className="mt-1 block text-[23px] leading-none font-bold tracking-[-.035em] text-[#0b1538] tabular-nums">
          {value.toLocaleString("en-NG")}
        </strong>
        <p className="mt-1 text-[10px] text-[#687693]">Current event data</p>
      </div>
    </article>
  );
}
export function StatusBadge({ status }: { status: EventStatus }) {
  const presentation = eventStatusPresentation[status];
  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 rounded-[7px] px-2.5 py-1.5 text-[10px] font-semibold whitespace-nowrap ${presentation.className}`}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {presentation.label}
    </span>
  );
}

export function CrewPills({ event }: { event: EventEntity }) {
  const assigned = event.readiness.crewAssigned;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[9px] font-medium ${assigned ? "bg-[#e5fbf3] text-[#07855e]" : "bg-[#fff4e3] text-[#ad6a00]"}`}
    >
      <Circle
        size={9}
        className={assigned ? "fill-current" : ""}
        aria-hidden="true"
      />
      {assigned ? "Assigned" : "Needs assignment"}
    </span>
  );
}
export function EventRow({ event }: { event: EventEntity }) {
  const action = primaryAction(event);
  const streamConfigured = event.readiness.ingestConfigured;
  const streamLabel = streamConfigured ? "Configured" : "Not configured";

  return (
    <tr className="border-t border-[#edf1f6] text-[11px] transition-colors hover:bg-[#f9fbff]">
      <td className="px-2 py-3">
        <Link
          href={eventHref(event)}
          className="focus-ring flex min-w-0 items-center gap-3 rounded-md"
        >
          <span className="grid size-[58px] shrink-0 place-items-center rounded-[8px] bg-[#edf4ff] text-[#075bff]">
            <Video size={22} aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <strong className="block truncate text-[11px] font-semibold tracking-[-.015em] text-[#0b1538]">
              {event.title}
            </strong>
            <span className="mt-1 block max-w-[180px] truncate text-[9px] text-[#687693]">
              {event.description || "No description added"}
            </span>
          </span>
        </Link>
      </td>
      <td className="min-w-[114px] px-2 py-3 text-[10px] leading-relaxed text-[#596988]">
        <span className="block whitespace-nowrap">
          {dateLabel(event.scheduledAt)}
        </span>
        <span className="block whitespace-nowrap">
          {timeLabel(event.scheduledAt)}
        </span>
      </td>
      <td className="px-2 py-3">
        <CrewPills event={event} />
      </td>
      <td className="px-2 py-3">
        <div className="flex items-start gap-1.5">
          <Circle
            size={9}
            className={`mt-1 shrink-0 ${streamConfigured ? "fill-[#09b777] text-[#09b777]" : "fill-[#ff9f0a] text-[#ff9f0a]"}`}
            aria-hidden="true"
          />
          <span>
            <strong
              className={`block text-[10px] font-medium whitespace-nowrap ${streamConfigured ? "text-[#243454]" : "text-[#d47c00]"}`}
            >
              {streamLabel}
            </strong>
            <span className="mt-0.5 block text-[9px] text-[#7b89a3]">
              {streamConfigured ? "Ingest is configured" : "Ingest needs setup"}
            </span>
          </span>
        </div>
      </td>
      <td className="px-2 py-3">
        <StatusBadge status={event.status} />
        {needsSetup(event) && (
          <span className="mt-1 block text-center text-[9px] text-[#7b89a3]">
            Setup needed
          </span>
        )}
      </td>
      <td className="px-2 py-3">
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={action.href}
            className="focus-ring inline-flex min-h-9 min-w-[96px] items-center justify-center rounded-lg border border-[#e1e8f2] bg-white px-3 text-[10px] font-semibold whitespace-nowrap text-[#075bff] transition hover:bg-[#f5f8ff]"
          >
            {action.label}
          </Link>
          <details className="relative">
            <summary
              aria-label={`More actions for ${event.title}`}
              className="focus-ring grid size-9 cursor-pointer list-none place-items-center rounded-lg border border-[#e1e8f2] text-[#536380] hover:bg-[#f5f8ff]"
            >
              •••
            </summary>
            <div className="absolute right-0 z-20 mt-1 w-40 rounded-lg border border-[#e5ebf4] bg-white p-1 shadow-lg">
              <Link
                href={crewHref(event)}
                className="block rounded-md px-3 py-2 text-[10px] font-medium text-[#243454] hover:bg-[#f4f7fc]"
              >
                Open crew overview
              </Link>
              <Link
                href={crewHref(event, "streaming")}
                className="block rounded-md px-3 py-2 text-[10px] font-medium text-[#243454] hover:bg-[#f4f7fc]"
              >
                Configure streaming
              </Link>
              {hasReplay(event) && (
                <Link
                  href={`/dashboard/events/${event.id}/replay`}
                  className="block rounded-md px-3 py-2 text-[10px] font-medium text-[#243454] hover:bg-[#f4f7fc]"
                >
                  Manage replay
                </Link>
              )}
            </div>
          </details>
        </div>
      </td>
    </tr>
  );
}
export function ReadinessPanel({ events }: { events: readonly EventEntity[] }) {
  const rows = [
    {
      icon: Users,
      key: "crewAssigned",
      label: "Crew Assigned",
      color: "#09b779",
      tone: "bg-[#e7faf2] text-[#09a871]",
    },
    {
      icon: Radio,
      key: "ingestConfigured",
      label: "Streaming Configured",
      color: "#087cf6",
      tone: "bg-[#eaf2ff] text-[#075bff]",
    },
    {
      icon: Ticket,
      key: "ticketPricingConfigured",
      label: "Ticket Pricing Configured",
      color: "#8a45ee",
      tone: "bg-[#f2eaff] text-[#8038e6]",
    },
  ] as const;
  return (
    <section
      className={`${panel} p-3.5`}
      aria-labelledby="production-readiness-title"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2
          id="production-readiness-title"
          className="text-[15px] font-bold tracking-[-.025em] text-[#0b1538]"
        >
          Production Readiness
        </h2>
        <Link
          href="/dashboard/readiness"
          className="focus-ring inline-flex items-center gap-1 text-[10px] font-semibold whitespace-nowrap text-[#075bff]"
        >
          View All <ArrowRight size={13} aria-hidden="true" />
        </Link>
      </div>
      {events.length ? (
        <div className="divide-y divide-[#edf1f6]">
          {rows.map((row) => {
            const Icon = row.icon;
            const count = events.filter(
              (event) => event.readiness[row.key],
            ).length;
            const percentage = Math.round((count / events.length) * 100);
            return (
              <div key={row.label} className="flex items-center gap-2.5 py-2">
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-[9px] ${row.tone}`}
                >
                  <Icon size={20} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <strong className="truncate text-[10px] font-semibold text-[#172544]">
                      {row.label}
                    </strong>
                    <span className="shrink-0 text-[9px] text-[#62728f]">
                      {count} of {events.length}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#e9edf4]">
                      <span
                        className="block h-full rounded-full"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: row.color,
                        }}
                      />
                    </span>
                    <span className="text-[9px] font-medium text-[#536380] tabular-nums">
                      {percentage}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          size="compact"
          title="No readiness data"
          description="Readiness checks will appear after an event is created."
        />
      )}
    </section>
  );
}
export function UpcomingPanel({ events }: { events: readonly EventEntity[] }) {
  const upcoming = events
    .filter(
      (event) =>
        event.status === "LIVE" ||
        ((event.status === "READY" || event.status === "SCHEDULED") &&
          event.scheduledAt &&
          new Date(event.scheduledAt).getTime() >= CREW_MODULE_STARTED_AT),
    )
    .sort(
      (a, b) =>
        new Date(a.scheduledAt ?? 0).getTime() -
        new Date(b.scheduledAt ?? 0).getTime(),
    )
    .slice(0, 3);
  return (
    <section
      className={`${panel} p-3.5`}
      aria-labelledby="upcoming-broadcasts-title"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2
          id="upcoming-broadcasts-title"
          className="text-[15px] font-bold tracking-[-.025em] text-[#0b1538]"
        >
          Upcoming Broadcasts
        </h2>
        <Link
          href="/dashboard/events"
          className="focus-ring inline-flex items-center gap-1 text-[10px] font-semibold whitespace-nowrap text-[#075bff]"
        >
          View All <ArrowRight size={13} aria-hidden="true" />
        </Link>
      </div>
      {upcoming.length ? (
        <div className="divide-y divide-[#edf1f6]">
          {upcoming.map((event) => (
            <Link
              key={event.id}
              href={eventHref(event)}
              className="focus-ring flex items-center gap-2.5 py-2.5"
            >
              <span className="w-9 shrink-0 rounded-md bg-[#f4f7fc] py-1 text-center text-[8px] font-semibold text-[#61718e] uppercase">
                {event.scheduledAt
                  ? new Intl.DateTimeFormat("en-NG", {
                      month: "short",
                      timeZone: "Africa/Lagos",
                    }).format(new Date(event.scheduledAt))
                  : "TBD"}
                <strong className="block text-[16px] leading-tight text-[#0b1538]">
                  {event.scheduledAt
                    ? new Intl.DateTimeFormat("en-NG", {
                        day: "2-digit",
                        timeZone: "Africa/Lagos",
                      }).format(new Date(event.scheduledAt))
                    : "—"}
                </strong>
              </span>
              <span className="grid size-[46px] shrink-0 place-items-center rounded-[7px] bg-[#edf4ff] text-[#075bff]">
                <Video size={18} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <strong className="block truncate text-[10px] font-semibold text-[#172544]">
                  {event.title}
                </strong>
                <span className="mt-0.5 block truncate text-[9px] text-[#687693]">
                  {timeLabel(event.scheduledAt)}
                </span>
              </span>
              <StatusBadge status={event.status} />
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          size="compact"
          title="No broadcasts scheduled"
          description="Live and upcoming events will appear here."
        />
      )}
    </section>
  );
}
export function QuickActions({ events }: { events: readonly EventEntity[] }) {
  const focusEvent =
    events.find((event) => event.status === "LIVE") ?? events[0];
  if (!focusEvent) {
    return (
      <section
        className={`${panel} p-3.5`}
        aria-labelledby="crew-quick-actions-title"
      >
        <h2
          id="crew-quick-actions-title"
          className="mb-2.5 text-[15px] font-bold tracking-[-.025em] text-[#0b1538]"
        >
          Quick Actions
        </h2>
        <EmptyState
          size="compact"
          title="Create an event first"
          description="Crew and stream actions become available once an event exists."
          action={{ label: "Create event", href: "/dashboard/events/new" }}
        />
      </section>
    );
  }
  const actions = [
    {
      label: "Manage Crew",
      detail: "Assign roles & permissions",
      icon: Users,
      href: focusEvent ? crewHref(focusEvent) : "/dashboard/crew",
      tone: "text-[#075bff]",
    },
    {
      label: "Configure Streaming",
      detail: "Set up ingest & playback",
      icon: Radio,
      href: focusEvent ? crewHref(focusEvent, "streaming") : "/dashboard/crew",
      tone: "text-[#075bff]",
    },
    {
      label: "Run Stream Test",
      detail: "Check stream health",
      icon: Settings,
      href: focusEvent ? crewHref(focusEvent, "streaming") : "/dashboard/crew",
      tone: "text-[#075bff]",
    },
    {
      label: "View Incident Logs",
      detail: "Recent alerts & issues",
      icon: Activity,
      href: focusEvent ? crewHref(focusEvent, "incidents") : "/dashboard/crew",
      tone: "text-[#075bff]",
    },
  ];
  return (
    <section
      className={`${panel} p-3.5`}
      aria-labelledby="crew-quick-actions-title"
    >
      <h2
        id="crew-quick-actions-title"
        className="mb-2.5 text-[15px] font-bold tracking-[-.025em] text-[#0b1538]"
      >
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className="focus-ring flex min-h-[55px] min-w-0 items-center gap-2 rounded-lg border border-[#e5ebf4] px-2.5 py-2 transition hover:border-[#b9d2ff] hover:bg-[#f8faff]"
            >
              <span
                className={`grid size-8 shrink-0 place-items-center rounded-lg bg-[#edf4ff] ${action.tone}`}
              >
                <Icon
                  size={17}
                  fill={action.icon === Users ? "currentColor" : "none"}
                  aria-hidden="true"
                />
              </span>
              <span className="min-w-0">
                <strong className="block truncate text-[9px] font-semibold text-[#172544]">
                  {action.label}
                </strong>
                <span className="mt-0.5 block truncate text-[8px] text-[#687693]">
                  {action.detail}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
