"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useEvents } from "../../application/hooks/use-events";
import { evaluateReadiness } from "../../domain/policies/readiness.policy";
import {
  EMPTY_EVENTS,
  MODULE_STARTED_AT,
  READINESS_PAGE_SIZE,
  type DateFilter,
  type ReadinessTab,
  type RequirementKey,
} from "../constants/readiness-overview.constants";
import { readinessState } from "../lib/readiness-overview.utils";

export function useReadinessOverview() {
  const query = useEvents();
  const [activeTab, setActiveTab] = useState<ReadinessTab>("ALL");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("ALL");
  const [requirementFilter, setRequirementFilter] =
    useState<RequirementKey | null>(null);
  const [page, setPage] = useState(1);
  const allEvents = query.data ?? EMPTY_EVENTS;

  const counts = useMemo(() => {
    const states = allEvents.map((event) => readinessState(event));
    return {
      READY: states.filter((state) => state === "READY").length,
      ATTENTION: states.filter((state) => state === "ATTENTION").length,
      SCHEDULED: states.filter((state) => state === "SCHEDULED").length,
      INCOMPLETE: states.filter((state) => state === "INCOMPLETE").length,
    };
  }, [allEvents]);

  const filteredEvents = useMemo(() => {
    const queryText = search.trim().toLowerCase();
    return allEvents.filter((event) => {
      const state = readinessState(event);
      const matchesTab = activeTab === "ALL" || state === activeTab;
      const matchesRequirement =
        requirementFilter === null || !event.readiness[requirementFilter];
      const matchesSearch =
        !queryText ||
        `${event.title} ${event.description}`.toLowerCase().includes(queryText);
      const date = event.scheduledAt
        ? new Date(event.scheduledAt).getTime()
        : null;
      const matchesDate =
        dateFilter === "ALL" ||
        (dateFilter === "UNSCHEDULED" && date === null) ||
        (dateFilter === "UPCOMING" &&
          date !== null &&
          date >= MODULE_STARTED_AT) ||
        (dateFilter === "PAST" && date !== null && date < MODULE_STARTED_AT);
      return matchesTab && matchesRequirement && matchesSearch && matchesDate;
    });
  }, [activeTab, allEvents, dateFilter, requirementFilter, search]);

  const pageCount = Math.max(
    1,
    Math.ceil(filteredEvents.length / READINESS_PAGE_SIZE),
  );
  const visibleEvents = filteredEvents.slice(
    (page - 1) * READINESS_PAGE_SIZE,
    page * READINESS_PAGE_SIZE,
  );
  const readinessReadyCount = allEvents.filter(
    (event) =>
      evaluateReadiness(event.readiness).ready &&
      (event.status === "SCHEDULED" || event.status === "READY"),
  ).length;
  const needsAttentionCount = counts.ATTENTION + counts.INCOMPLETE;
  const scheduledCount = allEvents.filter(
    (event) => event.status === "SCHEDULED",
  ).length;
  const blockingEvents = allEvents.filter(
    (event) => evaluateReadiness(event.readiness).blockers.length > 0,
  );
  const liveEvent = allEvents.find((event) => event.status === "LIVE");
  const streamSetupEvent = allEvents.find(
    (event) => !event.readiness.ingestConfigured,
  );
  const liveControlEvent =
    liveEvent ??
    allEvents.find((event) => event.status === "READY") ??
    allEvents[0];

  function clearFilters() {
    setActiveTab("ALL");
    setSearch("");
    setDateFilter("ALL");
    setRequirementFilter(null);
    setPage(1);
  }

  function setTab(tab: ReadinessTab) {
    setActiveTab(tab);
    setRequirementFilter(null);
    setPage(1);
  }

  async function runReadinessCheck() {
    const result = await query.refetch();
    if (result.isError) {
      toast.error("Readiness check failed", {
        description: "Refresh the page and try again.",
      });
      return;
    }
    toast.success("Readiness check complete", {
      description: "Event requirements have been refreshed.",
    });
  }

  return {
    ...query,
    activeTab,
    setActiveTab,
    search,
    setSearch,
    dateFilter,
    setDateFilter,
    requirementFilter,
    setRequirementFilter,
    page,
    pageSize: READINESS_PAGE_SIZE,
    setPage,
    allEvents,
    counts,
    filteredEvents,
    pageCount,
    visibleEvents,
    readinessReadyCount,
    needsAttentionCount,
    scheduledCount,
    blockingEvents,
    liveEvent,
    streamSetupEvent,
    liveControlEvent,
    clearFilters,
    setTab,
    runReadinessCheck,
  };
}
