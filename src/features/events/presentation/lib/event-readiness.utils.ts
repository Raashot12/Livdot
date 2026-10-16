import type { EventEntity } from "../../domain/entities/event.entity";
import { EVENT_READINESS_ITEMS } from "../constants/event-readiness.constants";

export function getEventReadinessProgress(event: EventEntity) {
  const complete = EVENT_READINESS_ITEMS.filter(
    (item) => event.readiness[item.key],
  ).length;

  return {
    complete,
    total: EVENT_READINESS_ITEMS.length,
    percentage: Math.round((complete / EVENT_READINESS_ITEMS.length) * 100),
  };
}
