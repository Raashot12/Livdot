"use client";

import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Settings2,
  type LucideIcon,
} from "lucide-react";
import type { EventEntity } from "../../domain/entities/event.entity";
import { evaluateReadiness } from "../../domain/policies/readiness.policy";
import { panel } from "../constants/readiness-overview.constants";
import {
  eventDate,
  eventTime,
  readinessProgress,
  readinessState,
  statusLabel,
  statusStyle,
} from "../lib/readiness-overview.utils";
export function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  detail: string;
  tone: string;
}) {
  return (
    <article
      className={`${panel} flex min-w-0 items-center gap-3 px-3.5 py-3 sm:px-4`}
    >
      <span
        className={`grid size-11 shrink-0 place-items-center rounded-[12px] ${tone}`}
      >
        <Icon size={21} strokeWidth={2.2} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-medium text-[#687693]">
          {label}
        </p>
        <p className="mt-1 text-[21px] leading-none font-bold tracking-[-.035em] text-[#0b1538] tabular-nums">
          {value}
        </p>
        <p className="mt-1.5 truncate text-[10px] text-[#687693]">{detail}</p>
      </div>
    </article>
  );
}

export function ReadinessEventRow({ event }: { event: EventEntity }) {
  const state = readinessState(event);
  const progress = readinessProgress(event);
  const missing = evaluateReadiness(event.readiness).blockers.length;
  const href = `/dashboard/events/${event.id}/readiness`;
  const actionLabel =
    state === "INCOMPLETE"
      ? "Continue Setup"
      : state === "ATTENTION"
        ? "Review"
        : "View Details";

  return (
    <tr className="group border-t border-[#edf1f6] transition-colors hover:bg-[#f9fbff]">
      <td className="min-w-[220px] px-3 py-2.5">
        <Link
          href={href}
          className="focus-ring flex w-fit max-w-full items-center gap-2.5 rounded-md"
        >
          <span className="grid size-[54px] shrink-0 place-items-center rounded-[8px] bg-[#edf4ff] text-[#075bff]">
            <CalendarDays size={22} aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block max-w-[180px] truncate text-[11px] font-semibold tracking-[-.015em] text-[#0b1538]">
              {event.title}
            </span>
            <span className="mt-1 block max-w-[180px] truncate text-[9px] text-[#687693]">
              {event.description}
            </span>
          </span>
        </Link>
      </td>
      <td className="px-2.5 py-2.5 whitespace-nowrap">
        <span className="block text-[10px] font-medium text-[#243454]">
          {eventDate(event.scheduledAt)}
        </span>
        <span className="mt-1 block text-[9px] text-[#687693]">
          {eventTime(event.scheduledAt)}
        </span>
      </td>
      <td className="px-2.5 py-2.5">
        <span
          className={`inline-flex max-w-full items-center gap-1.5 rounded-[7px] px-2 py-1.5 text-[9px] font-semibold whitespace-nowrap ${statusStyle(state)}`}
        >
          {state === "READY" ? (
            <CheckCircle2 size={12} />
          ) : state === "ATTENTION" ? (
            <CircleAlert size={12} />
          ) : state === "SCHEDULED" ? (
            <Clock3 size={12} />
          ) : (
            <Settings2 size={12} />
          )}
          {statusLabel(state)}
        </span>
        {missing > 0 && state !== "INCOMPLETE" && (
          <span className="mt-1 block text-[9px] text-[#687693]">
            {missing} requirement{missing === 1 ? "" : "s"} missing
          </span>
        )}
      </td>
      <td className="min-w-[110px] px-2.5 py-2.5">
        <div className="flex items-center gap-2">
          <div
            className="h-1.5 min-w-[70px] flex-1 overflow-hidden rounded-full bg-[#e9edf4]"
            role="progressbar"
            aria-label={`${event.title} readiness`}
            aria-valuenow={progress.percentage}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span
              className={`block h-full rounded-full ${state === "READY" ? "bg-[#08bd83]" : state === "ATTENTION" ? "bg-[#f59b12]" : "bg-gradient-to-r from-[#0764ff] to-[#09b6e2]"}`}
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <span className="text-[9px] font-semibold text-[#526382] tabular-nums">
            {progress.percentage}%
          </span>
        </div>
        <span className="mt-1 block text-[9px] text-[#687693] tabular-nums">
          {progress.completed}/{progress.total} completed
        </span>
      </td>
      <td className="px-2.5 py-2.5 text-right">
        <Link
          href={href}
          className="focus-ring inline-flex min-h-9 items-center justify-center rounded-lg border border-[#e1e8f2] px-2.5 text-[9px] font-semibold whitespace-nowrap text-[#075bff] hover:bg-[#f7faff] sm:px-3"
        >
          {actionLabel}
        </Link>
      </td>
    </tr>
  );
}
