"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ExternalLink,
  PlaySquare,
} from "lucide-react";
import { useEvent } from "../../application/hooks/use-event";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { LoadingState } from "@/shared/components/feedback/loading-state";
import { formatEventDateTime } from "../lib/event-view.utils";

const panel =
  "rounded-[14px] border border-[#e5ebf4] bg-white shadow-[0_3px_14px_rgba(18,44,78,.025)]";

export function EventReplayManagementPage({
  eventId,
}: {
  readonly eventId: string;
}) {
  const {
    data: event,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useEvent(eventId);
  if (isPending)
    return <LoadingState label="Loading replay details" rows={4} />;
  if (isError || !event)
    return (
      <ErrorState
        title="Replay details could not be loaded"
        description={
          error instanceof Error
            ? error.message
            : "The event service could not complete the request."
        }
        retry={() => void refetch()}
        isRetrying={isFetching}
      />
    );

  return (
    <div className="min-w-0 space-y-4 pb-5">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-2 text-[11px] text-[#687693]"
      >
        <Link
          href="/dashboard/events"
          className="text-[#075bff] hover:underline"
        >
          Events
        </Link>
        <span aria-hidden="true">›</span>
        <Link
          href={`/dashboard/events/${event.id}`}
          className="max-w-[220px] truncate hover:text-[#075bff]"
        >
          {event.title}
        </Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page" className="font-medium text-[#253454]">
          Replay Management
        </span>
      </nav>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[28px] leading-tight font-bold tracking-[-.05em] text-[#101b43] sm:text-[32px]">
            Replay Management
          </h1>
          <p className="mt-1 text-[12px] text-[#61708e]">
            Recorded video, viewer access, and playback details for{" "}
            {event.title}.
          </p>
        </div>
        <Link
          href={`/dashboard/events/${event.id}`}
          className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#dce5f2] bg-white px-3.5 text-[11px] font-semibold text-[#075bff] hover:bg-[#f7faff]"
        >
          Event overview <ExternalLink size={14} aria-hidden="true" />
        </Link>
      </header>
      <section
        className={`${panel} flex flex-wrap items-center gap-3 p-3.5 sm:p-4`}
      >
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#edf4ff] text-[#075bff]">
          <CalendarDays size={21} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <strong className="block truncate text-[13px] font-semibold text-[#14213e]">
            {event.title}
          </strong>
          <span className="mt-1 block text-[10px] text-[#687693]">
            {formatEventDateTime(event.scheduledAt, {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </span>
        <span className="rounded-full bg-[#f1f4f8] px-2.5 py-1 text-[10px] font-semibold text-[#566682]">
          {event.status.replaceAll("_", " ")}
        </span>
      </section>
      <section className={`${panel} p-4 sm:p-6`}>
        <EmptyState
          icon={<PlaySquare size={24} strokeWidth={1.8} />}
          title="No recording is available"
          description="Recorded video, replay access settings, recording details, and playback statistics will appear when a replay asset is connected to this event."
          action={{
            label: "Return to event",
            href: `/dashboard/events/${event.id}`,
          }}
          secondaryAction={{
            label: "Open Live Control",
            href: `/dashboard/events/${event.id}/live`,
          }}
          className="border-0 bg-transparent"
        />
      </section>
      <Link
        href="/dashboard/events"
        className="focus-ring inline-flex items-center gap-1.5 rounded text-[11px] font-medium text-[#687693] hover:text-[#075bff]"
      >
        <ArrowRight size={13} className="rotate-180" aria-hidden="true" /> Back
        to Events
      </Link>
    </div>
  );
}
