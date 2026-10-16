import type { EventEntity } from "../../domain/entities/event.entity";
import type { EventStatus } from "../../domain/types/event-status";

export type EventsOverviewStatus = EventStatus | "ALL";

export function getVisibleEvents(
  events: readonly EventEntity[],
  filters: {
    readonly query: string;
    readonly activeStatus: EventsOverviewStatus;
    readonly filterStatus: EventsOverviewStatus;
    readonly sortByDate: boolean;
  },
) {
  const normalizedQuery = filters.query.trim().toLocaleLowerCase();
  const visibleEvents = events.filter((event) => {
    const matchesText = `${event.title} ${event.description} ${event.status}`
      .toLocaleLowerCase()
      .includes(normalizedQuery);
    return (
      matchesText &&
      (filters.activeStatus === "ALL" ||
        event.status === filters.activeStatus) &&
      (filters.filterStatus === "ALL" || event.status === filters.filterStatus)
    );
  });

  if (filters.sortByDate) {
    visibleEvents.sort((a, b) => {
      const dateA = a.scheduledAt
        ? new Date(a.scheduledAt).getTime()
        : Infinity;
      const dateB = b.scheduledAt
        ? new Date(b.scheduledAt).getTime()
        : Infinity;
      return dateA - dateB;
    });
  }

  return visibleEvents;
}

export function countEventsByStatus(
  events: readonly EventEntity[],
  status: EventStatus,
) {
  return events.filter((event) => event.status === status).length;
}

export function countEventsByStatuses(
  events: readonly EventEntity[],
  statuses: readonly EventStatus[],
) {
  return events.filter((event) => statuses.includes(event.status)).length;
}

export function countCompletedReadiness(event: EventEntity) {
  return Object.values(event.readiness).filter(Boolean).length;
}
