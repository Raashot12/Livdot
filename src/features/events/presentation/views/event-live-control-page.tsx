"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Radio,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { useEvents } from "../../application/hooks/use-events";
import { useTransitionEvent } from "../../application/hooks/use-transition-event";
import type { EventEntity } from "../../domain/entities/event.entity";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { LoadingState } from "@/shared/components/feedback/loading-state";
import {
  EMPTY_LIVE_CONTROL_EVENTS,
  EVENT_LIVE_CONTROL_PANEL_CLASS,
  EVENT_LIVE_CONTROL_STATUSES,
  type EventLiveControlFilterStatus,
} from "../constants/event-live-control.constants";
import {
  LiveControlEventRow,
  LiveControlMetric,
  LiveControlSystemReadiness,
} from "../components/event-live-control-sections";
import {
  countLiveControlEvents,
  filterLiveControlEvents,
  getLiveControlSummary,
} from "../lib/event-live-control.utils";

export function EventLiveControlPage({
  eventId,
}: {
  readonly eventId: string;
}) {
  const { data, isPending, isError, error, refetch, isFetching } = useEvents();
  const transition = useTransitionEvent();
  const events = data ?? EMPTY_LIVE_CONTROL_EVENTS;
  const [active, setActive] = useState<EventLiveControlFilterStatus>("ALL");
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    return filterLiveControlEvents(events, active, query);
  }, [active, events, query]);

  if (isPending) return <LoadingState label="Loading live control" rows={5} />;
  if (isError)
    return (
      <ErrorState
        title="Live Control could not be loaded"
        description={
          error.message || "The event service could not complete the request."
        }
        retry={() => void refetch()}
        isRetrying={isFetching}
      />
    );

  const summary = getLiveControlSummary(events, eventId);
  async function goLive(event: EventEntity) {
    try {
      await transition.mutateAsync({
        id: event.id,
        target: "LIVE",
        expectedVersion: event.version,
      });
      toast.success(event.title + " is now marked live");
    } catch (cause) {
      toast.error("Could not update event status", {
        description:
          cause instanceof Error
            ? cause.message
            : "Check event readiness and try again.",
      });
    }
  }

  return (
    <div className="min-w-0 space-y-3.5 pb-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <nav
            aria-label="Breadcrumb"
            className="mb-2 text-[11px] text-[#075bff]"
          >
            Live Control <span className="mx-1 text-[#8a96ac]">›</span>
          </nav>
          <h1 className="text-[28px] leading-tight font-bold tracking-[-.05em] text-[#101b43] sm:text-[32px]">
            Live Control
          </h1>
          <p className="mt-1 text-[12px] text-[#61708e]">
            Monitor event readiness and open broadcast controls.
          </p>
        </div>
        <Link
          href={
            summary.ready
              ? "/dashboard/events/" + summary.reviewReadyEventId
              : "/dashboard/events/new"
          }
          className="focus-ring brand-gradient inline-flex min-h-10 items-center gap-2 rounded-xl px-4 text-[11px] font-semibold text-white shadow-[0_5px_14px_rgba(7,91,255,.16)]"
        >
          <Radio size={15} aria-hidden="true" />{" "}
          {summary.ready ? "Review Ready Events" : "Create Event"}
        </Link>
      </header>

      <section
        aria-label="Broadcast event summary"
        className="grid min-w-0 grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4"
      >
        <LiveControlMetric
          icon={Radio}
          label="Live Events"
          value={summary.live}
          tone="bg-[#fff0f1] text-[#ee3340]"
        />
        <LiveControlMetric
          icon={CheckCircle2}
          label="Ready to Go Live"
          value={summary.ready}
          tone="bg-[#eafaf2] text-[#06ae68]"
        />
        <LiveControlMetric
          icon={CalendarDays}
          label="Scheduled Events"
          value={summary.scheduled}
          tone="bg-[#edf4ff] text-[#1676ff]"
        />
        <LiveControlMetric
          icon={CircleAlert}
          label="Streaming Configured"
          value={summary.streamingConfigured}
          tone="bg-[#f3edff] text-[#6c31ee]"
        />
      </section>

      <div className="grid min-w-0 items-start gap-3.5 xl:grid-cols-[minmax(0,2fr)_minmax(290px,.78fr)]">
        <section
          className={EVENT_LIVE_CONTROL_PANEL_CLASS + " overflow-hidden"}
          aria-label="Broadcast events"
        >
          <div className="flex min-w-0 gap-2 overflow-x-auto border-b border-[#e9eef5] px-3 pt-2.5">
            {EVENT_LIVE_CONTROL_STATUSES.map((status) => {
              const count = countLiveControlEvents(events, status);
              return (
                <button
                  key={status}
                  type="button"
                  aria-pressed={active === status}
                  onClick={() => setActive(status)}
                  className={
                    "focus-ring min-h-10 shrink-0 border-b-2 px-2 text-[10px] font-semibold " +
                    (active === status
                      ? "border-[#075bff] text-[#075bff]"
                      : "border-transparent text-[#536380]")
                  }
                >
                  {status === "ALL"
                    ? "All Events"
                    : status.replaceAll("_", " ")}{" "}
                  <span className="ml-1 rounded-full bg-[#f0f3f8] px-1.5 py-0.5">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-2 p-3">
            <label className="relative min-w-[190px] flex-1 sm:max-w-[330px]">
              <Search
                size={15}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#62728f]"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search events…"
                className="focus-ring h-9 w-full rounded-lg border border-[#e3eaf4] bg-[#f9fbff] pr-3 pl-9 text-[10px] text-[#172344]"
              />
            </label>
          </div>
          {filtered.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] border-separate border-spacing-0 text-left">
                <thead className="bg-[#f7f9fc] text-[9px] font-semibold text-[#425475]">
                  <tr>
                    <th scope="col" className="px-3 py-2.5">
                      Event
                    </th>
                    <th scope="col" className="px-3 py-2.5">
                      Date &amp; Time
                    </th>
                    <th scope="col" className="px-3 py-2.5">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-2.5">
                      Readiness
                    </th>
                    <th scope="col" className="px-3 py-2.5 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((event) => (
                    <LiveControlEventRow
                      key={event.id}
                      event={event}
                      onGoLive={(target) => void goLive(target)}
                      pending={transition.isPending}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 sm:p-6">
              <EmptyState
                size="compact"
                title={
                  events.length
                    ? "No events match this view"
                    : "No events to manage yet"
                }
                description={
                  events.length
                    ? "Try a different status or search term."
                    : "Create an event to start tracking its live setup here."
                }
                action={
                  !events.length
                    ? { label: "Create event", href: "/dashboard/events/new" }
                    : undefined
                }
              />
            </div>
          )}
        </section>

        <aside className="min-w-0 space-y-3.5">
          <LiveControlSystemReadiness events={events} />
          <section className={EVENT_LIVE_CONTROL_PANEL_CLASS + " p-4"}>
            <h2 className="text-[14px] font-bold text-[#101b43]">
              Stream health
            </h2>
            <EmptyState
              size="compact"
              icon={<Radio size={21} />}
              title="Telemetry isn’t connected"
              description="Bitrate, latency, dropped frames, and viewer counts will appear when a streaming provider is connected."
            />
          </section>
          <section className={EVENT_LIVE_CONTROL_PANEL_CLASS + " p-4"}>
            <h2 className="text-[14px] font-bold text-[#101b43]">
              Broadcast actions
            </h2>
            <EmptyState
              size="compact"
              title="No broadcast session data"
              description="Live session controls will be available when the streaming control service is connected."
            />
          </section>
        </aside>
      </div>
    </div>
  );
}
