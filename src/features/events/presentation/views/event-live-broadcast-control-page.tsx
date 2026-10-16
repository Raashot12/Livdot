"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  ExternalLink,
  Radio,
  Users,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { useEvent } from "../../application/hooks/use-event";
import { useTransitionEvent } from "../../application/hooks/use-transition-event";
import { evaluateReadiness } from "../../domain/policies/readiness.policy";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { LoadingState } from "@/shared/components/feedback/loading-state";
import { EventLiveBroadcastDataPanel } from "../components/event-live-broadcast-control-sections";
import { formatEventDateTime } from "../lib/event-view.utils";

export function EventLiveBroadcastControlPage({
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
  const transition = useTransitionEvent();
  if (isPending)
    return <LoadingState label="Loading live broadcast control" rows={5} />;
  if (isError || !event)
    return (
      <ErrorState
        title="Live broadcast could not be loaded"
        description={
          error instanceof Error
            ? error.message
            : "The event service could not complete the request."
        }
        retry={() => void refetch()}
        isRetrying={isFetching}
      />
    );

  const currentEvent = event;
  const readiness = evaluateReadiness(currentEvent.readiness);
  async function markLive() {
    try {
      await transition.mutateAsync({
        id: currentEvent.id,
        target: "LIVE",
        expectedVersion: currentEvent.version,
      });
      toast.success("Event status updated to Live");
    } catch (cause) {
      toast.error("Event could not be marked live", {
        description:
          cause instanceof Error
            ? cause.message
            : "Check event readiness and try again.",
      });
    }
  }

  return (
    <div className="min-w-0 space-y-3.5 pb-5">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-2 text-[11px] text-[#687693]"
      >
        <Link
          href="/dashboard/live-control"
          className="text-[#075bff] hover:underline"
        >
          Live Control
        </Link>
        <span aria-hidden="true">›</span>
        <span className="max-w-[240px] truncate font-medium text-[#253454]">
          {event.title}
        </span>
      </nav>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-16 shrink-0 place-items-center rounded-xl bg-[radial-gradient(ellipse_at_80%_5%,rgba(0,196,220,.45),transparent_48%),linear-gradient(125deg,#061837,#075baf)] text-white">
            <Radio size={26} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="max-w-[70vw] truncate text-[22px] font-bold tracking-[-.04em] text-[#101b43] sm:text-[28px]">
                {event.title}
              </h1>
              <span
                className={
                  "rounded-full px-2.5 py-1 text-[10px] font-semibold " +
                  (event.status === "LIVE"
                    ? "bg-[#fff0f1] text-[#d93038]"
                    : "bg-[#edf4ff] text-[#075bff]")
                }
              >
                {event.status.replaceAll("_", " ")}
              </span>
            </div>
            <p className="mt-1 truncate text-[11px] text-[#687693]">
              {event.description || "No event description has been added."}
            </p>
            <span className="mt-2 inline-flex items-center gap-1.5 text-[10px] text-[#536380]">
              <CalendarDays size={14} aria-hidden="true" />
              {formatEventDateTime(event.scheduledAt, {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/events/${encodeURIComponent(event.id)}`}
            className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#dce5f2] bg-white px-3.5 text-[11px] font-semibold text-[#075bff] hover:bg-[#f7faff]"
          >
            View Event Page <ExternalLink size={14} aria-hidden="true" />
          </Link>
          {event.status === "READY" && readiness.ready && (
            <button
              type="button"
              disabled={transition.isPending}
              onClick={() => void markLive()}
              className="focus-ring brand-gradient inline-flex min-h-10 items-center gap-2 rounded-xl px-4 text-[11px] font-semibold text-white disabled:opacity-60"
            >
              <Radio size={14} aria-hidden="true" />
              {transition.isPending ? "Updating…" : "Mark Live"}
            </button>
          )}
        </div>
      </header>
      {event.status === "LIVE" && (
        <div className="flex items-center gap-2 rounded-xl border border-[#c8f2df] bg-[#e8faf2] px-3.5 py-3 text-[11px] text-[#087958]">
          <CheckCircle2 size={17} aria-hidden="true" />
          <span>
            The event service currently reports this event as live. Stream
            playback and telemetry are unavailable until a provider is
            connected.
          </span>
        </div>
      )}
      {!readiness.ready && (
        <Link
          href={"/dashboard/events/" + event.id + "/readiness"}
          className="focus-ring flex items-center gap-2 rounded-xl border border-[#f5d9a7] bg-[#fff8eb] px-3.5 py-3 text-[11px] text-[#95610a] hover:bg-[#fff4dc]"
        >
          <CircleAlert size={16} aria-hidden="true" />
          <span className="min-w-0 flex-1">
            This event has incomplete readiness requirements.
          </span>
          <span className="font-semibold">Review</span>
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      )}

      <div className="grid min-w-0 items-start gap-3.5 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,.85fr)]">
        <div className="min-w-0 space-y-3.5">
          <EventLiveBroadcastDataPanel
            icon={Video}
            title="Broadcast preview"
            description="Live video and player controls will appear when the streaming provider is connected."
          />
          <div className="grid min-w-0 gap-3.5 sm:grid-cols-2">
            <EventLiveBroadcastDataPanel
              icon={Radio}
              title="Scenes and sources"
              description="Broadcast scenes and connected input sources will appear when configured."
            />
            <EventLiveBroadcastDataPanel
              icon={Users}
              title="Live chat"
              description="Audience messages will appear after live chat is connected."
            />
          </div>
        </div>
        <aside className="min-w-0 space-y-3.5">
          <EventLiveBroadcastDataPanel
            icon={Radio}
            title="Stream health"
            description="Bitrate, latency, dropped frames, and recording status need a connected telemetry source."
          />
          <EventLiveBroadcastDataPanel
            icon={Users}
            title="Audience"
            description="Live viewer counts and audience activity are not available from the current event service."
          />
          <EventLiveBroadcastDataPanel
            icon={Users}
            title="Crew communication"
            description="Production crew and internal messages will appear when team communication is connected."
          />
        </aside>
      </div>
    </div>
  );
}
