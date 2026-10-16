"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, ChevronRight } from "lucide-react";
import { useEvent } from "../../application/hooks/use-event";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { LoadingState } from "@/shared/components/feedback/loading-state";
import {
  EVENT_CREW_STREAMING_TABS,
  type EventCrewStreamingTab,
} from "../constants/event-crew-streaming.constants";
import { EventCrewStreamingTabContent } from "../components/event-crew-streaming-sections";
import { formatEventDateTime } from "../lib/event-view.utils";

export function EventCrewStreamingPage({
  eventId,
  initialTab = "overview",
}: {
  readonly eventId: string;
  readonly initialTab?: string;
}) {
  const {
    data: event,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useEvent(eventId);
  const initial =
    EVENT_CREW_STREAMING_TABS.find((tab) => tab.id === initialTab)?.id ??
    "overview";
  const [activeTab, setActiveTab] = useState<EventCrewStreamingTab>(initial);
  useEffect(() => {
    setActiveTab(initial);
  }, [initial]);
  if (isPending)
    return <LoadingState label="Loading crew and streaming" rows={5} />;
  if (isError || !event)
    return (
      <ErrorState
        title="Crew & streaming could not be loaded"
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
    <div className="min-w-0 space-y-3.5 pb-5">
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
        <ChevronRight size={13} aria-hidden="true" />
        <Link
          href={"/dashboard/events/" + event.id}
          className="max-w-[220px] truncate hover:text-[#075bff]"
        >
          {event.title}
        </Link>
        <ChevronRight size={13} aria-hidden="true" />
        <span aria-current="page" className="font-medium text-[#253454]">
          Crew &amp; Streaming
        </span>
      </nav>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[26px] leading-tight font-bold tracking-[-.045em] text-[#101b43] sm:text-[31px]">
            Crew &amp; Streaming
          </h1>
          <p className="mt-1 text-[12px] text-[#61708e]">
            Production details for {event.title}.
          </p>
          <div className="mt-2 inline-flex items-center gap-2 text-[10px] text-[#687693]">
            <CalendarDays size={14} aria-hidden="true" />
            {formatEventDateTime(event.scheduledAt, {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
            <span className="mx-1">·</span>
            <span>{event.status.replaceAll("_", " ")}</span>
          </div>
        </div>
        <Link
          href={"/dashboard/events/" + event.id}
          className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#dce5f2] bg-white px-3.5 text-[11px] font-semibold text-[#075bff] hover:bg-[#f7faff]"
        >
          View event <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </header>
      <div className="overflow-x-auto border-b border-[#e3e9f2]">
        <div
          role="tablist"
          aria-label="Crew and streaming sections"
          className="flex min-w-max items-center gap-1"
        >
          {EVENT_CREW_STREAMING_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={
                "focus-ring min-h-10 border-b-[3px] px-4 text-[10px] font-medium transition-colors sm:px-5 sm:text-[11px] " +
                (activeTab === tab.id
                  ? "border-[#075bff] text-[#075bff]"
                  : "border-transparent text-[#536380] hover:bg-white/70 hover:text-[#075bff]")
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <EventCrewStreamingTabContent tab={activeTab} event={event} />
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
