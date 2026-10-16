"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  Minus,
  Plus,
  Ticket,
  X,
} from "lucide-react";
import { useEvent } from "@/features/events/application/hooks/use-event";
import type { EventEntity } from "@/features/events/domain/entities/event.entity";
import {
  PublicLoadingState,
  PublicRequestError,
} from "../components/public-query-states";
import { SeatMapSelector } from "../components/seat-map-selector";
import {
  formatEventDate,
  formatEventTime,
  isPublicEvent,
} from "../components/public-event-utils";
import {
  configuredSeatMap,
  formatMoney,
  getCheckoutSelectionSnapshot,
  getCheckoutLines,
  parseCheckoutSelection,
  seatMapSelectionKey,
  subscribeCheckoutSelection,
  writeCheckoutSelection,
  type CheckoutSelection,
} from "../lib/public-checkout";

function BookingProgress({ step }: { readonly step: number }) {
  const steps = ["Select tickets", "Checkout & payment", "Confirmation"];
  return (
    <nav
      aria-label="Booking progress"
      className="border-b border-white/10 bg-[#06172f] text-white"
    >
      <ol className="mx-auto flex min-h-[54px] max-w-[1536px] items-center justify-center gap-3 px-4 sm:gap-6">
        {steps.map((label, index) => {
          const active = index + 1 === step;
          const done = index + 1 < step;
          return (
            <li
              key={label}
              className="flex items-center gap-2 text-xs sm:gap-3 sm:text-sm"
            >
              {index > 0 && (
                <span
                  className="hidden h-px w-7 bg-white/30 sm:block"
                  aria-hidden="true"
                />
              )}
              <span
                className={`grid size-7 shrink-0 place-items-center rounded-full border text-xs font-bold ${active ? "border-[#087cf0] bg-[#087cf0] text-white" : done ? "border-white bg-white text-[#087cf0]" : "border-white/35 bg-white/10 text-white/65"}`}
              >
                {done ? <Check size={14} aria-hidden="true" /> : index + 1}
              </span>
              <span
                className={
                  active ? "font-semibold text-white" : "text-white/65"
                }
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function SelectionSummary({
  event,
  selection,
  onContinue,
  onReleaseSeat,
}: {
  readonly event: EventEntity;
  readonly selection: CheckoutSelection;
  readonly onContinue: () => void;
  readonly onReleaseSeat: (key: string) => void;
}) {
  const lines = useMemo(
    () => getCheckoutLines(event, selection),
    [event, selection],
  );
  const selectedCount =
    selection.seatKeys.length +
    Object.values(selection.ticketQuantities).reduce(
      (sum, quantity) => sum + quantity,
      0,
    );
  const pricedCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const total = lines.reduce(
    (sum, line) => sum + line.unitPrice * line.quantity,
    0,
  );
  const currency = lines[0]?.currency ?? "NGN";
  const hasValidSelection = selectedCount > 0 && selectedCount === pricedCount;
  const claimedSeats = useMemo(() => {
    const selectedKeys = new Set(selection.seatKeys);
    const foundKeys = new Set<string>();
    const seats = (event.seatMap?.blocks ?? []).flatMap((block) =>
      block.seats.flatMap((seat) => {
        const key = seatMapSelectionKey(block.id, seat.id);
        if (!selectedKeys.has(key)) return [];
        foundKeys.add(key);
        return [
          {
            key,
            label: `Seat ${seat.title}`,
            section: block.title,
            row: seat.row,
          },
        ];
      }),
    );

    return [
      ...seats,
      ...selection.seatKeys
        .filter((key) => !foundKeys.has(key))
        .map((key) => ({
          key,
          label: "Seat no longer available",
          section: "Remove this selection",
          row: undefined,
        })),
    ];
  }, [event.seatMap, selection.seatKeys]);

  return (
    <aside className="overflow-hidden rounded-[16px] border border-[#e3ebf5] bg-white shadow-[0_10px_30px_rgba(11,21,56,.06)] lg:sticky lg:top-5">
      <div className="flex items-center justify-between gap-3 px-5 pt-5">
        <h2 className="text-lg font-bold tracking-[-.025em] text-[#0b1538]">
          Order summary
        </h2>
        <span className="rounded-full bg-[#e8f4ff] px-2.5 py-1 text-[11px] font-semibold text-[#087cf0]">
          Demo checkout
        </span>
      </div>
      <div className="relative mx-5 mt-4 h-[168px] overflow-hidden rounded-[12px] bg-[#06172f]">
        <Image
          src="/brand/live-performance.webp"
          alt="Illustrative live performance"
          fill
          sizes="(max-width: 1024px) 100vw, 420px"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#03132c]/95 via-[#03132c]/65 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
          <span className="mb-2 w-fit rounded-full border border-white/30 bg-black/25 px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase">
            Event
          </span>
          <h3 className="max-w-[25ch] text-lg leading-tight font-bold">
            {event.title}
          </h3>
          <p className="mt-2 flex items-center gap-2 text-xs text-white/85">
            <CalendarDays size={14} aria-hidden="true" />
            {formatEventDate(event.scheduledAt) ?? "Date to be announced"}
            {formatEventTime(event.scheduledAt)
              ? ` · ${formatEventTime(event.scheduledAt)}`
              : ""}
          </p>
        </div>
      </div>

      <div className="px-5 pt-5">
        <h3 className="text-sm font-bold text-[#142343]">Selected tickets</h3>
        {lines.length ? (
          <ul className="mt-3 space-y-2.5">
            {lines.map((line) => (
              <li
                key={line.id}
                className="flex items-start justify-between gap-3 rounded-[10px] bg-[#f3f8fd] px-3.5 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#162545]">
                    {line.name}{" "}
                    <span className="font-normal text-[#687693]">
                      × {line.quantity}
                    </span>
                  </p>
                  {line.description && !line.seatKeys?.length && (
                    <p className="mt-1 line-clamp-2 text-xs leading-4 text-[#687693]">
                      {line.description}
                    </p>
                  )}
                </div>
                <p className="shrink-0 text-sm font-bold text-[#0b1538]">
                  {formatMoney(line.unitPrice * line.quantity, line.currency)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 rounded-[10px] bg-[#f3f8fd] px-3.5 py-3 text-xs leading-5 text-[#687693]">
            Choose available tickets to see your order total.
          </p>
        )}
        {claimedSeats.length > 0 && (
          <div className="mt-3 rounded-[10px] border border-[#dce9f8] bg-white p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h4 className="text-xs font-bold text-[#162545]">
                Claimed seats
              </h4>
              <span className="text-[10px] text-[#687693]">
                Select a seat to release it
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {claimedSeats.map((seat) => (
                <button
                  key={seat.key}
                  type="button"
                  onClick={() => onReleaseSeat(seat.key)}
                  aria-label={`Release ${seat.label}${seat.section ? ` in ${seat.section}` : ""}${seat.row ? `, row ${seat.row}` : ""}`}
                  title="Release this seat"
                  className="focus-ring inline-flex min-h-9 items-center gap-2 rounded-lg border border-[#c8ddf4] bg-[#f7fbff] px-2.5 text-[11px] font-semibold text-[#174a87] transition-colors hover:border-[#087cf0] hover:bg-[#eef6ff]"
                >
                  {seat.label}
                  <X size={13} aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        )}
        {selectedCount !== pricedCount && selectedCount > 0 && (
          <p role="status" className="mt-2 text-xs leading-5 text-amber-700">
            Some selected seats are claimed or missing a price. Release them
            before continuing.
          </p>
        )}
        <div className="mt-4 flex items-center justify-between border-t border-[#e9eef6] pt-4">
          <span className="text-sm font-semibold text-[#52617f]">Total</span>
          <span className="text-xl font-bold tracking-[-.03em] text-[#0b1538]">
            {formatMoney(total, currency)}
          </span>
        </div>
      </div>

      <div className="px-5 pt-4 pb-5">
        <button
          type="button"
          onClick={onContinue}
          disabled={!hasValidSelection}
          className="focus-ring inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-[#087cf0] px-4 text-sm font-bold text-white transition hover:bg-[#006ee0] disabled:cursor-not-allowed disabled:bg-[#b7c5d8]"
        >
          Continue to checkout <ArrowRight size={17} aria-hidden="true" />
        </button>
        <p className="mt-2.5 text-center text-[11px] leading-5 text-[#687693]">
          Payment will run in a local Paystack style demo. No real charge.
        </p>
      </div>
    </aside>
  );
}

export function PublicEventCheckoutPage({
  eventId,
}: {
  readonly eventId: string;
}) {
  const router = useRouter();
  const { data: event, isPending, isError, refetch } = useEvent(eventId);
  const storedSelection = useSyncExternalStore(
    subscribeCheckoutSelection,
    getCheckoutSelectionSnapshot,
    () => null,
  );
  const [selectionOverride, setSelectionOverride] = useState<{
    readonly eventId: string;
    readonly selection: CheckoutSelection;
  } | null>(null);
  const selection = useMemo(
    () =>
      selectionOverride?.eventId === eventId
        ? selectionOverride.selection
        : (parseCheckoutSelection(storedSelection, eventId) ?? {
            eventId,
            seatKeys: [],
            ticketQuantities: {},
          }),
    [eventId, selectionOverride, storedSelection],
  );

  const seatMap = event ? configuredSeatMap(event) : null;
  const selectedSeats = new Set(selection.seatKeys);
  const toggleSeat = useCallback(
    (key: string) => {
      const seatKeys = selection.seatKeys.includes(key)
        ? selection.seatKeys.filter((seatKey) => seatKey !== key)
        : [...selection.seatKeys, key];
      const nextSelection = { ...selection, seatKeys };
      setSelectionOverride({
        eventId,
        selection: nextSelection,
      });
      writeCheckoutSelection(nextSelection);
    },
    [eventId, selection],
  );

  function changeTicketQuantity(ticketId: string, delta: number) {
    const quantity = Math.max(
      0,
      (selection.ticketQuantities[ticketId] ?? 0) + delta,
    );
    const ticketQuantities = { ...selection.ticketQuantities };
    if (quantity === 0) delete ticketQuantities[ticketId];
    else ticketQuantities[ticketId] = quantity;
    const nextSelection = { ...selection, ticketQuantities };
    setSelectionOverride({
      eventId,
      selection: nextSelection,
    });
    writeCheckoutSelection(nextSelection);
  }

  function continueToCheckout() {
    writeCheckoutSelection(selection);
    router.push("/checkout/cart");
  }

  if (isPending) {
    return (
      <main className="mx-auto min-h-[70vh] max-w-[1440px] px-5 py-8 sm:px-8">
        <PublicLoadingState label="Loading ticket selection" variant="page" />
      </main>
    );
  }
  if (isError || !event) {
    return (
      <main className="mx-auto min-h-[70vh] max-w-[1440px] px-5 py-8 sm:px-8">
        <PublicRequestError
          title="Ticket options could not be loaded"
          onRetry={() => void refetch()}
        />
      </main>
    );
  }
  if (!isPublicEvent(event)) {
    return (
      <main className="mx-auto min-h-[70vh] max-w-[1440px] px-5 py-12 text-center">
        <h1 className="text-2xl font-bold">
          This event is not available for booking
        </h1>
        <Link
          className="mt-4 inline-flex text-sm font-semibold text-[#075bff]"
          href={`/events/${encodeURIComponent(eventId)}`}
        >
          Return to event details <ChevronRight size={16} />
        </Link>
      </main>
    );
  }

  const maxSelectable = seatMap?.maxSelectable ?? 10;
  const hasSeatMap = Boolean(seatMap);
  const ticketOptions = event.ticketOptions ?? [];
  const quantitySelected = Object.values(selection.ticketQuantities).reduce(
    (sum, quantity) => sum + quantity,
    0,
  );

  return (
    <main className="min-w-0 bg-[#f3f8fd] pb-14">
      <section className="relative isolate overflow-hidden bg-[#03132c] text-white">
        <Image
          src="/brand/live-performance.webp"
          alt="Illustrative live performance"
          fill
          sizes="100vw"
          priority
          className="-z-20 object-cover object-[58%_45%]"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,rgba(3,19,44,.98)_0%,rgba(3,19,44,.88)_44%,rgba(3,19,44,.35)_100%)]" />
        <div className="mx-auto max-w-[1536px] px-5 py-5 sm:px-8 lg:px-12">
          <Link
            href={`/events/${encodeURIComponent(eventId)}`}
            className="focus-ring inline-flex min-h-8 items-center gap-2 rounded text-sm text-white/80 hover:text-white"
          >
            <ChevronRight className="rotate-180" size={15} aria-hidden="true" />
            Back to event details
          </Link>
          <h1 className="mt-3 text-[clamp(2rem,4vw,3.4rem)] leading-tight font-bold tracking-[-.04em]">
            {event.title}
          </h1>
          <div className="mt-3 flex flex-wrap gap-x-7 gap-y-2 text-sm text-white/85">
            <span className="inline-flex items-center gap-2">
              <CalendarDays size={17} aria-hidden="true" />
              {formatEventDate(event.scheduledAt) ?? "Date to be announced"}
              {formatEventTime(event.scheduledAt)
                ? ` · ${formatEventTime(event.scheduledAt)}`
                : ""}
            </span>
            <span className="inline-flex items-center gap-2">
              <Ticket size={17} aria-hidden="true" />
              {hasSeatMap ? "Choose your seats" : "Choose your tickets"}
            </span>
          </div>
        </div>
      </section>

      <BookingProgress step={1} />

      <div className="mx-auto grid w-full max-w-[1536px] items-start gap-5 px-4 pt-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(340px,420px)] lg:gap-6 lg:px-12 lg:pt-6">
        <section className="min-w-0 rounded-[16px] border border-[#e3ebf5] bg-white p-4 shadow-[0_10px_30px_rgba(11,21,56,.045)] sm:p-5 lg:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold tracking-[-.03em] text-[#0b1538] sm:text-2xl">
                {hasSeatMap
                  ? "Interactive seating chart"
                  : "Select your tickets"}
              </h2>
              <p className="mt-1 text-sm text-[#687693]">
                {hasSeatMap
                  ? "Choose available seats in the map or switch to the accessible list."
                  : "Choose a ticket type and quantity to continue."}
              </p>
            </div>
            <span className="rounded-full bg-[#eff6ff] px-3 py-1.5 text-xs font-semibold text-[#087cf0]">
              {hasSeatMap
                ? `${selectedSeats.size} claimed`
                : `${quantitySelected} selected`}
            </span>
          </div>

          {seatMap ? (
            <div className="relative mt-5">
              <SeatMapSelector
                seatMap={seatMap}
                selectedKeys={selection.seatKeys}
                onToggleSeat={(key) => {
                  if (
                    !selectedSeats.has(key) &&
                    selectedSeats.size >= maxSelectable
                  )
                    return;
                  toggleSeat(key);
                }}
              />
              {selectedSeats.size >= maxSelectable && (
                <p className="mt-2 text-xs text-[#687693]">
                  Maximum {maxSelectable} seats per booking.
                </p>
              )}
            </div>
          ) : ticketOptions.length > 0 ? (
            <div className="mt-5 space-y-3">
              {ticketOptions.map((ticket) => {
                const quantity = selection.ticketQuantities[ticket.id] ?? 0;
                const max = Math.min(
                  ticket.maxPerOrder ?? 10,
                  ticket.quantityAvailable ?? 10,
                );
                const soldOut = ticket.quantityAvailable === 0;
                return (
                  <article
                    key={ticket.id}
                    className={`flex flex-wrap items-center justify-between gap-4 rounded-[12px] border p-4 sm:p-5 ${quantity > 0 ? "border-[#1488ff] bg-[#f3f9ff]" : "border-[#e2eaf4] bg-white"}`}
                  >
                    <div className="min-w-[180px] flex-1">
                      <h3 className="font-bold text-[#162545]">
                        {ticket.name}
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-[#687693]">
                        {ticket.description ?? "Event admission"}
                      </p>
                      {ticket.quantityAvailable !== null &&
                        ticket.quantityAvailable !== undefined && (
                          <p className="mt-1 text-[11px] text-[#7a879b]">
                            {ticket.quantityAvailable} remaining
                          </p>
                        )}
                    </div>
                    <p className="text-lg font-bold text-[#0b1538]">
                      {formatMoney(ticket.price, ticket.currency ?? "NGN")}
                    </p>
                    <div className="flex items-center gap-3 rounded-[10px] border border-[#dfe8f3] bg-white p-1">
                      <button
                        type="button"
                        aria-label={`Remove one ${ticket.name}`}
                        disabled={quantity === 0}
                        onClick={() => changeTicketQuantity(ticket.id, -1)}
                        className="focus-ring grid size-9 place-items-center rounded-lg text-[#315071] hover:bg-[#eff6ff] disabled:opacity-35"
                      >
                        <Minus size={15} aria-hidden="true" />
                      </button>
                      <output
                        aria-label={`${ticket.name} quantity`}
                        className="w-5 text-center text-sm font-bold text-[#142343]"
                      >
                        {quantity}
                      </output>
                      <button
                        type="button"
                        aria-label={`Add one ${ticket.name}`}
                        disabled={soldOut || quantity >= max}
                        onClick={() => changeTicketQuantity(ticket.id, 1)}
                        className="focus-ring grid size-9 place-items-center rounded-lg text-[#087cf0] hover:bg-[#eff6ff] disabled:opacity-35"
                      >
                        <Plus size={15} aria-hidden="true" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-5 rounded-[14px] border border-dashed border-[#cbd9ea] bg-[#f8fbff] px-5 py-12 text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-white text-[#087cf0] shadow-sm">
                <Ticket size={22} aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-bold text-[#162545]">
                Ticket options aren’t available yet
              </h3>
              <p className="mx-auto mt-1.5 max-w-[42ch] text-sm leading-6 text-[#687693]">
                The host hasn’t published ticket prices or configured a seat map
                for this event.
              </p>
              <Link
                href={`/events/${encodeURIComponent(eventId)}`}
                className="focus-ring mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-[#075bff] hover:bg-[#eef4ff]"
              >
                Return to event details{" "}
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          )}
        </section>
        <SelectionSummary
          event={event}
          selection={selection}
          onContinue={continueToCheckout}
          onReleaseSeat={toggleSeat}
        />
      </div>
    </main>
  );
}
