"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowDownUp,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CirclePlay,
  Clock3,
  Plus,
  Radio,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import type { EventStatus } from "../../domain/types/event-status";
import { useEvents } from "../../application/hooks/use-events";
import {
  EVENTS_OVERVIEW_PAGE_SIZE,
  EVENTS_OVERVIEW_STATUS_TABS,
} from "../constants/events-overview.constants";
import {
  countCompletedReadiness,
  countEventsByStatus,
  countEventsByStatuses,
  getVisibleEvents,
} from "../lib/events-overview.utils";
import {
  EventsOverviewRow,
  EventsOverviewStatCard,
} from "../components/events-overview-sections";
import { formatEventDateTime } from "../lib/event-view.utils";
import { eventStatusPresentation } from "@/shared/components/feedback/event-status";
import { LoadingState } from "@/shared/components/feedback/loading-state";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { EmptyState } from "@/shared/components/feedback/empty-state";

export function EventsOverview({ query = "" }: { readonly query?: string }) {
  const { data, isPending, isError, error, refetch, isFetching } = useEvents();
  const [search, setSearch] = useState(query);
  const [activeStatus, setActiveStatus] = useState<EventStatus | "ALL">("ALL");
  const [filterStatus, setFilterStatus] = useState<EventStatus | "ALL">("ALL");
  const [sortByDate, setSortByDate] = useState(false);
  const [page, setPage] = useState(1);

  const visibleEvents = useMemo(() => {
    return getVisibleEvents(data ?? [], {
      query: search,
      activeStatus,
      filterStatus,
      sortByDate,
    });
  }, [activeStatus, data, filterStatus, search, sortByDate]);

  if (isPending) return <LoadingState label="Loading events" />;
  if (isError)
    return (
      <ErrorState
        title="Events could not be loaded"
        description={
          error.message || "Check the API configuration and try again."
        }
        retry={() => void refetch()}
        isRetrying={isFetching}
      />
    );

  const events = data ?? [];
  const liveCount = countEventsByStatus(events, "LIVE");
  const upcomingCount = countEventsByStatuses(events, ["SCHEDULED", "READY"]);
  const completedCount = countEventsByStatus(events, "COMPLETED");
  const replayCount = countEventsByStatus(events, "REPLAY_AVAILABLE");
  const pageCount = Math.max(
    1,
    Math.ceil(visibleEvents.length / EVENTS_OVERVIEW_PAGE_SIZE),
  );
  const pageEvents = visibleEvents.slice(
    (page - 1) * EVENTS_OVERVIEW_PAGE_SIZE,
    page * EVENTS_OVERVIEW_PAGE_SIZE,
  );

  return (
    <div className="space-y-5 lg:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[28px] leading-tight font-bold tracking-[-.035em] text-[#0b1538] sm:text-[32px]">
            Events
          </h1>
          <p className="mt-1 text-[13px] text-[#53627e] sm:text-[14px]">
            Create, manage and monitor all your live and upcoming events.
          </p>
        </div>
        <Link
          href="/dashboard/events/new"
          className="focus-ring brand-gradient inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] px-4 text-[13px] font-semibold text-white shadow-[0_5px_14px_rgba(0,103,245,.19)] transition hover:brightness-105"
        >
          <Plus size={18} aria-hidden="true" /> Create Event
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-5 xl:gap-2.5">
        <EventsOverviewStatCard
          icon={CalendarDays}
          label="Total Events"
          value={data?.length ?? 0}
          tone="bg-[#eaf1ff] text-[#075bff]"
          detail="All time"
        />
        <EventsOverviewStatCard
          icon={Radio}
          label="Live Events"
          value={liveCount}
          tone="bg-[#e6faf2] text-[#08a96f]"
        />
        <EventsOverviewStatCard
          icon={Clock3}
          label="Upcoming Events"
          value={upcomingCount}
          tone="bg-[#edf4ff] text-[#1676ff]"
        />
        <EventsOverviewStatCard
          icon={CheckCircle2}
          label="Completed Events"
          value={completedCount}
          tone="bg-[#f3edff] text-[#8a43ec]"
        />
        <EventsOverviewStatCard
          icon={CirclePlay}
          label="Replays Available"
          value={replayCount}
          tone="bg-[#fff0f1] text-[#f04451]"
        />
      </div>

      <section
        className="overflow-hidden rounded-[14px] border border-[#e5ebf4] bg-white shadow-[0_4px_18px_rgba(18,44,78,.025)]"
        aria-label="Events table"
      >
        <div className="flex flex-col gap-3 border-b border-[#e9eef5] px-3 pt-3 sm:px-4 lg:flex-row lg:items-end lg:justify-between">
          <nav
            className="dashboard-tabs-scroll -mb-px flex min-w-0 gap-4 overflow-x-auto"
            aria-label="Filter events by status"
          >
            {EVENTS_OVERVIEW_STATUS_TABS.map((tab) => {
              const count =
                tab.value === "ALL"
                  ? events.length
                  : countEventsByStatus(events, tab.value);
              const active = activeStatus === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setActiveStatus(tab.value);
                    setPage(1);
                  }}
                  className={`focus-ring flex min-h-11 shrink-0 items-center gap-2 border-b-2 px-1.5 text-[11px] font-medium transition-colors sm:text-[12px] ${active ? "border-[#075bff] text-[#075bff]" : "border-transparent text-[#465777] hover:text-[#075bff]"}`}
                >
                  {tab.label}
                  <span
                    className={`grid min-w-6 place-items-center rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${active ? "bg-[#eaf1ff] text-[#075bff]" : "bg-[#f0f3f8] text-[#62728f]"}`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>
          <div className="flex flex-wrap items-center gap-2 pb-3 lg:shrink-0">
            <label className="flex h-10 min-w-[185px] flex-1 items-center gap-2 rounded-[9px] border border-[#e1e8f2] px-3 text-[#637493] sm:w-[190px] sm:flex-none">
              <Search size={16} aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search events..."
                aria-label="Search events"
                className="min-w-0 flex-1 bg-transparent text-[11px] text-[#0b1538] outline-none placeholder:text-[#77849b]"
              />
            </label>
            <details className="group relative">
              <summary className="focus-ring flex h-10 cursor-pointer list-none items-center gap-2 rounded-[9px] border border-[#e1e8f2] px-3 text-[11px] font-medium text-[#233453] hover:bg-[#f8faff] [&::-webkit-details-marker]:hidden">
                <SlidersHorizontal size={15} aria-hidden="true" /> Filter
              </summary>
              <div className="absolute top-11 right-0 z-20 w-52 rounded-xl border border-[#e1e8f2] bg-white p-3 shadow-[0_12px_32px_rgba(11,21,56,.14)]">
                <label className="mb-1 block text-[10px] font-semibold text-[#687693]">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(event) => {
                    setFilterStatus(event.target.value as EventStatus | "ALL");
                    setPage(1);
                  }}
                  className="h-10 w-full rounded-lg border border-[#dce4ef] bg-white px-2 text-[11px] text-[#172747] outline-none focus:border-[#075bff]"
                >
                  <option value="ALL">All statuses</option>
                  {EVENTS_OVERVIEW_STATUS_TABS.slice(1).map((tab) => (
                    <option value={tab.value} key={tab.value}>
                      {tab.label}
                    </option>
                  ))}
                </select>
              </div>
            </details>
            <button
              type="button"
              onClick={() => setSortByDate((value) => !value)}
              aria-pressed={sortByDate}
              className={`focus-ring flex h-10 items-center gap-2 rounded-[9px] border px-3 text-[11px] font-medium transition ${sortByDate ? "border-[#b8d0f7] bg-[#f1f6ff] text-[#075bff]" : "border-[#e1e8f2] text-[#233453] hover:bg-[#f8faff]"}`}
            >
              <ArrowDownUp size={15} aria-hidden="true" />
              {sortByDate ? "Date" : "Sort"}
            </button>
          </div>
        </div>

        {pageEvents.length ? (
          <>
            <div className="hidden overflow-x-auto xl:block">
              <table className="w-full min-w-[900px] border-collapse text-left">
                <thead className="bg-[#f8faff] text-[10px] font-semibold text-[#435474]">
                  <tr>
                    <th className="w-10 px-3 py-3">
                      <span className="sr-only">Select events</span>
                    </th>
                    <th className="px-2 py-3">Event</th>
                    <th className="px-2 py-3">Status</th>
                    <th className="px-2 py-3">Date &amp; Time</th>
                    <th className="px-2 py-3">Readiness</th>
                    <th className="px-3 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageEvents.map((event) => (
                    <EventsOverviewRow key={event.id} event={event} />
                  ))}
                </tbody>
              </table>
            </div>
            <ul
              className="divide-y divide-[#edf1f6] xl:hidden"
              aria-label="Events"
            >
              {pageEvents.map((event) => {
                const status = eventStatusPresentation[event.status];
                const complete = countCompletedReadiness(event);
                return (
                  <li key={event.id} className="p-3 sm:p-4">
                    <div className="flex items-start gap-3">
                      <span className="grid size-[68px] shrink-0 place-items-center rounded-[9px] bg-[#edf4ff] text-[#075bff]">
                        <CalendarDays size={24} aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h2 className="truncate text-[13px] font-semibold text-[#0b1538]">
                              {event.title}
                            </h2>
                            <p className="mt-1 line-clamp-1 text-[11px] text-[#687693]">
                              {event.description || "No description added"}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-[7px] px-2 py-1 text-[10px] font-semibold ${status.className}`}
                          >
                            <span
                              className="size-1.5 rounded-full bg-current"
                              aria-hidden="true"
                            />{" "}
                            {status.label}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[#53627e]">
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays size={13} aria-hidden="true" />
                            {formatEventDateTime(
                              event.scheduledAt,
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                              "TBD",
                            )}
                          </span>
                          <span>
                            {complete} of 3 readiness requirements complete
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <Link
                        href={`/dashboard/events/${event.id}`}
                        className="focus-ring inline-flex min-h-10 shrink-0 items-center gap-1 rounded-[9px] border border-[#e1e8f2] px-3 text-[11px] font-semibold text-[#075bff]"
                      >
                        View event <ArrowRight size={13} aria-hidden="true" />
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <div className="px-4 py-12">
            <EmptyState
              title={
                search || activeStatus !== "ALL" || filterStatus !== "ALL"
                  ? "No matching events"
                  : "No events yet"
              }
              description={
                search
                  ? `No events matched “${search}”. Try a different search.`
                  : "Events will appear here when they are available."
              }
            />
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-[#edf1f6] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-[#687693]">
            Showing{" "}
            {visibleEvents.length
              ? (page - 1) * EVENTS_OVERVIEW_PAGE_SIZE + 1
              : 0}
            –{Math.min(page * EVENTS_OVERVIEW_PAGE_SIZE, visibleEvents.length)}{" "}
            of {visibleEvents.length} events
          </p>
          <nav aria-label="Events pages" className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Previous page"
              disabled={page <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="focus-ring grid size-9 place-items-center rounded-[8px] border border-[#e2e9f3] text-[#50617f] disabled:opacity-40"
            >
              <ChevronLeft size={16} aria-hidden="true" />
            </button>
            <span
              aria-current="page"
              className="grid size-9 place-items-center rounded-[8px] bg-[#075bff] text-[11px] font-semibold text-white"
            >
              {page}
            </span>
            <button
              type="button"
              aria-label="Next page"
              disabled={page >= pageCount}
              onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
              className="focus-ring grid size-9 place-items-center rounded-[8px] border border-[#e2e9f3] text-[#50617f] disabled:opacity-40"
            >
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </nav>
        </div>
      </section>

      <p className="sr-only" aria-live="polite">
        {visibleEvents.length} events found.
      </p>
    </div>
  );
}
