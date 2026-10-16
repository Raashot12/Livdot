import type { EventStatus } from "@/features/events/domain/types/event-status";

export const eventStatusPresentation: Record<
  EventStatus,
  { label: string; className: string }
> = {
  DRAFT: { label: "Draft", className: "status-draft" },
  SCHEDULED: { label: "Scheduled", className: "status-scheduled" },
  READY: { label: "Ready", className: "status-ready" },
  LIVE: { label: "Live", className: "status-live" },
  COMPLETED: { label: "Completed", className: "status-completed" },
  REPLAY_AVAILABLE: { label: "Replay available", className: "status-replay" },
};
