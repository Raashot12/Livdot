import type { EventEntity } from "../entities/event.entity";
import { evaluateReadiness } from "./readiness.policy";
import type { EventStatus } from "../types/event-status";

const NEXT_STATUS: Partial<Record<EventStatus, EventStatus>> = {
  DRAFT: "SCHEDULED",
  SCHEDULED: "READY",
  READY: "LIVE",
  LIVE: "COMPLETED",
  COMPLETED: "REPLAY_AVAILABLE",
};

export type TransitionResult =
  | {
      readonly allowed: true;
      readonly from: EventStatus;
      readonly to: EventStatus;
    }
  | {
      readonly allowed: false;
      readonly reason: "INVALID_TRANSITION" | "READINESS_BLOCKED";
      readonly from: EventStatus;
      readonly to: EventStatus;
      readonly blockers: readonly string[];
    };

export function evaluateTransition(
  event: EventEntity,
  target: EventStatus,
): TransitionResult {
  if (NEXT_STATUS[event.status] !== target) {
    return {
      allowed: false,
      reason: "INVALID_TRANSITION",
      from: event.status,
      to: target,
      blockers: [`${event.status} cannot transition to ${target}`],
    };
  }
  if (event.status === "SCHEDULED" && target === "READY") {
    const readiness = evaluateReadiness(event.readiness);
    if (!readiness.ready)
      return {
        allowed: false,
        reason: "READINESS_BLOCKED",
        from: event.status,
        to: target,
        blockers: readiness.blockers.map((item) => item.message),
      };
  }
  return { allowed: true, from: event.status, to: target };
}
