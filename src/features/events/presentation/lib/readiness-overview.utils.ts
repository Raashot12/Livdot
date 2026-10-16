import type { EventEntity } from "../../domain/entities/event.entity";
import { evaluateReadiness } from "../../domain/policies/readiness.policy";
import type {
  ReadinessState,
  RequirementKey,
} from "../constants/readiness-overview.constants";
import { requirementItems } from "../constants/readiness-overview.constants";

export function readinessState(event: EventEntity): ReadinessState {
  if (event.status === "DRAFT") return "INCOMPLETE";
  if (!evaluateReadiness(event.readiness).ready) return "ATTENTION";
  if (event.status === "SCHEDULED") return "SCHEDULED";
  return "READY";
}

export function readinessProgress(event: EventEntity) {
  const completed = requirementItems.filter(
    (item) => event.readiness[item.key],
  ).length;
  return {
    completed,
    total: requirementItems.length,
    percentage: Math.round((completed / requirementItems.length) * 100),
  };
}

export function requirementCompletionCount(
  events: readonly EventEntity[],
  key: RequirementKey,
) {
  return events.filter((event) => event.readiness[key]).length;
}

export function eventDate(value: string | null) {
  if (!value) return "Date to be confirmed";
  return new Intl.DateTimeFormat("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Africa/Lagos",
  }).format(new Date(value));
}

export function eventTime(value: string | null) {
  if (!value) return "Time TBD";
  return `${new Intl.DateTimeFormat("en-NG", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Africa/Lagos",
  }).format(new Date(value))} (WAT)`;
}

export function blockerLabel(event: EventEntity) {
  const blocker = evaluateReadiness(event.readiness).blockers[0];
  switch (blocker?.code) {
    case "CREW_NOT_ASSIGNED":
      return "Production crew not assigned";
    case "INGEST_NOT_CONFIGURED":
      return "Streaming ingest not configured";
    case "TICKET_PRICING_NOT_CONFIGURED":
      return "Ticket pricing not configured";
    default:
      return "Readiness requirements incomplete";
  }
}

export function statusStyle(status: ReadinessState) {
  switch (status) {
    case "READY":
      return "bg-[#e5fbf3] text-[#07855e]";
    case "ATTENTION":
      return "bg-[#fff3df] text-[#ad6800]";
    case "SCHEDULED":
      return "bg-[#eaf2ff] text-[#075bff]";
    case "INCOMPLETE":
      return "bg-[#f0f3f8] text-[#5d6e8c]";
  }
}

export function statusLabel(status: ReadinessState) {
  switch (status) {
    case "READY":
      return "Ready";
    case "ATTENTION":
      return "Needs Attention";
    case "SCHEDULED":
      return "Scheduled";
    case "INCOMPLETE":
      return "Incomplete";
  }
}
