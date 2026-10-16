"use client";

import Link from "next/link";
import { CalendarDays, Plus } from "lucide-react";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { LoadingState } from "@/shared/components/feedback/loading-state";
import { DASHBOARD_METRICS } from "../constants/dashboard-overview.constants";
import { useDashboardOverview } from "../hooks/use-dashboard-overview";
import { MetricCard } from "../components/dashboard-overview/dashboard-overview-cards";
import {
  EventSchedule,
  StatusBreakdown,
} from "../components/dashboard-overview/dashboard-overview-analytics";
import { EventReadiness } from "../components/dashboard-overview/event-readiness";
import { RecentEvents } from "../components/dashboard-overview/recent-events";
import { TicketSalesAnalytics } from "../components/dashboard-overview/ticket-sales-analytics";
import { UpcomingEvents } from "../components/dashboard-overview/upcoming-events";

export function DashboardOverview() {
  const { events, isPending, isError, error, refetch, isFetching, metrics } =
    useDashboardOverview();

  if (isPending) {
    return <LoadingState label="Loading dashboard overview" rows={5} />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Overview could not be loaded"
        description={error.message || "Check your connection, then retry."}
        retry={() => void refetch()}
        isRetrying={isFetching}
      />
    );
  }

  return (
    <div className="space-y-3.5 pb-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[28px] leading-tight font-bold tracking-[-.05em] text-[#101b43] sm:text-[31px]">
            Overview
          </h1>
          <p className="mt-0.5 text-[13px] text-[#61708e]">
            Your event activity and readiness in one place.
          </p>
        </div>
        <Link
          href="/dashboard/events/new"
          className="focus-ring brand-gradient inline-flex h-11 items-center gap-2 rounded-[9px] px-4 text-[12px] font-semibold text-white shadow-[0_5px_14px_rgba(7,91,255,.16)] transition hover:brightness-105"
        >
          <Plus size={17} aria-hidden="true" /> Create Event
        </Link>
      </div>

      <section
        aria-label="Event summary"
        className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4"
      >
        {DASHBOARD_METRICS.map(({ key, icon, label, tone }) => (
          <MetricCard
            key={key}
            icon={icon}
            label={label}
            value={metrics[key]}
            tone={tone}
          />
        ))}
      </section>

      {events.length === 0 ? (
        <EmptyState
          title="Your dashboard is ready for its first event"
          description="Create an event to start tracking its schedule, lifecycle and readiness here. Sales and audience analytics will appear when those data sources are connected."
          icon={<CalendarDays size={26} strokeWidth={1.8} />}
          action={{
            label: "Create your first event",
            href: "/dashboard/events/new",
          }}
          secondaryAction={{
            label: "View all events",
            href: "/dashboard/events",
          }}
          className="min-h-[340px]"
        />
      ) : (
        <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,1.95fr)_minmax(320px,.95fr)]">
          <div className="min-w-0 space-y-3">
            <TicketSalesAnalytics />
            <div className="grid min-w-0 gap-3 md:grid-cols-2">
              <StatusBreakdown events={events} />
              <EventSchedule events={events} />
            </div>
            <RecentEvents events={events} />
          </div>
          <aside className="min-w-0 space-y-3">
            <UpcomingEvents events={events} />
            <EventReadiness events={events} />
          </aside>
        </div>
      )}
    </div>
  );
}
