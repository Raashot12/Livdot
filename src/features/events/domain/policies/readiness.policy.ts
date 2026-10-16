import type {
  EventReadiness,
  ReadinessBlocker,
} from "../types/event-readiness";

export type ReadinessResult =
  | { readonly ready: true; readonly blockers: readonly [] }
  | { readonly ready: false; readonly blockers: readonly ReadinessBlocker[] };

export function evaluateReadiness(readiness: EventReadiness): ReadinessResult {
  const blockers: ReadinessBlocker[] = [];
  if (!readiness.crewAssigned)
    blockers.push({
      code: "CREW_NOT_ASSIGNED",
      message: "Assign production crew",
    });
  if (!readiness.ingestConfigured)
    blockers.push({
      code: "INGEST_NOT_CONFIGURED",
      message: "Configure streaming ingest",
    });
  if (!readiness.ticketPricingConfigured)
    blockers.push({
      code: "TICKET_PRICING_NOT_CONFIGURED",
      message: "Configure ticket pricing",
    });
  return blockers.length === 0
    ? { ready: true, blockers: [] }
    : { ready: false, blockers };
}
