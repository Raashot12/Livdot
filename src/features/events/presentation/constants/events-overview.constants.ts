import type { EventStatus } from "../../domain/types/event-status";

export const EVENTS_OVERVIEW_PAGE_SIZE = 6;

export const EVENTS_OVERVIEW_STATUS_TABS: {
  readonly value: EventStatus | "ALL";
  readonly label: string;
}[] = [
  { value: "ALL", label: "All Events" },
  { value: "DRAFT", label: "Draft" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "READY", label: "Ready" },
  { value: "LIVE", label: "Live" },
  { value: "COMPLETED", label: "Completed" },
  { value: "REPLAY_AVAILABLE", label: "Replays" },
];
