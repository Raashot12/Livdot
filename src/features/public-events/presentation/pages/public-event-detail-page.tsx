"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  Image as ImageIcon,
  MapPin,
  Music2,
  Share2,
  Ticket,
} from "lucide-react";
import { useEvent } from "@/features/events/application/hooks/use-event";
import { EventApplicationError } from "@/features/events/application/errors/event-application.error";
import type { EventEntity } from "@/features/events/domain/entities/event.entity";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import {
  EventStatusPill,
  formatEventDate,
  formatEventTime,
  isPublicEvent,
} from "../components/public-event-utils";
import {
  PublicLoadingState,
  PublicRequestError,
} from "../components/public-query-states";
import { configuredSeatMap, formatMoney } from "../lib/public-checkout";
import { usePublicScrollReveal } from "../hooks/use-public-scroll-reveal";
import { usePageIntro } from "@/shared/hooks/use-page-intro";

const eventSections = [
  { id: "overview", label: "Overview" },
  { id: "schedule", label: "Schedule" },
  { id: "artists", label: "Artists" },
  { id: "tickets", label: "Ticket options" },
  { id: "venue", label: "Venue" },
  { id: "faq", label: "FAQ" },
] as const;

function HeroEventMeta({ event }: { readonly event: EventEntity }) {
  const date = formatEventDate(event.scheduledAt);
  const time = formatEventTime(event.scheduledAt);

  return (
    <div className="mt-6 flex flex-wrap gap-x-7 gap-y-3 text-sm text-white/90">
      <span className="inline-flex items-center gap-2.5">
        <CalendarDays size={20} className="shrink-0" aria-hidden="true" />
        <span>
          {date ?? "Date to be announced"}
          {time && (
            <span className="mt-0.5 block text-xs text-white/70">
              {time} · your local time
            </span>
          )}
        </span>
      </span>
      <span className="inline-flex items-center gap-2.5">
        <MapPin size={20} className="shrink-0" aria-hidden="true" />
        <span>Venue to be announced</span>
      </span>
      <span className="inline-flex items-center gap-2.5">
        <Music2 size={20} className="shrink-0" aria-hidden="true" />
        <span>
          {event.status === "LIVE" ? "Live event" : "Event details on LIV DOT"}
        </span>
      </span>
    </div>
  );
}

function ShareEventButton({ title }: { readonly title: string }) {
  const [label, setLabel] = useState("Share event");

  async function shareEvent() {
    try {
      if (navigator.share) {
        await navigator.share({ title, url: window.location.href });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setLabel("Link copied");
        window.setTimeout(() => setLabel("Share event"), 1800);
      }
    } catch {
      setLabel("Share event");
    }
  }

  return (
    <button
      type="button"
      onClick={() => void shareEvent()}
      className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] border border-white/60 bg-[#061a35]/55 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
    >
      <Share2 size={17} aria-hidden="true" />
      {label}
    </button>
  );
}

function EventSectionTabs({
  activeSection,
  onSelect,
}: {
  readonly activeSection: string;
  readonly onSelect: (section: string) => void;
}) {
  return (
    <nav
      aria-label="Event sections"
      className="sticky top-[62px] z-30 border-b border-[#e3ebf5] bg-white"
    >
      <div className="mx-auto flex max-w-[1536px] gap-1 overflow-x-auto px-5 sm:px-8 lg:px-12">
        {eventSections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            aria-current={activeSection === section.id ? "location" : undefined}
            onClick={() => onSelect(section.id)}
            className={`focus-ring relative inline-flex min-h-[50px] shrink-0 items-center px-3 text-sm font-semibold transition-colors after:absolute after:right-3 after:bottom-0 after:left-3 after:h-[3px] after:rounded-full after:transition-colors ${activeSection === section.id ? "text-[#087cf0] after:bg-[#087cf0]" : "text-[#50617f] after:bg-transparent hover:text-[#087cf0]"}`}
          >
            {section.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

function TicketAvailabilityCard({ event }: { readonly event: EventEntity }) {
  const seatMap = configuredSeatMap(event);
  const tickets = event.ticketOptions ?? [];
  const available = Boolean(seatMap || tickets.length > 0);

  return (
    <section
      id="tickets"
      aria-labelledby="tickets-heading"
      className="scroll-mt-[124px] rounded-[16px] border border-[#e3ebf5] bg-white p-5 shadow-[0_12px_32px_rgba(11,21,56,.09)] sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          id="tickets-heading"
          className="text-xl font-bold tracking-[-.025em] text-[#0b1538]"
        >
          Get your tickets
        </h2>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#f1f5fb] px-2.5 py-1 text-[11px] font-semibold text-[#5b6880]">
          <Ticket size={13} aria-hidden="true" />
          {seatMap
            ? "Seat map"
            : available
              ? "Tickets available"
              : "Not available"}
        </span>
      </div>

      {seatMap ? (
        <div className="mt-4 rounded-[12px] border border-[#d6e2f1] bg-[#f8fbff] p-4">
          <p className="text-sm font-semibold text-[#162545]">
            Interactive seating
          </p>
          <p className="mt-1 text-xs leading-5 text-[#5b6880]">
            {seatMap.blocks.reduce(
              (count, block) =>
                count + block.seats.filter((seat) => seat.salable).length,
              0,
            )}{" "}
            seats available across {seatMap.blocks.length} sections.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {seatMap.blocks.slice(0, 4).map((block) => (
              <span
                key={String(block.id)}
                className="rounded-full border border-[#dce7f5] bg-white px-2.5 py-1 text-[11px] font-medium text-[#52617f]"
              >
                {block.title}
                {block.price !== undefined
                  ? ` · ${formatMoney(block.price, block.currency ?? "NGN")}`
                  : ""}
              </span>
            ))}
          </div>
        </div>
      ) : tickets.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {tickets.slice(0, 4).map((ticket) => (
            <li
              key={ticket.id}
              className="flex items-center justify-between gap-3 rounded-[10px] border border-[#e4ebf4] bg-[#fbfdff] px-3.5 py-3"
            >
              <span className="min-w-0">
                <strong className="block truncate text-sm text-[#162545]">
                  {ticket.name}
                </strong>
                {ticket.description && (
                  <span className="mt-0.5 block truncate text-[11px] text-[#687693]">
                    {ticket.description}
                  </span>
                )}
              </span>
              <span className="shrink-0 text-sm font-bold text-[#162545]">
                {formatMoney(ticket.price, ticket.currency ?? "NGN")}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4 rounded-[12px] border border-dashed border-[#d6e2f1] bg-[#f8fbff] px-5 py-6 text-center">
          <span className="mx-auto grid size-11 place-items-center rounded-xl bg-white text-[#087cf0] shadow-[0_5px_14px_rgba(11,21,56,.06)]">
            <Ticket size={21} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <h3 className="mt-3 text-sm font-bold text-[#162545]">
            Ticket options aren’t published
          </h3>
          <p className="mx-auto mt-1.5 max-w-[34ch] text-xs leading-5 text-[#5b6880]">
            Ticket types and prices will appear here after the host publishes
            them.
          </p>
        </div>
      )}

      <Link
        href={`/checkout/${encodeURIComponent(event.id)}`}
        className={`focus-ring mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[10px] px-4 text-sm font-semibold transition-colors ${available ? "bg-[#087cf0] text-white shadow-[0_5px_16px_rgba(0,98,220,.18)] hover:bg-[#006ee0]" : "bg-[#e9eef5] text-[#687693] hover:bg-[#dfe8f3]"}`}
      >
        {seatMap
          ? "Select seats"
          : available
            ? "Choose tickets"
            : "View ticket options"}
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
      <p className="mt-3 text-center text-xs leading-5 text-[#687693]">
        {available
          ? "Payment is simulated in the next step; no real charge is made."
          : "No tickets or payment have been created."}
      </p>
    </section>
  );
}

function DetailPlaceholder({
  title,
  description,
  icon,
}: {
  readonly title: string;
  readonly description: string;
  readonly icon: React.ReactNode;
}) {
  return (
    <section className="rounded-[14px] border border-[#e4ebf4] bg-white p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#edf5ff] text-[#087cf0]">
          {icon}
        </span>
        <div>
          <h2 className="text-base font-bold tracking-[-.02em] text-[#0b1538]">
            {title}
          </h2>
          <p className="mt-1 text-sm leading-6 text-[#52617f]">{description}</p>
        </div>
      </div>
    </section>
  );
}

export function PublicEventDetailPage({
  eventId,
}: {
  readonly eventId: string;
}) {
  const { data: event, isPending, isError, error, refetch } = useEvent(eventId);
  const mainRef = useRef<HTMLElement | null>(null);
  const [activeSection, setActiveSection] = useState("overview");
  usePublicScrollReveal(mainRef, event?.id);
  usePageIntro(mainRef, event?.id);

  if (isPending) {
    return (
      <main className="mx-auto min-h-[70vh] w-full max-w-[1440px] px-5 pt-8 pb-16 sm:px-8 lg:px-12">
        <PublicLoadingState label="Loading event details" variant="page" />
      </main>
    );
  }
  if (isError || !event) {
    const isNotFound =
      !isError ||
      (error instanceof EventApplicationError && error.code === "NOT_FOUND");
    return (
      <main className="mx-auto min-h-[70vh] w-full max-w-[1440px] px-5 pt-8 pb-16 sm:px-8 lg:px-12">
        <PublicRequestError
          title={
            isNotFound
              ? "This event could not be found"
              : "Event details could not be loaded"
          }
          description={
            isNotFound
              ? "This event may have been removed, or the link may be incorrect."
              : undefined
          }
          onRetry={() => void refetch()}
        />
      </main>
    );
  }
  if (!isPublicEvent(event)) {
    return (
      <main className="mx-auto min-h-[70vh] w-full max-w-[1440px] px-5 pt-8 pb-16 sm:px-8 lg:px-12">
        <EmptyState
          title="This event isn’t public yet"
          description="The host hasn’t published this event. Browse the events that are currently available."
          icon={<CalendarDays size={25} strokeWidth={1.8} />}
          action={{ label: "Browse events", href: "/" }}
          className="mx-auto max-w-2xl bg-white"
        />
      </main>
    );
  }

  return (
    <main ref={mainRef} className="min-w-0 bg-[#f5f8fc] pb-16">
      <section className="relative isolate min-h-[435px] overflow-hidden bg-[#03132c] text-white sm:min-h-[455px]">
        <Image
          src="/brand/live-performance.webp"
          alt="Illustrative live performance artwork"
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-[58%_45%]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(105deg,#03132c_0%,rgba(3,19,44,.96)_24%,rgba(3,19,44,.72)_48%,rgba(3,19,44,.16)_100%),linear-gradient(0deg,rgba(3,19,44,.48),transparent_44%)]"
        />
        <div className="mx-auto w-full max-w-[1536px] px-5 pt-5 pb-14 sm:px-8 sm:pt-6 lg:px-12">
          <Link
            href="/#all-events"
            data-public-intro
            className="focus-ring inline-flex min-h-9 items-center gap-2 rounded-md pr-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
          >
            <ArrowLeft size={17} aria-hidden="true" />
            Back to events
          </Link>

          <div data-public-intro className="mt-5 max-w-[min(760px,100%)]">
            <EventStatusPill event={event} />
            <h1 className="mt-3 max-w-[15ch] text-[clamp(2.5rem,6vw,4.65rem)] leading-[.98] font-bold tracking-[-.045em] [text-wrap:balance] text-white">
              {event.title}
            </h1>
            <p className="mt-4 max-w-[62ch] text-sm leading-6 text-white/85 sm:text-base sm:leading-7">
              {event.description ||
                "The host hasn’t added an event overview yet."}
            </p>
            <HeroEventMeta event={event} />
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/checkout/${encodeURIComponent(event.id)}`}
                className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] bg-[#087cf0] px-5 text-sm font-bold text-white shadow-[0_7px_20px_rgba(0,98,220,.24)] transition-colors hover:bg-[#006ee0]"
              >
                <Ticket size={18} aria-hidden="true" />
                Get tickets
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <ShareEventButton title={event.title} />
            </div>
            <p className="mt-3 max-w-[62ch] text-[11px] leading-5 text-white/65">
              Event artwork is illustrative; event photos and venue details have
              not been added.
            </p>
          </div>
        </div>
      </section>

      <EventSectionTabs
        activeSection={activeSection}
        onSelect={setActiveSection}
      />

      <div className="mx-auto grid w-full max-w-[1536px] grid-cols-1 items-start gap-5 px-5 pt-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(340px,430px)] lg:gap-6 lg:px-12 lg:pt-6">
        <aside className="min-w-0 scroll-mt-[124px] lg:sticky lg:top-[124px] lg:col-start-2 lg:row-start-1">
          <TicketAvailabilityCard event={event} />
          <section className="mt-4 rounded-[16px] border border-[#e3ebf5] bg-white p-5 shadow-[0_7px_24px_rgba(11,21,56,.05)] sm:p-6">
            <h2 className="text-lg font-bold tracking-[-.025em] text-[#0b1538]">
              Event details
            </h2>
            <dl className="mt-3 divide-y divide-[#edf1f7]">
              <div className="flex items-start gap-3 py-3">
                <CalendarDays
                  size={18}
                  className="mt-0.5 shrink-0 text-[#526b91]"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <dt className="text-xs text-[#687693]">Date and time</dt>
                  <dd className="mt-0.5 text-sm font-medium text-[#162545]">
                    {formatEventDate(event.scheduledAt) ?? "To be announced"}
                    {formatEventTime(event.scheduledAt) && (
                      <span className="block text-xs font-normal text-[#687693]">
                        {formatEventTime(event.scheduledAt)} · your local time
                      </span>
                    )}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3 py-3">
                <MapPin
                  size={18}
                  className="mt-0.5 shrink-0 text-[#526b91]"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <dt className="text-xs text-[#687693]">Venue</dt>
                  <dd className="mt-0.5 text-sm font-medium text-[#162545]">
                    Not provided
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3 py-3 last:pb-0">
                <Music2
                  size={18}
                  className="mt-0.5 shrink-0 text-[#526b91]"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <dt className="text-xs text-[#687693]">Event status</dt>
                  <dd className="mt-1">
                    <EventStatusPill event={event} />
                  </dd>
                </div>
              </div>
            </dl>
          </section>
        </aside>

        <div className="min-w-0 space-y-5 lg:col-start-1 lg:row-start-1">
          <section
            id="overview"
            data-scroll-reveal
            className="scroll-mt-[124px] rounded-[16px] border border-[#e4ebf4] bg-white p-5 shadow-[0_7px_24px_rgba(11,21,56,.045)] sm:p-7"
          >
            <h2 className="text-[25px] leading-tight font-bold tracking-[-.035em] text-[#0b1538]">
              About this event
            </h2>
            <p className="mt-3 max-w-[75ch] text-sm leading-6 text-[#354765] sm:text-[15px] sm:leading-7">
              {event.description ||
                "The host hasn’t added an event overview yet."}
            </p>

            <div className="mt-7 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold tracking-[-.025em] text-[#0b1538]">
                  Event gallery
                </h3>
                <p className="mt-1 text-xs text-[#687693]">
                  Event photos will appear here when the host adds them.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#607395]">
                <ImageIcon size={15} aria-hidden="true" />
                No event photos yet
              </span>
            </div>
            <div className="relative mt-3 min-h-[190px] overflow-hidden rounded-[12px] bg-[#03132c] sm:min-h-[250px]">
              <Image
                src="/brand/live-performance.webp"
                alt="Illustrative live performance; not an event photo"
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover object-[54%_42%] opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#03132c]/85 via-[#03132c]/20 to-transparent" />
              <div className="absolute inset-x-4 bottom-4 flex flex-wrap items-end justify-between gap-3 sm:inset-x-5 sm:bottom-5">
                <p className="max-w-[38ch] text-xs leading-5 text-white/90 sm:text-sm">
                  Illustrative LIV DOT performance artwork. The host has not
                  attached event-specific media.
                </p>
                <span className="rounded-full border border-white/30 bg-[#03132c]/65 px-3 py-1 text-[10px] font-semibold text-white">
                  Illustration
                </span>
              </div>
            </div>
          </section>

          <section
            id="schedule"
            data-scroll-reveal
            className="scroll-mt-[124px] rounded-[16px] border border-[#e4ebf4] bg-white p-5 shadow-[0_7px_24px_rgba(11,21,56,.045)] sm:p-7"
          >
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-[#edf5ff] text-[#087cf0]">
                <Clock3 size={19} aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-lg font-bold tracking-[-.025em] text-[#0b1538]">
                  Schedule
                </h2>
                <p className="text-xs text-[#687693]">
                  Event timing from the host
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-[#f7faff] px-4 py-4">
              {event.scheduledAt ? (
                <>
                  <p className="font-semibold text-[#162545]">
                    {formatEventDate(event.scheduledAt)}
                  </p>
                  <p className="mt-1 text-sm text-[#52617f]">
                    {formatEventTime(event.scheduledAt)} · your local time
                  </p>
                </>
              ) : (
                <p className="text-sm text-[#52617f]">
                  The schedule has not been announced.
                </p>
              )}
            </div>
          </section>

          <section
            id="artists"
            data-scroll-reveal
            className="scroll-mt-[124px]"
          >
            <DetailPlaceholder
              title="Featured artists"
              description="The host hasn’t published the artist lineup for this event yet."
              icon={<Music2 size={19} aria-hidden="true" />}
            />
          </section>

          <section id="venue" data-scroll-reveal className="scroll-mt-[124px]">
            <DetailPlaceholder
              title="Venue"
              description="Venue and location details will appear here when the host adds them."
              icon={<MapPin size={19} aria-hidden="true" />}
            />
          </section>

          <section id="faq" data-scroll-reveal className="scroll-mt-[124px]">
            <DetailPlaceholder
              title="Frequently asked questions"
              description="There are no event FAQs yet. Check back after the host publishes more details."
              icon={<Music2 size={19} aria-hidden="true" />}
            />
          </section>

          <div className="flex items-center justify-between gap-3 px-1 pt-1">
            <Link
              href="/#all-events"
              className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-[#315071] hover:bg-white"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Back to events
            </Link>
            <Link
              href={`/checkout/${encodeURIComponent(event.id)}`}
              className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-[#087cf0] hover:bg-white"
            >
              Ticket options
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
