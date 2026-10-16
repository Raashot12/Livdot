import type { EventEntity } from "../../domain/entities/event.entity";
import {
  EVENT_LIVE_CONTROL_REQUIREMENTS,
  type EventLiveControlFilterStatus,
} from "../constants/event-live-control.constants";

export function filterLiveControlEvents(
  events: readonly EventEntity[],
  status: EventLiveControlFilterStatus,
  query: string,
) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  return events.filter(
    (event) =>
      (status === "ALL" || event.status === status) &&
      (event.title + " " + event.description)
        .toLocaleLowerCase()
        .includes(normalizedQuery),
  );
}

export function countLiveControlEvents(
  events: readonly EventEntity[],
  status: EventLiveControlFilterStatus,
) {
  return status === "ALL"
    ? events.length
    : events.filter((event) => event.status === status).length;
}

export function getLiveControlSummary(
  events: readonly EventEntity[],
  currentEventId: string,
) {
  const readyEvents = events.filter((event) => event.status === "READY");
  return {
    live: events.filter((event) => event.status === "LIVE").length,
    ready: readyEvents.length,
    scheduled: events.filter((event) => event.status === "SCHEDULED").length,
    streamingConfigured: events.filter(
      (event) => event.readiness.ingestConfigured,
    ).length,
    reviewReadyEventId:
      readyEvents.find((event) => event.id === currentEventId)?.id ??
      readyEvents[0]?.id,
  };
}

export function getLiveControlReadinessMetrics(events: readonly EventEntity[]) {
  return EVENT_LIVE_CONTROL_REQUIREMENTS.map((requirement) => {
    const complete = events.filter(
      (event) => event.readiness[requirement.key],
    ).length;
    return {
      ...requirement,
      complete,
      percentage: events.length
        ? Math.round((complete / events.length) * 100)
        : 0,
    };
  });
}
