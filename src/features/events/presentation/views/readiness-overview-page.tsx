"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Radio,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { evaluateReadiness } from "../../domain/policies/readiness.policy";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { LoadingState } from "@/shared/components/feedback/loading-state";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import {
  panel,
  requirementItems,
  tabDefinitions,
  type DateFilter,
} from "../constants/readiness-overview.constants";
import {
  blockerLabel,
  requirementCompletionCount,
} from "../lib/readiness-overview.utils";
import { useReadinessOverview } from "../hooks/use-readiness-overview";
import {
  MetricCard,
  ReadinessEventRow,
} from "../components/readiness-overview-widgets";

export function ReadinessOverviewPage() {
  const {
    isPending,
    isError,
    error,
    refetch,
    isFetching,
    activeTab,
    setActiveTab,
    search,
    setSearch,
    dateFilter,
    setDateFilter,
    setRequirementFilter,
    page,
    setPage,
    pageSize,
    allEvents,
    counts,
    filteredEvents,
    pageCount,
    visibleEvents,
    readinessReadyCount,
    needsAttentionCount,
    scheduledCount,
    blockingEvents,
    streamSetupEvent,
    liveControlEvent,
    clearFilters,
    setTab,
    runReadinessCheck,
  } = useReadinessOverview();
  if (isPending)
    return <LoadingState label="Loading event readiness" rows={6} />;
  if (isError) {
    return (
      <ErrorState
        title="Readiness overview could not be loaded"
        description={
          error instanceof Error
            ? error.message
            : "The event service could not complete the request."
        }
        retry={() => void refetch()}
        isRetrying={isFetching}
      />
    );
  }

  return (
    <div className="space-y-4 pb-6">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0">
          <nav
            aria-label="Breadcrumb"
            className="mb-2 flex items-center gap-2 text-[11px] text-[#687693]"
          >
            <Link
              href="/dashboard/readiness"
              className="focus-ring rounded-sm font-medium text-[#075bff] hover:underline"
            >
              Readiness
            </Link>
            <ChevronRight size={13} aria-hidden="true" />
            <span aria-current="page" className="font-medium text-[#243454]">
              Overview
            </span>
          </nav>
          <h1 className="text-[28px] leading-tight font-bold tracking-[-.04em] text-[#0b1538] sm:text-[32px]">
            Event Readiness
          </h1>
          <p className="mt-1 max-w-[70ch] text-[12px] leading-relaxed text-[#596988] sm:text-[13px]">
            Check and complete all requirements before going live. Monitor
            readiness across your events.
          </p>
        </div>
        <a
          href="#readiness-checklist"
          className="focus-ring inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-[#dfe7f2] bg-white px-3.5 text-[10px] font-semibold text-[#075bff] shadow-[0_2px_8px_rgba(18,44,78,.03)] hover:bg-[#f7faff] sm:text-[11px]"
        >
          <BookOpen size={16} aria-hidden="true" /> Learn About Readiness
        </a>
      </header>

      <div className="grid items-start gap-3.5 xl:grid-cols-[minmax(0,2.78fr)_minmax(300px,1fr)]">
        <div className="min-w-0 space-y-3.5">
          <section
            aria-label="Readiness summary"
            className="grid grid-cols-1 gap-3 sm:grid-cols-3"
          >
            <MetricCard
              icon={CheckCircle2}
              label="Ready to Go Live"
              value={readinessReadyCount}
              detail="All critical requirements met"
              tone="bg-[#e5fbf3] text-[#08a96d]"
            />
            <MetricCard
              icon={AlertCircle}
              label="Needs Attention"
              value={needsAttentionCount}
              detail={`${blockingEvents.length} event${blockingEvents.length === 1 ? "" : "s"} with missing requirements`}
              tone="bg-[#fff4df] text-[#e69b00]"
            />
            <MetricCard
              icon={CalendarDays}
              label="Scheduled"
              value={scheduledCount}
              detail="Events with a planned date"
              tone="bg-[#eaf2ff] text-[#075bff]"
            />
          </section>

          <section
            id="readiness-events"
            className={`${panel} min-w-0 overflow-hidden`}
            aria-label="Readiness events"
          >
            <div className="border-b border-[#edf1f6] px-2.5 pt-2.5">
              <div
                role="tablist"
                aria-label="Filter by readiness status"
                className="flex min-w-0 [scrollbar-width:thin] items-center gap-1 overflow-x-auto pb-2"
              >
                {tabDefinitions.map((tab) => {
                  const count =
                    tab.id === "ALL" ? allEvents.length : counts[tab.id];
                  const selected = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setTab(tab.id)}
                      className={`focus-ring inline-flex min-h-9 shrink-0 items-center gap-2 border-b-2 px-2.5 text-[10px] font-medium transition-colors sm:px-3 ${selected ? "border-[#075bff] text-[#075bff]" : "border-transparent text-[#536380] hover:text-[#075bff]"}`}
                    >
                      {tab.label}
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[9px] tabular-nums ${selected ? "bg-[#eaf2ff] text-[#075bff]" : "bg-[#f0f3f8] text-[#637391]"}`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-2 pb-2.5">
                <label className="relative min-w-[180px] flex-1 xl:max-w-[230px]">
                  <Search
                    size={15}
                    className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#5c6d8e]"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Search events..."
                    className="focus-ring h-10 w-full rounded-[10px] border border-[#e3eaf4] bg-[#f9fbff] pr-3 pl-9 text-[10px] text-[#172344] placeholder:text-[#8390a8]"
                  />
                </label>
                <label className="sr-only" htmlFor="readiness-date">
                  Filter by date
                </label>
                <select
                  id="readiness-date"
                  value={dateFilter}
                  onChange={(event) => {
                    setDateFilter(event.target.value as DateFilter);
                    setPage(1);
                  }}
                  className="focus-ring h-10 min-w-[132px] flex-1 rounded-[10px] border border-[#e3eaf4] bg-white px-2.5 text-[10px] text-[#273958] sm:flex-none"
                >
                  <option value="ALL">All Dates</option>
                  <option value="UPCOMING">Upcoming</option>
                  <option value="PAST">Past Events</option>
                  <option value="UNSCHEDULED">Date to be confirmed</option>
                </select>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="focus-ring inline-flex min-h-9 items-center rounded-lg px-2 text-[10px] font-semibold text-[#075bff] hover:bg-[#f2f7ff]"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[770px] border-separate border-spacing-0 text-left">
                <thead>
                  <tr className="bg-[#f7f9fc] text-[9px] font-semibold text-[#425475]">
                    <th scope="col" className="px-3 py-3">
                      Event
                    </th>
                    <th scope="col" className="px-2.5 py-3">
                      Date &amp; Time
                    </th>
                    <th scope="col" className="px-2.5 py-3">
                      Readiness Status
                    </th>
                    <th scope="col" className="px-2.5 py-3">
                      Progress
                    </th>
                    <th scope="col" className="px-2.5 py-3 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleEvents.map((event) => (
                    <ReadinessEventRow key={event.id} event={event} />
                  ))}
                  {visibleEvents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center">
                        <EmptyState
                          size="compact"
                          title={
                            allEvents.length
                              ? "No events match these filters"
                              : "No events to review yet"
                          }
                          description={
                            allEvents.length
                              ? "Try another search or reset the filters."
                              : "Create an event to start checking its production requirements."
                          }
                          action={
                            !allEvents.length
                              ? {
                                  label: "Create event",
                                  href: "/dashboard/events/new",
                                }
                              : undefined
                          }
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col justify-between gap-2.5 border-t border-[#edf1f6] px-3 py-2.5 sm:flex-row sm:items-center">
              <p className="text-[10px] text-[#667693]">
                Showing {filteredEvents.length ? (page - 1) * pageSize + 1 : 0}–
                {Math.min(page * pageSize, filteredEvents.length)} of{" "}
                {filteredEvents.length} events
              </p>
              <nav
                aria-label="Readiness event pages"
                className="flex items-center gap-1 text-[10px]"
              >
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page === 1}
                  aria-label="Previous page"
                  className="focus-ring grid size-8 place-items-center rounded-lg text-[#536584] disabled:cursor-not-allowed disabled:text-[#aab5c6]"
                >
                  <ChevronLeft size={15} aria-hidden="true" />
                </button>
                {Array.from({ length: pageCount }, (_, index) => index + 1).map(
                  (pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setPage(pageNumber)}
                      aria-current={pageNumber === page ? "page" : undefined}
                      className={`focus-ring grid size-8 place-items-center rounded-lg ${pageNumber === page ? "bg-[#075bff] font-semibold text-white" : "text-[#405477] hover:bg-[#f2f7ff]"}`}
                    >
                      {pageNumber}
                    </button>
                  ),
                )}
                <button
                  type="button"
                  onClick={() =>
                    setPage((current) => Math.min(pageCount, current + 1))
                  }
                  disabled={page >= pageCount}
                  aria-label="Next page"
                  className="focus-ring grid size-8 place-items-center rounded-lg text-[#536584] disabled:cursor-not-allowed disabled:text-[#aab5c6]"
                >
                  <ChevronRight size={15} aria-hidden="true" />
                </button>
              </nav>
            </div>
          </section>
        </div>

        <aside
          className="min-w-0 space-y-3.5"
          aria-label="Readiness overview tools"
        >
          <section
            id="readiness-checklist"
            className={`${panel} scroll-mt-24 px-3.5 py-3.5`}
            aria-labelledby="readiness-checklist-title"
          >
            <div className="flex items-center justify-between gap-2">
              <h2
                id="readiness-checklist-title"
                className="text-[14px] font-bold tracking-[-.025em] text-[#101b43]"
              >
                Readiness Checklist
              </h2>
              <a
                href="#readiness-events"
                className="focus-ring inline-flex items-center gap-1 rounded text-[10px] font-semibold text-[#075bff] hover:underline"
              >
                View All <ArrowRight size={13} aria-hidden="true" />
              </a>
            </div>
            {allEvents.length ? (
              <ul className="mt-2 divide-y divide-[#edf1f6]">
                {requirementItems.map((item) => {
                  const Icon = item.icon;
                  const completeCount = requirementCompletionCount(
                    allEvents,
                    item.key,
                  );
                  const percentage = allEvents.length
                    ? Math.round((completeCount / allEvents.length) * 100)
                    : 0;
                  return (
                    <li key={item.key}>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab("ALL");
                          setRequirementFilter(item.key);
                          setPage(1);
                          document
                            .getElementById("readiness-events")
                            ?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                        }}
                        className="focus-ring flex w-full items-center gap-2.5 py-2 text-left hover:bg-[#fbfcff]"
                      >
                        <span
                          className={`grid size-9 shrink-0 place-items-center rounded-[9px] ${item.tone}`}
                        >
                          <Icon size={18} aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[10px] font-semibold text-[#172344]">
                            {item.label}
                          </span>
                          <span className="mt-0.5 block text-[9px] text-[#687693]">
                            {completeCount}/{allEvents.length} events
                          </span>
                          <span className="mt-1.5 flex items-center gap-2">
                            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#e9edf4]">
                              <span
                                className={`block h-full rounded-full ${item.bar}`}
                                style={{ width: `${percentage}%` }}
                              />
                            </span>
                            <span className="w-7 text-right text-[9px] text-[#526382] tabular-nums">
                              {percentage}%
                            </span>
                          </span>
                        </span>
                        <ChevronRight
                          size={15}
                          className="shrink-0 text-[#075bff]"
                          aria-hidden="true"
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState
                size="compact"
                title="No checklist data yet"
                description="Requirement progress will appear when an event is created."
              />
            )}
          </section>

          <section
            className={`${panel} px-3.5 py-3.5`}
            aria-labelledby="blocking-issues-title"
          >
            <div className="flex items-center justify-between gap-2">
              <h2
                id="blocking-issues-title"
                className="text-[14px] font-bold tracking-[-.025em] text-[#101b43]"
              >
                Events with Blocking Issues
              </h2>
              <button
                type="button"
                onClick={() => setTab("ATTENTION")}
                className="focus-ring inline-flex items-center gap-1 rounded text-[10px] font-semibold text-[#075bff] hover:underline"
              >
                View All <ArrowRight size={13} aria-hidden="true" />
              </button>
            </div>
            {blockingEvents.length ? (
              <ul className="mt-2 space-y-1.5">
                {blockingEvents.slice(0, 3).map((event) => {
                  const incomplete = event.status === "DRAFT";
                  const missing = evaluateReadiness(event.readiness).blockers
                    .length;
                  return (
                    <li key={event.id}>
                      <Link
                        href={`/dashboard/events/${event.id}/readiness`}
                        className={`focus-ring flex min-h-[54px] items-center gap-2.5 rounded-[9px] px-2.5 py-2 ${incomplete ? "bg-[#fff8e9] text-[#ad6800] hover:bg-[#fff4db]" : "bg-[#fff0f1] text-[#d93038] hover:bg-[#ffe8ea]"}`}
                      >
                        {incomplete ? (
                          <AlertCircle
                            size={21}
                            className="shrink-0"
                            aria-hidden="true"
                          />
                        ) : (
                          <CircleAlert
                            size={21}
                            className="shrink-0"
                            aria-hidden="true"
                          />
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[10px] font-semibold">
                            {blockerLabel(event)}
                            {missing > 1 ? ` · ${missing - 1} more` : ""}
                          </span>
                          <span className="mt-0.5 block truncate text-[9px] text-[#687693]">
                            {event.title}
                          </span>
                        </span>
                        <ChevronRight
                          size={15}
                          className="shrink-0"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : allEvents.length ? (
              <div className="mt-3 flex items-center gap-2.5 rounded-[9px] bg-[#eafbf4] px-3 py-3 text-[#07855e]">
                <ShieldCheck size={20} aria-hidden="true" />
                <p className="text-[10px] font-medium">
                  All events meet their readiness requirements.
                </p>
              </div>
            ) : (
              <EmptyState
                size="compact"
                title="No blocking issues"
                description="Create an event to see any requirements that need attention."
              />
            )}
          </section>

          <section
            className={`${panel} px-3.5 py-3.5`}
            aria-labelledby="readiness-actions-title"
          >
            <h2
              id="readiness-actions-title"
              className="text-[14px] font-bold tracking-[-.025em] text-[#101b43]"
            >
              Quick Actions
            </h2>
            <div className="mt-2 divide-y divide-[#edf1f6]">
              <Link
                href="/dashboard/crew"
                className="focus-ring group flex items-center gap-2.5 py-2 hover:bg-[#fbfcff]"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-[9px] bg-[#eaf2ff] text-[#075bff]">
                  <Users size={18} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-semibold text-[#172344]">
                    Go to Crew &amp; Streaming
                  </span>
                  <span className="mt-0.5 block truncate text-[9px] text-[#687693]">
                    Manage crew and production setup
                  </span>
                </span>
                <ChevronRight
                  size={15}
                  className="text-[#075bff]"
                  aria-hidden="true"
                />
              </Link>
              <Link
                href={
                  streamSetupEvent
                    ? `/dashboard/events/${streamSetupEvent.id}/crew?tab=streaming`
                    : "/dashboard/crew"
                }
                className="focus-ring group flex items-center gap-2.5 py-2 hover:bg-[#fbfcff]"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-[9px] bg-[#eaf2ff] text-[#075bff]">
                  <Radio size={18} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-semibold text-[#172344]">
                    Configure Streaming
                  </span>
                  <span className="mt-0.5 block truncate text-[9px] text-[#687693]">
                    Set up ingest and backup streams
                  </span>
                </span>
                <ChevronRight
                  size={15}
                  className="text-[#075bff]"
                  aria-hidden="true"
                />
              </Link>
              <button
                type="button"
                onClick={() => void runReadinessCheck()}
                disabled={isFetching}
                className="focus-ring group flex w-full items-center gap-2.5 py-2 text-left hover:bg-[#fbfcff] disabled:cursor-wait disabled:opacity-60"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-[9px] bg-[#eaf2ff] text-[#075bff]">
                  <RefreshCw
                    size={18}
                    className={isFetching ? "animate-spin" : ""}
                    aria-hidden="true"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-semibold text-[#172344]">
                    Run Readiness Check
                  </span>
                  <span className="mt-0.5 block truncate text-[9px] text-[#687693]">
                    Refresh event requirements
                  </span>
                </span>
                <ChevronRight
                  size={15}
                  className="text-[#075bff]"
                  aria-hidden="true"
                />
              </button>
              {liveControlEvent && (
                <Link
                  href={`/dashboard/events/${liveControlEvent.id}/live`}
                  className="focus-ring group flex items-center gap-2.5 py-2 hover:bg-[#fbfcff]"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-[9px] bg-[#eaf2ff] text-[#075bff]">
                    <Radio size={18} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] font-semibold text-[#172344]">
                      View Live Control
                    </span>
                    <span className="mt-0.5 block truncate text-[9px] text-[#687693]">
                      Open a broadcast control room
                    </span>
                  </span>
                  <ChevronRight
                    size={15}
                    className="text-[#075bff]"
                    aria-hidden="true"
                  />
                </Link>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
