export const EVENT_STATUSES = [
  "DRAFT",
  "SCHEDULED",
  "READY",
  "LIVE",
  "COMPLETED",
  "REPLAY_AVAILABLE",
] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];
