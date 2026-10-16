"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  ExternalLink,
  Ticket,
} from "lucide-react";
import { useSyncExternalStore } from "react";
import { useEvent } from "../../application/hooks/use-event";
import type { EventEntity } from "../../domain/entities/event.entity";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { LoadingState } from "@/shared/components/feedback/loading-state";
import {
  formatTicketMoney,
  getOrderLinesForEvent,
  getSimulatedOrdersSnapshot,
  parseSimulatedOrders,
  subscribeSimulatedOrders,
} from "@/shared/lib/demo-ticketing-store";
import { formatEventDateTime } from "../lib/event-view.utils";

const panel =
  "rounded-[14px] border border-[#e5ebf4] bg-white shadow-[0_4px_18px_rgba(18,44,78,.035)]";

function EventTicketAvailability({ event }: { readonly event: EventEntity }) {
  const ordersSnapshot = useSyncExternalStore(
    subscribeSimulatedOrders,
    getSimulatedOrdersSnapshot,
    () => null,
  );
  const eventLines = parseSimulatedOrders(ordersSnapshot).flatMap((order) =>
    getOrderLinesForEvent(order, event.id),
  );
  const soldTicketCount = eventLines.reduce(
    (sum, line) => sum + line.quantity,
    0,
  );
  const purchasedSeatKeys = new Set(
    eventLines.flatMap((line) => line.seatKeys ?? []),
  );
  const seatMap = event.seatMap?.blocks.some((block) => block.seats.length > 0)
    ? event.seatMap
    : null;
  const ticketOptions = event.ticketOptions ?? [];
  const soldByTicketId = new Map<string, number>();
  for (const line of eventLines) {
    soldByTicketId.set(
      line.id,
      (soldByTicketId.get(line.id) ?? 0) + line.quantity,
    );
  }

  const availableInBlock = (block: NonNullable<typeof seatMap>["blocks"][number]) =>
    block.seats.filter(
      (seat) =>
        seat.salable &&
        !purchasedSeatKeys.has(`${block.id}:${seat.id}`),
    ).length;
  const soldInBlock = (block: NonNullable<typeof seatMap>["blocks"][number]) =>
    block.seats.filter((seat) =>
      purchasedSeatKeys.has(`${block.id}:${seat.id}`),
    ).length;
  const availableSeatCount = seatMap
    ? seatMap.blocks.reduce((sum, block) => sum + availableInBlock(block), 0)
    : 0;
  const soldSeatCount = seatMap
    ? seatMap.blocks.reduce((sum, block) => sum + soldInBlock(block), 0)
    : 0;
  const hasTicketSetup = Boolean(seatMap || ticketOptions.length > 0);
  const hasAvailability = seatMap
    ? availableSeatCount > 0
    : ticketOptions.some(
        (ticket) =>
          ticket.quantityAvailable == null ||
          ticket.quantityAvailable - (soldByTicketId.get(ticket.id) ?? 0) > 0,
      );

  return (
    <aside className={`${panel} p-4 sm:p-5`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[16px] font-bold tracking-[-.025em] text-[#101b43]">
          Tickets
        </h2>
        <span
          className={`rounded-full px-2.5 py-1 text-[9px] font-semibold ${
            !hasTicketSetup
              ? "bg-[#f1f4f8] text-[#64728d]"
              : hasAvailability
                ? "bg-[#e5fbf3] text-[#07855e]"
                : "bg-[#fff0f1] text-[#c92d3a]"
          }`}
        >
          {!hasTicketSetup
            ? "Not available"
            : hasAvailability
              ? "On sale"
              : "Sold out"}
        </span>
      </div>

      {seatMap ? (
        <div className="mt-3 rounded-[12px] border border-[#dce7f5] bg-[#f8fbff] p-3.5">
          <p className="text-[12px] font-semibold text-[#162545]">
            Seating availability
          </p>
          <p className="mt-1 text-[11px] text-[#687693]">
            {availableSeatCount} seats remaining · {soldSeatCount} sold
          </p>
          <ul className="mt-3 space-y-2">
            {seatMap.blocks.map((block) => (
              <li
                key={String(block.id)}
                className="flex items-center justify-between gap-3 rounded-lg border border-[#e5ebf4] bg-white px-3 py-2"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[11px] font-semibold text-[#263653]">
                    {block.title}
                  </span>
                  {block.price !== undefined && (
                    <span className="mt-0.5 block text-[10px] text-[#687693]">
                      {formatTicketMoney(block.price, block.currency ?? "NGN")}
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-[10px] font-medium text-[#536380]">
                  {availableInBlock(block)} left
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : ticketOptions.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {ticketOptions.map((ticket) => {
            const sold = soldByTicketId.get(ticket.id) ?? 0;
            const remaining =
              ticket.quantityAvailable == null
                ? null
                : Math.max(0, ticket.quantityAvailable - sold);
            return (
              <li
                key={ticket.id}
                className="flex items-center justify-between gap-3 rounded-[10px] border border-[#e4ebf4] bg-[#fbfdff] px-3.5 py-3"
              >
                <span className="min-w-0">
                  <strong className="block truncate text-[12px] text-[#162545]">
                    {ticket.name}
                  </strong>
                  <span className="mt-0.5 block text-[10px] text-[#687693]">
                    {remaining === null
                      ? `${sold} sold`
                      : `${remaining} remaining · ${sold} sold`}
                  </span>
                </span>
                <span className="shrink-0 text-[12px] font-bold text-[#162545]">
                  {formatTicketMoney(ticket.price, ticket.currency ?? "NGN")}
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState
          size="compact"
          icon={<Ticket size={21} strokeWidth={1.8} />}
          title="Tickets aren’t available yet"
          description="Ticket options will appear here when they’re added to the event."
        />
      )}

      {hasTicketSetup && (
        <p className="mt-3 text-center text-[10px] text-[#687693]">
          {soldTicketCount} ticket{soldTicketCount === 1 ? "" : "s"} sold from
          completed checkouts in this browser.
        </p>
      )}
      <Link
        href={`/dashboard/events/${event.id}/tickets`}
        className="focus-ring mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#dce5f2] text-[11px] font-semibold text-[#075bff] hover:bg-[#f7faff]"
      >
        Ticket management <ArrowRight size={14} aria-hidden="true" />
      </Link>
    </aside>
  );
}

export function EventPublicPage({ eventId }: { readonly eventId: string }) {
  const {
    data: event,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useEvent(eventId);
  if (isPending) return <LoadingState label="Loading event page" rows={5} />;
  if (isError || !event)
    return (
      <ErrorState
        title="Event page could not be loaded"
        description={
          error instanceof Error
            ? error.message
            : "The event service could not complete the request."
        }
        retry={() => void refetch()}
        isRetrying={isFetching}
      />
    );

  const status = event.status.replaceAll("_", " ");
  const date = formatEventDateTime(event.scheduledAt, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const time = formatEventDateTime(event.scheduledAt, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <main className="min-w-0 space-y-4 pb-6">
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
        <span className="max-w-[260px] truncate font-medium text-[#253454]">
          {event.title}
        </span>
        <span className="rounded-full bg-[#edf4ff] px-2 py-0.5 text-[9px] font-semibold text-[#075bff]">
          Event page preview
        </span>
      </nav>

      <section className="relative isolate overflow-hidden rounded-[16px] bg-[radial-gradient(ellipse_at_77%_18%,rgba(0,198,222,.5),transparent_37%),radial-gradient(ellipse_at_42%_105%,rgba(93,39,239,.6),transparent_42%),linear-gradient(115deg,#06152f,#0a2f69_58%,#071a3e)] px-5 py-7 text-white shadow-[0_12px_30px_rgba(10,32,75,.16)] sm:px-8 sm:py-9">
        <div
          className="absolute inset-0 -z-10 opacity-25"
          aria-hidden="true"
          style={{
            backgroundImage:
              "radial-gradient(circle at 18% 30%, white 1px, transparent 1.5px), radial-gradient(circle at 62% 75%, white 1px, transparent 1.5px)",
            backgroundSize: "44px 44px, 61px 61px",
          }}
        />
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-4xl min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-semibold text-white/90">
              <span className="size-1.5 rounded-full bg-[#23d39a]" /> {status}
            </span>
            <h1 className="mt-4 text-[30px] leading-[1.05] font-bold tracking-[-.045em] break-words sm:text-[42px]">
              {event.title}
            </h1>
            <p className="mt-2 max-w-[72ch] text-[13px] leading-relaxed text-white/80 sm:text-[15px]">
              {event.description ||
                "Event details will be shared here when the host adds a description."}
            </p>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-white/90">
              <span className="inline-flex items-center gap-2">
                <CalendarDays size={16} aria-hidden="true" />
                {date}
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock3 size={16} aria-hidden="true" />
                {time} (WAT)
              </span>
            </div>
          </div>
          <Link
            href={`/dashboard/events/${event.id}/manage`}
            className="focus-ring inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-3.5 text-[11px] font-semibold text-white backdrop-blur-sm hover:bg-white/20"
          >
            Manage event <ExternalLink size={14} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,.72fr)]">
        <div className="min-w-0 space-y-4">
          <section className={`${panel} p-4 sm:p-5`}>
            <h2 className="text-[16px] font-bold tracking-[-.025em] text-[#101b43]">
              About this event
            </h2>
            <p className="mt-2 text-[12px] leading-[1.75] whitespace-pre-line text-[#53627e]">
              {event.description ||
                "The event host has not added a description yet."}
            </p>
          </section>
          <section className={`${panel} p-4 sm:p-5`}>
            <h2 className="text-[16px] font-bold tracking-[-.025em] text-[#101b43]">
              Event program
            </h2>
            <EmptyState
              size="compact"
              title="Program details aren’t available"
              description="Session times and speaker information will appear here when they are added to the event."
            />
          </section>
        </div>
        <EventTicketAvailability event={event} />
      </div>
    </main>
  );
}
