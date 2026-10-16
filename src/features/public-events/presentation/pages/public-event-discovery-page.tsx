"use client";

import Link from "next/link";
import { useMemo, useRef, useState, type FormEvent } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useEvents } from "@/features/events/application/hooks/use-events";
import type { EventEntity } from "@/features/events/domain/entities/event.entity";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { PublicEventArtwork } from "../components/public-event-artwork";
import {
  EventDateTime,
  EventStatusPill,
  isPublicEvent,
} from "../components/public-event-utils";
import {
  PublicLoadingState,
  PublicRequestError,
} from "../components/public-query-states";
import { usePageIntro } from "@/shared/hooks/use-page-intro";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type EventFilter = "all" | "upcoming" | "live" | "replays";
type SortOrder = "soonest" | "latest";

const EVENT_STATUS_SORT_ORDER: Record<EventEntity["status"], number> = {
  LIVE: 0,
  SCHEDULED: 1,
  READY: 2,
  REPLAY_AVAILABLE: 3,
  COMPLETED: 4,
  DRAFT: 5,
};

const FILTERS: readonly { id: EventFilter; label: string }[] = [
  { id: "all", label: "All events" },
  { id: "upcoming", label: "Upcoming" },
  { id: "live", label: "Live now" },
  { id: "replays", label: "Replays" },
];

function matchesFilter(event: EventEntity, filter: EventFilter) {
  switch (filter) {
    case "upcoming":
      return event.status === "SCHEDULED" || event.status === "READY";
    case "live":
      return event.status === "LIVE";
    case "replays":
      return event.status === "REPLAY_AVAILABLE";
    default:
      return true;
  }
}

function getEventTime(event: EventEntity) {
  if (!event.scheduledAt) return Number.NaN;
  return Date.parse(event.scheduledAt);
}

function matchesDateRange(event: EventEntity, from: string, to: string) {
  if (!from && !to) return true;
  const time = getEventTime(event);
  if (Number.isNaN(time)) return false;
  const fromTime = from ? new Date(`${from}T00:00:00`).getTime() : -Infinity;
  const toTime = to ? new Date(`${to}T23:59:59.999`).getTime() : Infinity;
  return time >= fromTime && time <= toTime;
}

function sortEvents(events: EventEntity[], sort: SortOrder) {
  return [...events].sort((first, second) => {
    const statusOrder =
      EVENT_STATUS_SORT_ORDER[first.status] -
      EVENT_STATUS_SORT_ORDER[second.status];
    if (statusOrder !== 0) return statusOrder;
    const firstTime = getEventTime(first);
    const secondTime = getEventTime(second);
    if (Number.isNaN(firstTime) && Number.isNaN(secondTime)) return 0;
    if (Number.isNaN(firstTime)) return 1;
    if (Number.isNaN(secondTime)) return -1;
    return sort === "soonest" ? firstTime - secondTime : secondTime - firstTime;
  });
}

function PublicEventCard({
  event,
  list = false,
}: {
  readonly event: EventEntity;
  readonly list?: boolean;
}) {
  return (
    <Link
      href={`/events/${encodeURIComponent(event.id)}`}
      data-reveal="event"
      className={`public-event-card focus-ring group min-w-0 overflow-hidden rounded-xl border border-[#e5ebf4] bg-white shadow-[0_3px_14px_rgba(11,21,56,.045)] transition duration-200 hover:-translate-y-0.5 hover:border-[#c9dcff] hover:shadow-[0_14px_32px_rgba(11,21,56,.09)] ${list ? "grid grid-cols-[minmax(180px,.8fr)_1fr] gap-4 p-3 sm:grid-cols-[240px_1fr] sm:gap-5" : "flex h-full flex-col"}`}
    >
      <div className={list ? "min-w-0" : "relative"}>
        <PublicEventArtwork title={event.title} compact />
        {!list && (
          <div className="absolute top-3 left-3">
            <EventStatusPill event={event} />
          </div>
        )}
      </div>
      <div
        className={`flex min-w-0 flex-1 flex-col ${list ? "py-1" : "p-3.5"}`}
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 min-w-0 text-[15px] leading-5 font-semibold tracking-[-.02em] text-[#0b1538] group-hover:text-[#075bff]">
            {event.title}
          </h3>
          {list && <EventStatusPill event={event} />}
        </div>
        <p className="mt-1.5 line-clamp-2 text-xs leading-[18px] text-[#687693]">
          {event.description || "More details will be shared by the host."}
        </p>
        <EventDateTime
          event={event}
          className="mt-3 gap-x-3 gap-y-1 text-[11px]"
        />
        <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-xs font-semibold text-[#075bff]">
          View event details
          <ArrowRight
            size={14}
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </Link>
  );
}

function FilterStatus({
  selected,
  id,
  label,
  count,
  onChange,
}: {
  readonly selected: EventFilter;
  readonly id: EventFilter;
  readonly label: string;
  readonly count: number;
  readonly onChange: (filter: EventFilter) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-[#344365]">
      <input
        type="radio"
        name="event-status"
        checked={selected === id}
        onChange={() => onChange(id)}
        className="size-4 accent-[#075bff]"
      />
      <span className="flex-1">{label}</span>
      <span className="text-xs text-[#8995ab] tabular-nums">{count}</span>
    </label>
  );
}

export function PublicEventDiscoveryPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<EventFilter>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sort, setSort] = useState<SortOrder>("soonest");
  const [listView, setListView] = useState(false);
  const mainRef = useRef<HTMLElement | null>(null);
  const eventListRef = useRef<HTMLDivElement>(null);
  const featuredRailRef = useRef<HTMLDivElement>(null);
  const { data, isPending, isError, refetch, isFetching } = useEvents();
  usePageIntro(mainRef);

  const publishedEvents = useMemo(
    () => (data ?? []).filter(isPublicEvent),
    [data],
  );

  const visibleEvents = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return sortEvents(
      publishedEvents
        .filter((event) => matchesFilter(event, filter))
        .filter((event) => matchesDateRange(event, fromDate, toDate))
        .filter(
          (event) =>
            !query ||
            event.title.toLocaleLowerCase().includes(query) ||
            event.description.toLocaleLowerCase().includes(query),
        ),
      sort,
    );
  }, [filter, fromDate, publishedEvents, search, sort, toDate]);

  const counts = useMemo(
    () => ({
      all: publishedEvents.length,
      upcoming: publishedEvents.filter((event) =>
        matchesFilter(event, "upcoming"),
      ).length,
      live: publishedEvents.filter((event) => matchesFilter(event, "live"))
        .length,
      replays: publishedEvents.filter((event) =>
        matchesFilter(event, "replays"),
      ).length,
    }),
    [publishedEvents],
  );

  const comingUp = visibleEvents.filter((event) =>
    matchesFilter(event, "upcoming"),
  );

  useGSAP(
    () => {
      const list = eventListRef.current;
      if (!list) return;
      const motion = gsap.matchMedia();
      motion.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils
          .toArray<HTMLElement>("[data-reveal='event']", list)
          .forEach((card) => {
            gsap.from(card, {
              y: 12,
              duration: 0.5,
              ease: "power2.out",
              clearProps: "transform",
              scrollTrigger: {
                trigger: card,
                start: "top 96%",
                once: true,
              },
            });
          });
      });
      return () => motion.revert();
    },
    {
      scope: eventListRef,
      dependencies: [visibleEvents],
      revertOnUpdate: true,
    },
  );

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    document
      .getElementById("all-events")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function clearFilters() {
    setSearch("");
    setFilter("all");
    setFromDate("");
    setToDate("");
  }

  function scrollFeatured(direction: "left" | "right") {
    featuredRailRef.current?.scrollBy({
      left: direction === "left" ? -380 : 380,
      behavior: "smooth",
    });
  }

  const hasActiveFilters = Boolean(
    search || filter !== "all" || fromDate || toDate,
  );

  return (
    <main ref={mainRef}>
      <section className="relative isolate overflow-hidden bg-[#03132c] text-white">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[url('/images/event-marketing-importance.png')] bg-cover bg-[center_46%] opacity-65" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,13,32,.99)_0%,rgba(2,13,32,.9)_31%,rgba(2,13,32,.42)_63%,rgba(2,13,32,.68)_100%)]" />
          <div className="absolute inset-x-0 top-0 h-[62px] bg-[#03132c]/75" />
        </div>
        <div className="mx-auto w-full max-w-[1536px] px-5 pt-8 pb-4 sm:px-8 sm:pt-9 lg:px-12">
          <div className="grid min-h-[165px] items-center gap-4 lg:grid-cols-[1fr_180px]">
            <div>
              <p
                data-public-intro
                className="text-[11px] font-bold tracking-[.19em] text-[#00d6df] uppercase"
              >
                Live people. Real experiences.
              </p>
              <h1
                data-public-intro
                className="mt-1 text-[clamp(2.8rem,6vw,4.25rem)] leading-[.98] font-bold tracking-[-.055em] text-white"
              >
                Discover Events
              </h1>
              <p
                data-public-intro
                className="mt-2 max-w-2xl text-base leading-6 text-white/90 sm:text-lg"
              >
                Concerts, conferences, festivals and more — all in one place.
              </p>
              <p data-public-intro className="mt-1 text-sm text-white/70">
                Find events listed by hosts and explore the details before you
                go.
              </p>
            </div>
            <p className="hidden -rotate-6 text-right font-serif text-[40px] leading-[.87] text-white italic drop-shadow-lg lg:block">
              More
              <br />
              Than
              <br />
              Events
            </p>
          </div>

          <form
            id="public-search"
            data-public-intro
            role="search"
            onSubmit={submitSearch}
            className="grid scroll-mt-[72px] gap-1 rounded-2xl border border-[#dbe5f4] bg-white p-1.5 text-[#0b1538] shadow-[0_14px_36px_rgba(0,0,0,.24)] md:grid-cols-[minmax(260px,1fr)_180px_180px_205px] md:rounded-[14px]"
          >
            <label className="flex min-h-10 min-w-0 items-center gap-3 px-3 sm:min-h-11">
              <Search
                size={19}
                className="shrink-0 text-[#344365]"
                aria-hidden="true"
              />
              <span className="sr-only">
                Search event names and descriptions
              </span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search for events, artists, venues or cities..."
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#7a879f]"
              />
            </label>
            <div
              title="Location search will be available when event listings include venue details."
              aria-label="Location search unavailable because event listings do not include venue details yet"
              className="flex min-h-10 items-center gap-3 border-t border-[#e5ebf4] px-3 text-sm text-[#687693] md:min-h-11 md:border-t-0 md:border-l"
            >
              <MapPin size={17} className="shrink-0" aria-hidden="true" />
              <span>Location</span>
              <ChevronRight
                size={15}
                className="ml-auto -rotate-90"
                aria-hidden="true"
              />
            </div>
            <label className="flex min-h-10 items-center gap-3 border-t border-[#e5ebf4] px-3 text-sm text-[#344365] md:min-h-11 md:border-t-0 md:border-l">
              <CalendarDays
                size={17}
                className="shrink-0 text-[#52617f]"
                aria-hidden="true"
              />
              <span className="sr-only">Filter from date</span>
              <input
                aria-label="Filter events from date"
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              />
            </label>
            <button
              type="submit"
              className="focus-ring min-h-11 rounded-[10px] bg-[#087bfa] px-5 text-sm font-semibold text-white transition hover:bg-[#075bff]"
            >
              Search Events
            </button>
          </form>

          <div
            id="categories"
            role="group"
            aria-label="Browse events by availability"
            className="mt-2.5 flex scroll-mt-[72px] [scrollbar-width:none] gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden"
          >
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={filter === item.id}
                onClick={() => setFilter(item.id)}
                className={`focus-ring inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full border px-4 text-xs font-medium transition ${filter === item.id ? "border-white/65 bg-white/17 text-white" : "border-white/20 bg-[#0a2347]/75 text-white/90 hover:border-white/45 hover:bg-white/10"}`}
              >
                {item.label}
                <span className="text-[10px] text-white/60 tabular-nums">
                  {counts[item.id]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-[1536px] gap-5 px-4 py-5 sm:px-7 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-5 lg:px-8 xl:px-12">
        <aside className="h-fit rounded-xl border border-[#e5ebf4] bg-white p-4 shadow-[0_2px_10px_rgba(11,21,56,.025)] lg:sticky lg:top-5">
          <div className="flex items-center justify-between border-b border-[#e5ebf4] pb-3">
            <h2 className="text-base font-semibold text-[#0b1538]">Filters</h2>
            <button
              type="button"
              onClick={clearFilters}
              className="focus-ring rounded px-1.5 py-1 text-[11px] font-semibold text-[#075bff] hover:bg-[#eef4ff]"
            >
              Clear all
            </button>
          </div>

          <fieldset className="py-3">
            <legend className="mb-2 text-xs font-semibold text-[#0b1538]">
              Event status
            </legend>
            <div className="space-y-2.5">
              {FILTERS.map((item) => (
                <FilterStatus
                  key={item.id}
                  selected={filter}
                  id={item.id}
                  label={item.label}
                  count={counts[item.id]}
                  onChange={setFilter}
                />
              ))}
            </div>
          </fieldset>

          <fieldset className="border-t border-[#e5ebf4] py-3">
            <legend className="mb-2 text-xs font-semibold text-[#0b1538]">
              Date range
            </legend>
            <label
              className="mb-2 block text-[11px] text-[#687693]"
              htmlFor="date-from"
            >
              From
            </label>
            <input
              id="date-from"
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              className="focus-ring h-9 w-full rounded-md border border-[#dfe6f0] px-2 text-xs text-[#344365]"
            />
            <label
              className="mt-2 mb-2 block text-[11px] text-[#687693]"
              htmlFor="date-to"
            >
              To
            </label>
            <input
              id="date-to"
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              className="focus-ring h-9 w-full rounded-md border border-[#dfe6f0] px-2 text-xs text-[#344365]"
            />
          </fieldset>

          <div className="border-t border-[#e5ebf4] pt-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0b1538]">
              <SlidersHorizontal size={14} aria-hidden="true" />
              More ways to filter
            </div>
            <p className="mt-1.5 text-[11px] leading-[17px] text-[#687693]">
              Venue, category and ticket filters appear when hosts publish those
              details.
            </p>
          </div>
        </aside>

        <div className="min-w-0 space-y-6">
          {!isPending && !isError && comingUp.length > 0 && (
            <section aria-labelledby="coming-up-heading">
              <div className="mb-2 flex items-end justify-between gap-3">
                <div>
                  <h2
                    id="coming-up-heading"
                    className="text-xl font-bold tracking-[-.035em] text-[#0b1538] sm:text-[22px]"
                  >
                    Coming Up
                  </h2>
                  <p className="mt-0.5 text-xs text-[#687693] sm:text-[13px]">
                    Events hosts have scheduled on LIV DOT.
                  </p>
                </div>
                <div className="hidden gap-1.5 sm:flex">
                  <button
                    type="button"
                    onClick={() => scrollFeatured("left")}
                    aria-label="Scroll events left"
                    className="focus-ring grid size-9 place-items-center rounded-full border border-[#dfe6f0] bg-white text-[#0b1538] shadow-sm hover:text-[#075bff]"
                  >
                    <ChevronLeft size={18} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollFeatured("right")}
                    aria-label="Scroll events right"
                    className="focus-ring grid size-9 place-items-center rounded-full border border-[#dfe6f0] bg-white text-[#0b1538] shadow-sm hover:text-[#075bff]"
                  >
                    <ChevronRight size={18} aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div
                ref={featuredRailRef}
                className="grid snap-x snap-mandatory auto-cols-[minmax(270px,86%)] grid-flow-col gap-3 overflow-x-auto scroll-smooth pb-2 sm:auto-cols-[minmax(320px,48%)] xl:auto-cols-[minmax(340px,33.333%)]"
              >
                {comingUp.slice(0, 6).map((event) => (
                  <div key={event.id} className="snap-start">
                    <PublicEventCard event={event} />
                  </div>
                ))}
              </div>
            </section>
          )}

          <section id="all-events" className="scroll-mt-[72px]">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-[-.035em] text-[#0b1538] sm:text-[22px]">
                  All Events
                </h2>
                <p className="mt-0.5 text-xs text-[#687693] sm:text-[13px]">
                  Browse events hosts have made public.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2 text-xs text-[#687693]">
                  Sort by
                  <select
                    value={sort}
                    onChange={(event) =>
                      setSort(event.target.value as SortOrder)
                    }
                    className="focus-ring h-9 rounded-md border border-[#dfe6f0] bg-white px-2.5 text-xs font-medium text-[#344365]"
                  >
                    <option value="soonest">Date (Soonest)</option>
                    <option value="latest">Date (Latest)</option>
                  </select>
                </label>
                <div
                  role="group"
                  aria-label="Event layout"
                  className="flex rounded-md border border-[#dfe6f0] bg-white p-0.5"
                >
                  <button
                    type="button"
                    aria-pressed={!listView}
                    onClick={() => setListView(false)}
                    className={`focus-ring rounded px-2.5 py-1.5 text-xs font-medium ${!listView ? "bg-[#075bff] text-white" : "text-[#52617f] hover:bg-[#f2f6fc]"}`}
                  >
                    Grid
                  </button>
                  <button
                    type="button"
                    aria-pressed={listView}
                    onClick={() => setListView(true)}
                    className={`focus-ring rounded px-2.5 py-1.5 text-xs font-medium ${listView ? "bg-[#075bff] text-white" : "text-[#52617f] hover:bg-[#f2f6fc]"}`}
                  >
                    List
                  </button>
                </div>
              </div>
            </div>

            <div ref={eventListRef}>
              {isPending ? (
                <PublicLoadingState label="Loading published events" />
              ) : isError ? (
                <PublicRequestError onRetry={() => void refetch()} />
              ) : visibleEvents.length > 0 ? (
                <div
                  className={
                    listView
                      ? "grid gap-3"
                      : "grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5"
                  }
                >
                  {visibleEvents.map((event) => (
                    <PublicEventCard
                      key={event.id}
                      event={event}
                      list={listView}
                    />
                  ))}
                </div>
              ) : hasActiveFilters ? (
                <div className="rounded-xl border border-[#e5ebf4] bg-white p-4 sm:p-6">
                  <EmptyState
                    title="No events match those filters"
                    description="Try another search or date range to see more public events."
                    icon={<Search size={24} strokeWidth={1.8} />}
                    size="compact"
                  />
                  <div className="mt-2 text-center">
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="focus-ring rounded-lg px-3 py-2 text-sm font-semibold text-[#075bff] hover:bg-[#eef4ff]"
                    >
                      Clear search and filters
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-[#e5ebf4] bg-white p-4 sm:p-6">
                  <EmptyState
                    title="No public events yet"
                    description="Events appear here when hosts publish them. Check back soon for upcoming experiences."
                    icon={<CalendarDays size={25} strokeWidth={1.8} />}
                    action={{ label: "Explore host tools", href: "/dashboard" }}
                  />
                </div>
              )}
              {isFetching && !isPending && (
                <p
                  role="status"
                  className="mt-4 text-center text-xs text-[#687693]"
                >
                  Updating event listings…
                </p>
              )}
            </div>
          </section>

          <section
            id="how-it-works"
            className="scroll-mt-[72px] rounded-xl border border-[#e5ebf4] bg-white px-4 py-5 sm:px-6"
          >
            <h2 className="text-base font-semibold tracking-[-.02em] text-[#0b1538]">
              Find an event on LIV DOT
            </h2>
            <ol className="mt-4 grid gap-3 text-xs leading-5 text-[#52617f] sm:grid-cols-3 sm:text-[13px]">
              <li className="flex items-start gap-2.5">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#eaf1ff] text-[11px] font-bold text-[#075bff]">
                  1
                </span>
                <span>Browse events hosts have made public.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#eaf1ff] text-[11px] font-bold text-[#075bff]">
                  2
                </span>
                <span>Check the event details and schedule.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#eaf1ff] text-[11px] font-bold text-[#075bff]">
                  3
                </span>
                <span>
                  Ticket options will be available when provided by the host.
                </span>
              </li>
            </ol>
          </section>
        </div>
      </div>
    </main>
  );
}
