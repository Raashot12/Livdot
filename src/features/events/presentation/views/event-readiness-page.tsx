"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CalendarDays, ChevronRight } from "lucide-react";
import { useEvents } from "../../application/hooks/use-events";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { LoadingState } from "@/shared/components/feedback/loading-state";
import { EVENT_READINESS_PANEL_CLASS } from "../constants/event-readiness.constants";
import {
  EventReadinessCard,
  EventReadinessLifecycle,
  EventReadinessTransitionCard,
} from "../components/event-readiness-sections";
import { formatEventDateTime } from "../lib/event-view.utils";

export function EventReadinessPage({ eventId }: { readonly eventId: string }) {
  const {
    data: events,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useEvents();
  const event = useMemo(
    () => events?.find((item) => item.id === eventId),
    [events, eventId],
  );
  if (isPending)
    return <LoadingState label="Loading event readiness" rows={5} />;
  if (isError)
    return (
      <ErrorState
        title="Readiness page could not be loaded"
        description={error.message || "Check your connection, then try again."}
        retry={() => void refetch()}
        isRetrying={isFetching}
      />
    );
  if (!event)
    return (
      <EmptyState
        title="Event not found"
        description="This event may have been removed. Return to the event list to choose another one."
        action={{ label: "Browse events", href: "/dashboard/events" }}
      />
    );

  return (
    <div className="min-w-0 space-y-3.5 pb-5">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-2 text-[11px] text-[#687693]"
      >
        <Link
          href="/dashboard/readiness"
          className="text-[#075bff] hover:underline"
        >
          Readiness
        </Link>
        <ChevronRight size={13} aria-hidden="true" />
        <Link
          href={`/dashboard/events/${event.id}`}
          className="max-w-[220px] truncate hover:text-[#075bff]"
        >
          {event.title}
        </Link>
        <ChevronRight size={13} aria-hidden="true" />
        <span aria-current="page" className="font-medium text-[#52627f]">
          Readiness &amp; Preflight
        </span>
      </nav>
      <header>
        <h1 className="text-[28px] leading-tight font-bold tracking-[-.05em] text-[#101b43] sm:text-[32px]">
          Readiness &amp; Preflight
        </h1>
        <p className="mt-1 text-[12px] text-[#667593]">
          Review the setup requirements recorded for {event.title}.
        </p>
      </header>
      <div className="grid min-w-0 items-start gap-3.5 xl:grid-cols-[minmax(0,1.8fr)_minmax(300px,.8fr)]">
        <div className="min-w-0 space-y-3.5">
          <section
            className={`${EVENT_READINESS_PANEL_CLASS} flex flex-wrap items-center gap-3`}
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#edf4ff] text-[#075bff]">
              <CalendarDays size={20} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block truncate text-[14px] font-semibold text-[#101b43]">
                {event.title}
              </strong>
              <span className="mt-1 block text-[10px] text-[#687693]">
                {formatEventDateTime(
                  event.scheduledAt,
                  {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  },
                  "Date not set",
                )}
              </span>
            </span>
            <span className="rounded-full bg-[#edf4ff] px-2.5 py-1 text-[10px] font-semibold text-[#075bff]">
              {event.status.replaceAll("_", " ")}
            </span>
          </section>
          <EventReadinessCard event={event} />
        </div>
        <aside className="min-w-0 space-y-3.5">
          <EventReadinessLifecycle status={event.status} />
          <EventReadinessTransitionCard event={event} />
          <EmptyState
            size="compact"
            title="Detailed checks aren’t connected"
            description="For this assessment, record the three readiness checks above. Crew rosters and stream diagnostics are not connected yet."
          />
        </aside>
      </div>
    </div>
  );
}
