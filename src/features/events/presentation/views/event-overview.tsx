"use client";

import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Radio,
  Ticket,
} from "lucide-react";
import { useEvents } from "../../application/hooks/use-events";
import { evaluateReadiness } from "../../domain/policies/readiness.policy";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { LoadingState } from "@/shared/components/feedback/loading-state";
import {
  EVENT_OVERVIEW_PANEL_CLASS,
  EVENT_OVERVIEW_LIFECYCLE,
  EVENT_OVERVIEW_REQUIREMENTS,
} from "../constants/event-overview.constants";
import {
  EventOverviewEmptyPanel,
  EventOverviewRequirement,
} from "../components/event-overview-sections";
import { formatEventDateTime } from "../lib/event-view.utils";

export function EventOverview({ eventId }: { readonly eventId: string }) {
  const { data, isPending, isError, error, refetch, isFetching } = useEvents();
  if (isPending)
    return <LoadingState label="Loading event overview" rows={5} />;
  if (isError)
    return (
      <ErrorState
        title="Event overview could not be loaded"
        description={error.message || "Check your connection and try again."}
        retry={() => void refetch()}
        isRetrying={isFetching}
      />
    );

  const event = (data ?? []).find((item) => item.id === eventId);
  if (!event)
    return (
      <EmptyState
        title="Event not found"
        description="This event may have been removed. Return to your event list to choose another one."
        action={{ label: "Browse events", href: "/dashboard/events" }}
      />
    );

  const readiness = evaluateReadiness(event.readiness);
  const currentIndex = EVENT_OVERVIEW_LIFECYCLE.findIndex(
    (step) => step.status === event.status,
  );
  const eventDate = formatEventDateTime(event.scheduledAt, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const eventTime = formatEventDateTime(event.scheduledAt, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="min-w-0 space-y-4 pb-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <nav
            aria-label="Breadcrumb"
            className="mb-2 text-[11px] text-[#687693]"
          >
            <Link href="/dashboard" className="text-[#075bff] hover:underline">
              Overview
            </Link>
            <span className="mx-2" aria-hidden="true">
              ›
            </span>
            <span>Event Details</span>
          </nav>
          <h1 className="text-[26px] leading-tight font-bold tracking-[-.04em] break-words text-[#0b1538] sm:text-[34px]">
            {event.title}
          </h1>
          <p className="mt-1 max-w-3xl text-[12px] leading-relaxed text-[#61708e] sm:text-[13px]">
            {event.description || "No event description has been added yet."}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-[#53627e]">
            <span className="inline-flex items-center gap-2">
              <CalendarDays size={16} aria-hidden="true" /> {eventDate}
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock3 size={16} aria-hidden="true" /> {eventTime} (WAT)
            </span>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href={`/events/${encodeURIComponent(event.id)}`}
            className="focus-ring inline-flex h-10 items-center gap-2 rounded-xl border border-[#dce5f2] bg-white px-3.5 text-[11px] font-semibold text-[#075bff] hover:bg-[#f7faff]"
          >
            View Event Page <ExternalLink size={14} aria-hidden="true" />
          </Link>
        </div>
      </header>

      <section className="overflow-hidden rounded-[14px] border border-[#d9e8ff] bg-[radial-gradient(ellipse_at_80%_5%,rgba(0,196,220,.32),transparent_45%),linear-gradient(115deg,#061837,#0a48a7_65%,#087fbc)] p-5 text-white shadow-[0_10px_28px_rgba(10,53,113,.14)] sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="min-w-0">
            <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white/85">
              {event.status.replaceAll("_", " ")}
            </span>
            <h2 className="mt-3 max-w-3xl text-[24px] leading-tight font-bold tracking-[-.04em] break-words sm:text-[32px]">
              {event.title}
            </h2>
            <p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-white/80">
              {event.description ||
                "Add a description to introduce this event to attendees."}
            </p>
          </div>
          <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-[11px] backdrop-blur-sm">
            <span className="block text-white/70">Scheduled for</span>
            <strong className="mt-1 block text-[13px] font-semibold">
              {eventDate}
            </strong>
            <span className="block text-white/80">{eventTime} (WAT)</span>
          </div>
        </div>
      </section>

      <section
        className={`${EVENT_OVERVIEW_PANEL_CLASS} !p-4 sm:!p-5`}
        aria-labelledby="lifecycle-title"
      >
        <h2
          id="lifecycle-title"
          className="text-[15px] font-bold text-[#101b43]"
        >
          Event lifecycle
        </h2>
        <p className="mt-1 text-[11px] text-[#687693]">
          Current event status from the event service.
        </p>
        <ol className="relative mt-5 grid grid-cols-3 gap-x-2 gap-y-4 sm:grid-cols-6">
          <div
            className="absolute top-3 right-[8%] left-[8%] hidden h-0.5 bg-[#e0e7f1] sm:block"
            aria-hidden="true"
          />
          {EVENT_OVERVIEW_LIFECYCLE.map((step, index) => {
            const completed = currentIndex > index;
            const current = currentIndex === index;
            return (
              <li
                key={step.status}
                aria-current={current ? "step" : undefined}
                className="relative flex min-w-0 flex-col items-center text-center"
              >
                <span
                  className={`z-[1] grid size-6 place-items-center rounded-full border-2 ${completed ? "border-[#00b879] bg-[#00b879] text-white" : current ? "border-[#0865ff] bg-white text-[#0865ff] ring-4 ring-[#e9f2ff]" : "border-[#cbd6e5] bg-white text-transparent"}`}
                >
                  {completed ? (
                    <CheckCircle2 size={15} aria-hidden="true" />
                  ) : (
                    <span className="size-1.5 rounded-full bg-current" />
                  )}
                </span>
                <span
                  className={`mt-2 text-[10px] font-semibold ${current ? "text-[#075bff]" : "text-[#253454]"}`}
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,.8fr)]">
        <div className="min-w-0 space-y-4">
          <section className={EVENT_OVERVIEW_PANEL_CLASS}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-[15px] font-bold text-[#101b43]">
                  Event readiness
                </h2>
                <p className="mt-1 text-[11px] text-[#687693]">
                  Requirements currently recorded for this event.
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${readiness.ready ? "bg-[#e6faf2] text-[#07855e]" : "bg-[#fff0f1] text-[#c92d3a]"}`}
              >
                {readiness.ready ? "Ready" : "Needs attention"}
              </span>
            </div>
            <ul className="mt-3 space-y-2">
              {EVENT_OVERVIEW_REQUIREMENTS.map(({ key, title, hrefSuffix }) => (
                <EventOverviewRequirement
                  key={key}
                  title={title}
                  href={`/dashboard/events/${event.id}/${hrefSuffix}`}
                  done={event.readiness[key]}
                />
              ))}
            </ul>
          </section>
          <EventOverviewEmptyPanel
            title="Recent activity"
            description="An event activity feed will appear here when activity records are connected."
            icon={<Clock3 size={20} />}
          />
        </div>
        <aside className="min-w-0 space-y-4">
          <EventOverviewEmptyPanel
            title="Ticket sales & revenue"
            description="Sales totals and revenue trends will appear when ticketing data is available."
            icon={<Ticket size={20} />}
          />
          <EventOverviewEmptyPanel
            title="Live audience & stream health"
            description="Audience counts and stream telemetry will appear after a live analytics source is connected."
            icon={<Radio size={20} />}
          />
        </aside>
      </div>
    </div>
  );
}
