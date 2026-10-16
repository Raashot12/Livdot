import type { EventEntity } from "../../domain/entities/event.entity";
import type {
  EventFilter,
  DateFilter,
} from "../constants/crew-streaming-overview.constants";

export function dateLabel(value: string | null) {
  if (!value) return "Date to be confirmed";
  return new Intl.DateTimeFormat("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Africa/Lagos",
  }).format(new Date(value));
}

export function timeLabel(value: string | null) {
  if (!value) return "Time to be set (WAT)";
  return `${new Intl.DateTimeFormat("en-NG", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Africa/Lagos",
  }).format(new Date(value))} (WAT)`;
}

export function needsSetup(event: EventEntity) {
  if (event.status === "COMPLETED" || event.status === "REPLAY_AVAILABLE") {
    return false;
  }
  return !event.readiness.crewAssigned || !event.readiness.ingestConfigured;
}

export function hasReplay(event: EventEntity) {
  return event.status === "COMPLETED" || event.status === "REPLAY_AVAILABLE";
}

export function eventHref(event: EventEntity) {
  return `/dashboard/events/${event.id}`;
}

export function crewHref(event: EventEntity, tab?: "streaming" | "incidents") {
  return `/dashboard/events/${event.id}/crew${tab ? `?tab=${tab}` : ""}`;
}

export function primaryAction(event: EventEntity) {
  if (hasReplay(event)) {
    return {
      label: "View Replay",
      href: `/dashboard/events/${event.id}/replay`,
    };
  }
  if (needsSetup(event)) {
    const missingIngest = !event.readiness.ingestConfigured;
    return {
      label: "Continue Setup",
      href: crewHref(
        event,
        missingIngest || !event.readiness.crewAssigned
          ? "streaming"
          : undefined,
      ),
    };
  }
  return { label: "Manage", href: crewHref(event) };
}

export function matchesFilter(event: EventEntity, filter: EventFilter) {
  if (filter === "ALL") return true;
  if (filter === "ATTENTION") return needsSetup(event);
  if (filter === "COMPLETED") return hasReplay(event);
  if (filter === "SCHEDULED") return event.status === "SCHEDULED";
  return event.status === filter;
}

export function isInDateRange(event: EventEntity, range: DateFilter) {
  if (range === "ALL" || !event.scheduledAt) return range === "ALL";
  const eventTime = new Date(event.scheduledAt).getTime();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return range === "UPCOMING"
    ? eventTime >= today.getTime()
    : eventTime < today.getTime();
}
