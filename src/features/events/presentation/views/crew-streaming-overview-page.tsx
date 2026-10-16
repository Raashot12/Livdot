"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Radio,
  RotateCcw,
  Search,
  SlidersHorizontal,
  UserRoundPlus,
  Users,
  Video,
} from "lucide-react";
import type { EventStatus } from "../../domain/types/event-status";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { LoadingState } from "@/shared/components/feedback/loading-state";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import {
  panel,
  statusOptions,
  tabs,
  type DateFilter,
} from "../constants/crew-streaming-overview.constants";
import { crewHref } from "../lib/crew-streaming-overview.utils";
import { useCrewStreamingOverview } from "../hooks/use-crew-streaming-overview";
import {
  EventRow,
  QuickActions,
  ReadinessPanel,
  StatCard,
  UpcomingPanel,
} from "../components/crew-streaming-overview-sections";

export function CrewStreamingOverviewPage() {
  const {
    isPending,
    isError,
    error,
    refetch,
    isFetching,
    events,
    search,
    setSearch,
    activeTab,
    setActiveTab,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    page,
    setPage,
    filteredEvents,
    totalCrewMembers,
    streamingConfigured,
    eventsReady,
    eventsWithIssues,
    countForTab,
    pageCount,
    pageEvents,
    pageSize,
    resetFilters,
  } = useCrewStreamingOverview();
  if (isPending)
    return <LoadingState label="Loading crew and streaming events" rows={5} />;
  if (isError)
    return (
      <ErrorState
        title="Crew & streaming could not be loaded"
        description={
          error instanceof Error
            ? error.message
            : "The event service could not complete the request."
        }
        retry={() => void refetch()}
        isRetrying={isFetching}
      />
    );

  return (
    <div className="space-y-3.5 lg:space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[27px] leading-tight font-bold tracking-[-.04em] text-[#0b1538] sm:text-[31px]">
            Crew &amp; Streaming
          </h1>
          <p className="mt-1 max-w-3xl text-[12px] leading-relaxed text-[#596988] sm:text-[13px]">
            Manage your production crew and streaming setup across all events.
            Assign roles, configure ingest and monitor readiness.
          </p>
        </div>
        <Link
          href={events[0] ? crewHref(events[0]) : "/dashboard/events/new"}
          className="focus-ring brand-gradient inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-[10px] px-4 text-[12px] font-semibold text-white shadow-[0_5px_14px_rgba(0,103,245,.19)] transition hover:brightness-105"
        >
          {events.length ? (
            <>
              <UserRoundPlus size={17} aria-hidden="true" /> Assign Crew
            </>
          ) : (
            <>
              <Video size={17} aria-hidden="true" /> Create Event
            </>
          )}
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 2xl:grid-cols-4">
        <StatCard
          icon={Users}
          label="Events with Crew Assigned"
          value={totalCrewMembers}
          tone="bg-[#f2eaff] text-[#8038e6]"
        />
        <StatCard
          icon={Radio}
          label="Streaming Configured"
          value={streamingConfigured}
          tone="bg-[#eaf2ff] text-[#075bff]"
        />
        <StatCard
          icon={Video}
          label="Events Ready"
          value={eventsReady}
          tone="bg-[#e6faf2] text-[#08a96f]"
        />
        <StatCard
          icon={AlertTriangle}
          label="Events with Issues"
          value={eventsWithIssues}
          tone="bg-[#fff0f1] text-[#f04451]"
        />
      </div>

      <div className="grid min-w-0 grid-cols-1 items-start gap-3 xl:grid-cols-[minmax(0,1fr)_340px] 2xl:grid-cols-[minmax(0,1fr)_365px]">
        <section
          className={`${panel} min-w-0 overflow-hidden`}
          aria-label="Crew and streaming events"
        >
          <div className="border-b border-[#e9eef5] px-2.5 pt-2.5 sm:px-3.5">
            <nav
              className="dashboard-tabs-scroll flex min-w-0 gap-4 overflow-x-auto"
              aria-label="Filter events by production status"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  aria-pressed={activeTab === tab.value}
                  onClick={() => {
                    setActiveTab(tab.value);
                    setPage(1);
                  }}
                  className={`focus-ring -mb-px shrink-0 border-b-[3px] px-2.5 py-2 text-[10px] font-medium transition-colors sm:px-3 ${activeTab === tab.value ? "border-[#075bff] text-[#075bff]" : "border-transparent text-[#536380] hover:text-[#075bff]"}`}
                >
                  {tab.label}
                  {tab.value === "ALL" && (
                    <span className="ml-1.5 rounded-full bg-[#eaf1ff] px-1.5 py-0.5 text-[9px] font-semibold text-[#075bff]">
                      {events.length}
                    </span>
                  )}
                  {tab.value !== "ALL" && (
                    <span className="ml-1.5 text-[9px] text-[#8794aa]">
                      {countForTab(tab.value)}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-2.5 px-2.5 py-3 sm:px-3.5 lg:flex-row lg:items-center">
            <label className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#e5ebf4] bg-[#fbfcfe] px-3">
              <Search
                size={15}
                className="shrink-0 text-[#637493]"
                aria-hidden="true"
              />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                aria-label="Search crew and streaming events"
                placeholder="Search events..."
                className="min-w-0 flex-1 bg-transparent text-[10px] text-[#0b1538] outline-none placeholder:text-[#7b89a3]"
              />
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:shrink-0">
              <label className="sr-only" htmlFor="crew-status-filter">
                Filter by event status
              </label>
              <select
                id="crew-status-filter"
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value as EventStatus | "ALL");
                  setPage(1);
                }}
                className="h-9 min-w-0 rounded-lg border border-[#e5ebf4] bg-white px-2.5 text-[10px] text-[#243454] outline-none focus:border-[#075bff]"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <label className="sr-only" htmlFor="crew-date-filter">
                Filter by date
              </label>
              <select
                id="crew-date-filter"
                value={dateFilter}
                onChange={(event) => {
                  setDateFilter(event.target.value as DateFilter);
                  setPage(1);
                }}
                className="h-9 min-w-0 rounded-lg border border-[#e5ebf4] bg-white px-2.5 text-[10px] text-[#243454] outline-none focus:border-[#075bff]"
              >
                <option value="ALL">All Dates</option>
                <option value="UPCOMING">Upcoming</option>
                <option value="PAST">Past</option>
              </select>
            </div>
            <button
              type="button"
              onClick={resetFilters}
              className="focus-ring inline-flex h-9 shrink-0 items-center justify-center gap-1 rounded-lg px-2 text-[10px] font-medium text-[#075bff] hover:bg-[#f4f7fc]"
            >
              <RotateCcw size={12} aria-hidden="true" /> Reset
            </button>
          </div>

          <div className="dashboard-table-scroll min-w-0 overflow-x-auto px-2.5 sm:px-3.5">
            <table className="w-full min-w-[750px] table-fixed border-collapse text-left">
              <thead>
                <tr className="h-9 rounded-lg bg-[#f7f9fc] text-[9px] font-semibold text-[#435575]">
                  <th scope="col" className="w-[31%] rounded-l-lg px-3">
                    Event
                  </th>
                  <th scope="col" className="w-[14%] px-2">
                    Date &amp; Time
                  </th>
                  <th scope="col" className="w-[11%] px-2 text-center">
                    Crew
                  </th>
                  <th scope="col" className="w-[14%] px-2">
                    Streaming
                  </th>
                  <th scope="col" className="w-[12%] px-2">
                    Status
                  </th>
                  <th
                    scope="col"
                    className="w-[18%] rounded-r-lg px-2 text-right"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageEvents.map((event) => (
                  <EventRow key={event.id} event={event} />
                ))}
              </tbody>
            </table>
            {!pageEvents.length && (
              <EmptyState
                title={
                  events.length
                    ? "No events match these filters"
                    : "No events need production setup yet"
                }
                description={
                  events.length
                    ? "Try another search or reset the filters to see your events."
                    : "Create an event to assign a crew and configure streaming."
                }
                icon={<SlidersHorizontal size={20} aria-hidden="true" />}
                action={
                  !events.length
                    ? { label: "Create event", href: "/dashboard/events/new" }
                    : undefined
                }
              />
            )}
          </div>

          <div className="flex flex-col gap-2 border-t border-[#edf1f6] px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] text-[#62728f]">
              Showing {filteredEvents.length ? (page - 1) * pageSize + 1 : 0}–
              {Math.min(page * pageSize, filteredEvents.length)} of{" "}
              {filteredEvents.length} events
            </p>
            <nav
              aria-label="Event table pages"
              className="flex items-center justify-end gap-1.5"
            >
              <button
                type="button"
                aria-label="Previous page"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="focus-ring grid size-9 place-items-center rounded-lg border border-[#e5ebf4] text-[#536380] disabled:opacity-40"
              >
                <ChevronLeft size={15} aria-hidden="true" />
              </button>
              {Array.from({ length: pageCount }, (_, index) => index + 1).map(
                (value) => (
                  <button
                    key={value}
                    type="button"
                    aria-current={page === value ? "page" : undefined}
                    onClick={() => setPage(value)}
                    className={`focus-ring grid size-9 place-items-center rounded-lg border text-[11px] font-semibold ${page === value ? "border-[#075bff] bg-[#075bff] text-white" : "border-[#e5ebf4] text-[#243454] hover:bg-[#f4f7fc]"}`}
                  >
                    {value}
                  </button>
                ),
              )}
              <button
                type="button"
                aria-label="Next page"
                disabled={page >= pageCount}
                onClick={() =>
                  setPage((current) => Math.min(pageCount, current + 1))
                }
                className="focus-ring grid size-9 place-items-center rounded-lg border border-[#e5ebf4] text-[#536380] disabled:opacity-40"
              >
                <ChevronRight size={15} aria-hidden="true" />
              </button>
            </nav>
          </div>
        </section>

        <aside className="grid min-w-0 content-start gap-3">
          <ReadinessPanel events={events} />
          <UpcomingPanel events={events} />
          <QuickActions events={events} />
        </aside>
      </div>
    </div>
  );
}
