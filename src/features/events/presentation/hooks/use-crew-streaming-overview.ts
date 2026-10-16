"use client";

import { useMemo, useState } from "react";
import { useEvents } from "../../application/hooks/use-events";
import type { EventStatus } from "../../domain/types/event-status";
import {
  CREW_PAGE_SIZE,
  type DateFilter,
  type EventFilter,
} from "../constants/crew-streaming-overview.constants";
import {
  matchesFilter,
  needsSetup,
  isInDateRange,
} from "../lib/crew-streaming-overview.utils";

export function useCrewStreamingOverview() {
  const query = useEvents();
  const events = useMemo(
    () =>
      [...(query.data ?? [])].sort((left, right) => {
        const leftTime = left.scheduledAt
          ? new Date(left.scheduledAt).getTime()
          : Infinity;
        const rightTime = right.scheduledAt
          ? new Date(right.scheduledAt).getTime()
          : Infinity;
        return leftTime - rightTime;
      }),
    [query.data],
  );
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<EventFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<EventStatus | "ALL">("ALL");
  const [dateFilter, setDateFilter] = useState<DateFilter>("ALL");
  const [page, setPage] = useState(1);

  const filteredEvents = useMemo(() => {
    const queryText = search.trim().toLocaleLowerCase();
    return events.filter((event) => {
      const matchesSearch =
        `${event.title} ${event.description} ${event.status}`
          .toLocaleLowerCase()
          .includes(queryText);
      return (
        matchesSearch &&
        matchesFilter(event, activeTab) &&
        (statusFilter === "ALL" || event.status === statusFilter) &&
        isInDateRange(event, dateFilter)
      );
    });
  }, [activeTab, dateFilter, events, search, statusFilter]);

  const totalCrewMembers = events.filter(
    (event) => event.readiness.crewAssigned,
  ).length;
  const streamingConfigured = events.filter(
    (event) => event.readiness.ingestConfigured,
  ).length;
  const eventsReady = events.filter(
    (event) =>
      event.readiness.crewAssigned &&
      event.readiness.ingestConfigured &&
      event.readiness.ticketPricingConfigured,
  ).length;
  const eventsWithIssues = events.filter(needsSetup).length;
  const countForTab = (tab: EventFilter) =>
    events.filter((event) => matchesFilter(event, tab)).length;
  const pageCount = Math.max(
    1,
    Math.ceil(filteredEvents.length / CREW_PAGE_SIZE),
  );
  const pageEvents = filteredEvents.slice(
    (page - 1) * CREW_PAGE_SIZE,
    page * CREW_PAGE_SIZE,
  );

  function resetFilters() {
    setSearch("");
    setActiveTab("ALL");
    setStatusFilter("ALL");
    setDateFilter("ALL");
    setPage(1);
  }

  return {
    ...query,
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
    pageSize: CREW_PAGE_SIZE,
    resetFilters,
  };
}
