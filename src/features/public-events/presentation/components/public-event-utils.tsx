import { CalendarDays, Clock3 } from "lucide-react";
import type { EventEntity } from "@/features/events/domain/entities/event.entity";

export const PUBLIC_EVENT_STATUSES = [
  "SCHEDULED",
  "READY",
  "LIVE",
  "COMPLETED",
  "REPLAY_AVAILABLE",
] as const;

export function isPublicEvent(event: EventEntity) {
  return (PUBLIC_EVENT_STATUSES as readonly string[]).includes(event.status);
}

export function formatEventDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(date);
}

export function formatEventTime(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-NG", { timeStyle: "short" }).format(date);
}

export function eventStatusLabel(status: EventEntity["status"]) {
  switch (status) {
    case "REPLAY_AVAILABLE":
      return "Replay available";
    case "READY":
      return "Ready";
    default:
      return status.charAt(0) + status.slice(1).toLowerCase();
  }
}

const statusClass: Record<EventEntity["status"], string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  SCHEDULED: "bg-blue-50 text-blue-700",
  READY: "bg-emerald-50 text-emerald-700",
  LIVE: "bg-rose-50 text-rose-700",
  COMPLETED: "bg-slate-100 text-slate-600",
  REPLAY_AVAILABLE: "bg-violet-50 text-violet-700",
};

export function EventStatusPill({ event }: { readonly event: EventEntity }) {
  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-full px-2.5 text-xs font-semibold ${statusClass[event.status]}`}
    >
      {eventStatusLabel(event.status)}
    </span>
  );
}

export function EventDateTime({
  event,
  className = "",
}: {
  readonly event: EventEntity;
  readonly className?: string;
}) {
  const date = formatEventDate(event.scheduledAt);
  const time = formatEventTime(event.scheduledAt);

  return (
    <div
      className={`flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#52617f] ${className}`}
    >
      <span className="inline-flex items-center gap-2">
        <CalendarDays
          size={17}
          className="shrink-0 text-[#075bff]"
          aria-hidden="true"
        />
        {date ?? "Date to be announced"}
      </span>
      {time && (
        <span className="inline-flex items-center gap-2">
          <Clock3
            size={17}
            className="shrink-0 text-[#075bff]"
            aria-hidden="true"
          />
          {time} <span className="text-[#8995ab]">your local time</span>
        </span>
      )}
    </div>
  );
}
