import type { EventStatus } from "../../domain/types/event-status";

export type EventFilter =
  "ALL" | "LIVE" | "READY" | "SCHEDULED" | "ATTENTION" | "COMPLETED";
export type DateFilter = "ALL" | "UPCOMING" | "PAST";

export const CREW_PAGE_SIZE = 5;
export const CREW_MODULE_STARTED_AT = Date.now();
export const panel =
  "rounded-[13px] border border-[#e5ebf4] bg-white shadow-[0_3px_14px_rgba(18,44,78,.025)]";

export const tabs: { value: EventFilter; label: string }[] = [
  { value: "ALL", label: "All Events" },
  { value: "LIVE", label: "Live Now" },
  { value: "READY", label: "Ready" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "ATTENTION", label: "Needs Attention" },
  { value: "COMPLETED", label: "Completed" },
];

export const statusOptions: { value: EventStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All Statuses" },
  { value: "LIVE", label: "Live" },
  { value: "READY", label: "Ready" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "DRAFT", label: "Draft" },
  { value: "COMPLETED", label: "Completed" },
  { value: "REPLAY_AVAILABLE", label: "Replay available" },
];
