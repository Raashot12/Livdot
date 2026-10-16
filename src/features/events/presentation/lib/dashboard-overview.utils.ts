import type { EventEntity } from "../../domain/entities/event.entity";
import type { EventReadiness } from "../../domain/types/event-readiness";
import { EVENT_STATUSES } from "../../domain/types/event-status";
import { evaluateReadiness } from "../../domain/policies/readiness.policy";
import { eventStatusPresentation } from "@/shared/components/feedback/event-status";
import { DASHBOARD_STATUS_COLORS } from "../constants/dashboard-overview.constants";

export function formatDashboardDate(
  value: string | null,
  options: Intl.DateTimeFormatOptions,
) {
  if (!value) return "Date to be announced";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date to be announced";
  return new Intl.DateTimeFormat("en-NG", {
    ...options,
    timeZone: "Africa/Lagos",
  }).format(date);
}

export function formatDashboardEventTime(event: EventEntity) {
  if (!event.scheduledAt) return "Time to be announced";
  return formatDashboardDate(event.scheduledAt, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function getDashboardStatusData(events: readonly EventEntity[]) {
  return EVENT_STATUSES.map((status) => ({
    status,
    name: eventStatusPresentation[status].label,
    value: events.filter((event) => event.status === status).length,
    color: DASHBOARD_STATUS_COLORS[status],
  })).filter((item) => item.value > 0);
}

export function getDashboardScheduleData(events: readonly EventEntity[]) {
  const monthCounts = new Map<
    string,
    { month: string; events: number; key: number }
  >();

  for (const event of events) {
    if (!event.scheduledAt) continue;
    const date = new Date(event.scheduledAt);
    if (Number.isNaN(date.getTime())) continue;
    const parts = new Intl.DateTimeFormat("en", {
      timeZone: "Africa/Lagos",
      year: "numeric",
      month: "numeric",
    }).formatToParts(date);
    const year = Number(parts.find((part) => part.type === "year")?.value);
    const month = Number(parts.find((part) => part.type === "month")?.value);
    const key = year * 12 + month - 1;
    const label = formatDashboardDate(event.scheduledAt, {
      month: "short",
      year: "2-digit",
    });
    const current = monthCounts.get(label);
    monthCounts.set(label, {
      month: label,
      events: (current?.events ?? 0) + 1,
      key,
    });
  }

  return [...monthCounts.values()]
    .sort((first, second) => first.key - second.key)
    .slice(-8);
}

export function getUpcomingDashboardEvents(events: readonly EventEntity[]) {
  return events
    .filter(
      (event) =>
        (event.status === "SCHEDULED" || event.status === "READY") &&
        event.scheduledAt &&
        !Number.isNaN(new Date(event.scheduledAt).getTime()),
    )
    .sort(
      (first, second) =>
        new Date(first.scheduledAt ?? 0).getTime() -
        new Date(second.scheduledAt ?? 0).getTime(),
    )
    .slice(0, 4);
}

export function getEventsBlockedByReadiness(events: readonly EventEntity[]) {
  return events.filter((event) => !evaluateReadiness(event.readiness).ready);
}

export function getRequirementCompletionCount(
  events: readonly EventEntity[],
  key: keyof EventReadiness,
) {
  return events.filter((event) => event.readiness[key]).length;
}

export function getEventReadinessCompletionCount(event: EventEntity) {
  return Object.values(event.readiness).filter(Boolean).length;
}
