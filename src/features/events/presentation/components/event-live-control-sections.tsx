import Link from "next/link";
import { CalendarDays, CheckCircle2, CircleAlert } from "lucide-react";
import type { EventEntity } from "../../domain/entities/event.entity";
import { evaluateReadiness } from "../../domain/policies/readiness.policy";
import { EVENT_LIVE_CONTROL_PANEL_CLASS } from "../constants/event-live-control.constants";
import { formatEventDateTime, formatEventTime } from "../lib/event-view.utils";
import { getLiveControlReadinessMetrics } from "../lib/event-live-control.utils";
import { eventStatusPresentation } from "@/shared/components/feedback/event-status";
import { EmptyState } from "@/shared/components/feedback/empty-state";

export function LiveControlMetric({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <article
      className={
        EVENT_LIVE_CONTROL_PANEL_CLASS +
        " flex min-w-0 items-center gap-3 p-3.5"
      }
    >
      <span
        className={
          "grid size-12 shrink-0 place-items-center rounded-xl " + tone
        }
      >
        <Icon size={22} aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[10px] font-medium text-[#687693]">
          {label}
        </span>
        <strong className="mt-1 block text-[21px] leading-none font-bold text-[#101b43] tabular-nums">
          {value}
        </strong>
      </span>
    </article>
  );
}

function LiveControlReadinessLabel({ event }: { event: EventEntity }) {
  const ready = evaluateReadiness(event.readiness).ready;
  return (
    <span
      className={
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-semibold " +
        (ready ? "bg-[#e5fbf3] text-[#07855e]" : "bg-[#fff4e3] text-[#a96a00]")
      }
    >
      {ready ? <CheckCircle2 size={13} /> : <CircleAlert size={13} />}
      {ready ? "Ready" : "Needs setup"}
    </span>
  );
}

export function LiveControlEventRow({
  event,
  onGoLive,
  pending,
}: {
  event: EventEntity;
  onGoLive: (event: EventEntity) => void;
  pending: boolean;
}) {
  const status = eventStatusPresentation[event.status];
  let action;
  if (event.status === "LIVE") {
    action = (
      <Link
        href={"/dashboard/events/" + event.id + "/live/control"}
        className="focus-ring inline-flex min-h-9 items-center justify-center rounded-lg border border-[#dce6f5] px-3 text-[10px] font-semibold text-[#075bff] hover:bg-[#f5f9ff]"
      >
        Open Control
      </Link>
    );
  } else if (event.status === "READY") {
    action = (
      <button
        type="button"
        disabled={pending}
        onClick={() => onGoLive(event)}
        className="focus-ring inline-flex min-h-9 items-center justify-center rounded-lg bg-[#e4fbf2] px-3 text-[10px] font-semibold text-[#07855e] disabled:opacity-60"
      >
        {pending ? "Starting…" : "Go Live"}
      </button>
    );
  } else if (
    event.status === "REPLAY_AVAILABLE" ||
    event.status === "COMPLETED"
  ) {
    action = (
      <Link
        href={"/dashboard/events/" + event.id + "/replay"}
        className="focus-ring inline-flex min-h-9 items-center justify-center rounded-lg border border-[#dce6f5] px-3 text-[10px] font-semibold text-[#075bff] hover:bg-[#f5f9ff]"
      >
        View Replay
      </Link>
    );
  } else {
    action = (
      <Link
        href={"/dashboard/events/" + event.id + "/manage"}
        className="focus-ring inline-flex min-h-9 items-center justify-center rounded-lg border border-[#dce6f5] px-3 text-[10px] font-semibold text-[#075bff] hover:bg-[#f5f9ff]"
      >
        View Setup
      </Link>
    );
  }

  return (
    <tr className="border-t border-[#edf1f6] hover:bg-[#f9fbff]">
      <th scope="row" className="min-w-[190px] px-3 py-3 text-left">
        <Link
          href={"/dashboard/events/" + event.id}
          className="focus-ring block truncate rounded text-[11px] font-semibold text-[#101b43] hover:text-[#075bff]"
        >
          {event.title}
        </Link>
        {event.description && (
          <span className="mt-1 block max-w-[250px] truncate text-[9px] font-normal text-[#7483a0]">
            {event.description}
          </span>
        )}
      </th>
      <td className="px-3 py-3 text-[10px] text-[#536380]">
        <span className="block whitespace-nowrap">
          {formatEventDateTime(event.scheduledAt, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
        <span className="mt-1 block whitespace-nowrap text-[#75829b]">
          {formatEventTime(event.scheduledAt)}
        </span>
      </td>
      <td className="px-3 py-3">
        <span
          className={
            "rounded-lg px-2.5 py-1.5 text-[10px] font-semibold " +
            status.className
          }
        >
          {status.label}
        </span>
      </td>
      <td className="px-3 py-3">
        <LiveControlReadinessLabel event={event} />
      </td>
      <td className="px-3 py-3 text-right">{action}</td>
    </tr>
  );
}

export function LiveControlSystemReadiness({
  events,
}: {
  events: readonly EventEntity[];
}) {
  return (
    <section className={EVENT_LIVE_CONTROL_PANEL_CLASS + " p-4"}>
      <h2 className="text-[14px] font-bold text-[#101b43]">
        Production readiness
      </h2>
      <p className="mt-1 text-[10px] text-[#687693]">
        Based on requirements stored for your events.
      </p>
      {events.length ? (
        <ul className="mt-3 space-y-2">
          {getLiveControlReadinessMetrics(events).map(
            ({ key, title, icon: Icon, complete, percentage }) => {
              return (
                <li
                  key={key}
                  className="rounded-xl border border-[#edf1f6] px-3 py-2.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-[#edf4ff] text-[#075bff]">
                      <Icon size={15} />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[10px] font-semibold text-[#172544]">
                      {title}
                    </span>
                    <strong className="text-[10px] text-[#536380] tabular-nums">
                      {complete}/{events.length}
                    </strong>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#edf1f6]">
                    <div
                      className="h-full rounded-full bg-[#0875ff]"
                      style={{ width: percentage + "%" }}
                    />
                  </div>
                </li>
              );
            },
          )}
        </ul>
      ) : (
        <EmptyState
          size="compact"
          title="No readiness data"
          description="Requirements will be summarized when events are created."
        />
      )}
    </section>
  );
}
