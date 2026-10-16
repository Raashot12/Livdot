"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  Clipboard,
  FileText,
  Share2,
  Ticket,
} from "lucide-react";
import { useEvents } from "@/features/events/application/hooks/use-events";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import {
  formatEventDate,
  formatEventTime,
  isPublicEvent,
} from "../components/public-event-utils";
import {
  formatMoney,
  getClientHydrationSnapshot,
  getServerHydrationSnapshot,
  getSimulatedOrderSnapshot,
  parseSimulatedOrder,
  subscribeSimulatedOrder,
  subscribeToNoStore,
  type SimulatedOrder,
  type SimulatedOrderEvent,
} from "../lib/public-checkout";

function getOrderEvents(order: SimulatedOrder): SimulatedOrderEvent[] {
  return order.events?.length
    ? [...order.events]
    : [
        {
          eventId: order.eventId,
          eventTitle: order.eventTitle,
          scheduledAt: order.scheduledAt,
          lines: order.lines,
        },
      ];
}

function TicketCode({ orderId }: { readonly orderId: string }) {
  const cells = Array.from({ length: 441 }, (_, index) => {
    const code = orderId.charCodeAt(index % orderId.length) || 0;
    return (index * 17 + code * 3 + Math.floor(index / 7)) % 11 < 5;
  });
  return (
    <div className="rounded-[13px] border border-[#e5ebf4] bg-white p-3 text-center">
      <div
        aria-hidden="true"
        className="relative mx-auto grid aspect-square w-full max-w-[148px] grid-cols-[repeat(21,minmax(0,1fr))] gap-[2px] rounded bg-white p-1"
      >
        {cells.map((filled, index) => (
          <span
            key={index}
            className={
              filled ? "rounded-[1px] bg-[#07152b]" : "rounded-[1px] bg-white"
            }
          />
        ))}
        <span className="absolute inset-x-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-14deg] rounded bg-white px-2 py-1 text-[10px] font-black tracking-wider text-[#087cf0] shadow">
          DEMO
        </span>
      </div>
      <p className="mt-2 text-xs font-bold tracking-wide text-[#162545]">
        {orderId}
      </p>
      <p className="mt-1 text-[10px] leading-4 text-[#77849a]">
        Visual ticket preview · not scannable
      </p>
    </div>
  );
}

function saveTextFile(filename: string, contents: string, mimeType: string) {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function downloadBookingRecord(order: SimulatedOrder) {
  const events = getOrderEvents(order);
  const rows = [
    "LIV DOT — DEMO BOOKING RECORD",
    `Reference: ${order.id}`,
    ...events.flatMap((event) => [
      `Event: ${event.eventTitle}`,
      `Date: ${formatEventDate(event.scheduledAt) ?? "To be announced"}`,
      ...event.lines.map(
        (line) =>
          `${line.quantity} × ${line.name} — ${formatMoney(line.unitPrice * line.quantity, line.currency)}`,
      ),
    ]),
    `Contact: ${order.contactName} <${order.contactEmail}>`,
    `Phone: ${order.contactPhone}`,
    `Payment: ${order.paymentMethod} (simulated)`,
    `Total (simulated): ${formatMoney(order.total, order.currency)}`,
  ];
  saveTextFile(`${order.id}.txt`, rows.join("\n"), "text/plain;charset=utf-8");
}

function addToCalendar(order: SimulatedOrder) {
  if (!order.scheduledAt || (order.events?.length ?? 1) > 1) return;
  const start = new Date(order.scheduledAt);
  if (Number.isNaN(start.getTime())) return;
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const toCalendarDate = (value: Date) =>
    value
      .toISOString()
      .replaceAll("-", "")
      .replaceAll(":", "")
      .replace(/\.\d{3}Z$/, "Z");
  const escape = (value: string) =>
    value
      .replaceAll("\\", "\\\\")
      .replaceAll(";", "\\;")
      .replaceAll(",", "\\,")
      .replaceAll("\n", "\\n");
  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//LIV DOT//Demo Booking//EN",
    "BEGIN:VEVENT",
    `UID:${order.id}@livdot.demo`,
    `DTSTAMP:${toCalendarDate(new Date())}`,
    `DTSTART:${toCalendarDate(start)}`,
    `DTEND:${toCalendarDate(end)}`,
    `SUMMARY:${escape(order.eventTitle)}`,
    `DESCRIPTION:${escape(`Demo booking ${order.id}. This is not a valid event ticket.`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  saveTextFile(`${order.id}.ics`, calendar, "text/calendar;charset=utf-8");
}

function TicketActions({ order }: { readonly order: SimulatedOrder }) {
  const [copied, setCopied] = useState(false);
  const eventCount = order.events?.length ?? 1;

  async function shareEvent() {
    const events = getOrderEvents(order);
    const isMultiEvent = events.length > 1;
    const url = isMultiEvent
      ? `${window.location.origin}/#all-events`
      : `${window.location.origin}/events/${encodeURIComponent(order.eventId)}`;
    const title = isMultiEvent ? "Events on LIV DOT" : order.eventTitle;
    if (navigator.share) {
      await navigator.share({ title, url });
      return;
    }
    await navigator.clipboard?.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      <button
        type="button"
        onClick={() => downloadBookingRecord(order)}
        className="focus-ring inline-flex min-h-[58px] items-center justify-center gap-2 rounded-[10px] bg-[#087cf0] px-3 text-sm font-bold text-white transition hover:bg-[#006ee0]"
      >
        <ArrowDownToLine size={19} aria-hidden="true" />
        <span className="text-left">
          Download demo record
          <small className="block text-[10px] font-normal text-white/75">
            Save as .txt
          </small>
        </span>
      </button>
      <button
        type="button"
        disabled={!order.scheduledAt || eventCount > 1}
        onClick={() => addToCalendar(order)}
        className="focus-ring inline-flex min-h-[58px] items-center justify-center gap-2 rounded-[10px] border border-[#bddcff] bg-white px-3 text-sm font-bold text-[#087cf0] transition hover:bg-[#f2f8ff] disabled:cursor-not-allowed disabled:opacity-45"
      >
        <CalendarDays size={18} aria-hidden="true" />
        <span className="text-left">
          Add to calendar
          <small className="block text-[10px] font-normal text-[#687693]">
            Download .ics
          </small>
        </span>
      </button>
      <a
        href="#order-summary"
        className="focus-ring inline-flex min-h-[58px] items-center justify-center gap-2 rounded-[10px] border border-[#bddcff] bg-white px-3 text-sm font-bold text-[#087cf0] transition hover:bg-[#f2f8ff]"
      >
        <FileText size={18} aria-hidden="true" />
        <span className="text-left">
          View order
          <small className="block text-[10px] font-normal text-[#687693]">
            See full details
          </small>
        </span>
      </a>
      <button
        type="button"
        onClick={() => void shareEvent()}
        className="focus-ring inline-flex min-h-[58px] items-center justify-center gap-2 rounded-[10px] border border-[#bddcff] bg-white px-3 text-sm font-bold text-[#087cf0] transition hover:bg-[#f2f8ff]"
      >
        <Share2 size={18} aria-hidden="true" />
        <span className="text-left">
          {copied
            ? "Link copied"
            : eventCount > 1
              ? "Share events"
              : "Share event"}
          <small className="block text-[10px] font-normal text-[#687693]">
            Tell your friends
          </small>
        </span>
      </button>
    </div>
  );
}

function RecommendationEvents({
  currentEventIds,
}: {
  readonly currentEventIds: readonly string[];
}) {
  const { data } = useEvents();
  const currentIds = new Set(currentEventIds);
  const events = (data ?? [])
    .filter((event) => !currentIds.has(event.id) && isPublicEvent(event))
    .slice(0, 4);
  return (
    <section className="mt-5 rounded-[16px] border border-[#e3ebf5] bg-white p-5 shadow-[0_8px_24px_rgba(11,21,56,.04)] sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-[-.03em] text-[#0b1538]">
            You might also like
          </h2>
          <p className="mt-1 text-sm text-[#687693]">
            More events listed on LIV DOT.
          </p>
        </div>
        <Link
          href="/#all-events"
          className="focus-ring inline-flex min-h-9 shrink-0 items-center gap-1 rounded px-2 text-xs font-semibold text-[#087cf0] hover:bg-[#eff6ff]"
        >
          View all events <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
      {events.length ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {events.map((event, index) => (
            <Link
              key={event.id}
              href={`/events/${encodeURIComponent(event.id)}`}
              className={`focus-ring group relative min-h-[142px] overflow-hidden rounded-[12px] p-4 text-white shadow-sm ${index % 2 ? "bg-[linear-gradient(135deg,#18376e,#07142a_72%)]" : "bg-[linear-gradient(135deg,#0b5793,#06152d_72%)]"}`}
            >
              <span
                className="absolute -right-6 -bottom-12 size-36 rounded-full border-[18px] border-white/5 transition-transform group-hover:scale-110"
                aria-hidden="true"
              />
              <span className="relative inline-flex rounded-full border border-white/25 bg-white/10 px-2 py-1 text-[9px] font-semibold tracking-wide uppercase">
                Event
              </span>
              <h3 className="relative mt-4 line-clamp-2 text-base font-bold">
                {event.title}
              </h3>
              <p className="relative mt-2 flex items-center gap-1.5 text-xs text-white/75">
                <CalendarDays size={13} aria-hidden="true" />
                {formatEventDate(event.scheduledAt) ?? "Date to be announced"}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#f5f9ff] px-4 py-4">
          <p className="text-sm text-[#52617f]">
            New public events will show here when they are published.
          </p>
          <Link
            href="/#all-events"
            className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#d5e4f5] bg-white px-3 text-sm font-semibold text-[#087cf0] hover:bg-[#eff6ff]"
          >
            Explore events <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      )}
    </section>
  );
}

function ConfirmedOrder({ order }: { readonly order: SimulatedOrder }) {
  const orderEvents = getOrderEvents(order);
  const multipleEvents = orderEvents.length > 1;
  const date = multipleEvents ? null : formatEventDate(order.scheduledAt);
  const time = multipleEvents ? null : formatEventTime(order.scheduledAt);
  const attendees = order.attendees
    .map((attendee) => attendee.name)
    .filter(Boolean)
    .join(", ");
  return (
    <>
      <section className="relative isolate overflow-hidden bg-[#03132c] text-white">
        <Image
          src="/brand/live-performance.webp"
          alt="Illustrative live performance artwork"
          fill
          sizes="100vw"
          priority
          className="-z-20 object-cover object-[center_48%]"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(3,19,44,.98)_0%,rgba(3,19,44,.84)_56%,rgba(3,19,44,.34)_100%)]" />
        <div className="mx-auto flex max-w-[1536px] items-center gap-5 px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
          <span className="grid size-[76px] shrink-0 place-items-center rounded-full border-[5px] border-[#00b8ff] bg-[#087cf0]/10 shadow-[0_0_34px_rgba(0,175,255,.2)] sm:size-[94px]">
            <Check size={50} strokeWidth={3} aria-hidden="true" />
          </span>
          <div>
            <span className="text-xs font-bold tracking-[.12em] text-[#19d7ed] sm:text-sm">
              DEMO BOOKING CONFIRMED
            </span>
            <h1 className="mt-1 text-[clamp(1.9rem,4.2vw,3.2rem)] leading-[1.04] font-bold tracking-[-.045em]">
              Thank you, {order.contactName.split(" ")[0]}!
            </h1>
            <p className="mt-2 text-sm text-white/90 sm:text-lg">
              Your Paystack style payment simulation is complete.
            </p>
            <p className="mt-1 text-xs text-white/70 sm:text-sm">
              This demo order is stored in this browser session. No real payment
              was made.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-[1536px] items-start gap-5 px-4 pt-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(340px,416px)] lg:gap-6 lg:px-12 lg:pt-6">
        <section className="rounded-[16px] border border-[#e3ebf5] bg-white p-4 shadow-[0_8px_24px_rgba(11,21,56,.045)] sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="text-xl font-bold tracking-[-.03em] text-[#0b1538] sm:text-2xl">
              Your demo ticket{multipleEvents ? "s" : ""}
            </h2>
            <div className="flex items-center gap-2 text-xs text-[#687693] sm:text-sm">
              <span>Booking reference:</span>
              <strong className="text-[#162545]">{order.id}</strong>
              <button
                type="button"
                onClick={() => void navigator.clipboard?.writeText(order.id)}
                aria-label="Copy booking reference"
                className="focus-ring grid size-8 place-items-center rounded-lg text-[#526b91] hover:bg-[#f1f6fc]"
              >
                <Clipboard size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="mt-4 grid overflow-hidden rounded-[14px] border border-[#e4ebf4] lg:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)_170px]">
            <div className="relative min-h-[245px] bg-[#07172f] text-white sm:min-h-[270px]">
              <Image
                src="/brand/live-performance.webp"
                alt="Illustrative event ticket artwork"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#030b16]/90 via-[#06152a]/15 to-transparent" />
              <div className="absolute top-3 left-3 rounded-full border border-white/25 bg-[#03132c]/45 px-2.5 py-1 text-[9px] font-bold tracking-wide uppercase">
                Simulated ticket
              </div>
              <div className="absolute right-4 bottom-4 left-4">
                <p className="text-[10px] font-semibold tracking-[.13em] text-[#bdeaff]">
                  LIV DOT · DEMO
                </p>
                <h3 className="mt-1 max-w-[20ch] text-[clamp(1.35rem,2.5vw,2rem)] leading-[1.02] font-black tracking-[-.035em] uppercase">
                  {multipleEvents
                    ? `${orderEvents.length} event booking`
                    : order.eventTitle}
                </h3>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-white/85">
                  <CalendarDays size={14} aria-hidden="true" />
                  {multipleEvents
                    ? "Multiple event dates"
                    : (date ?? "Date to be announced")}
                  {time ? ` · ${time}` : ""}
                </p>
              </div>
            </div>
            <div className="flex flex-col justify-between gap-5 border-y border-dashed border-[#cfdbea] bg-white p-4 sm:p-5 lg:border-y-0 lg:border-r">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-[#eaf4ff] px-2.5 py-1 text-[10px] font-bold tracking-wide text-[#087cf0] uppercase">
                  Ticket details
                </span>
                <span className="text-[10px] text-[#77849a]">
                  {order.attendees.length}{" "}
                  {order.attendees.length === 1 ? "attendee" : "attendees"}
                </span>
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-xs">
                <div>
                  <dt className="text-[#77849a]">Attendee</dt>
                  <dd className="mt-1 font-semibold text-[#162545]">
                    {attendees || order.contactName}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#77849a]">Ticket type</dt>
                  <dd className="mt-1 font-semibold text-[#162545]">
                    {multipleEvents
                      ? `${orderEvents.length} events`
                      : order.lines.map((line) => line.name).join(", ")}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#77849a]">Date & time</dt>
                  <dd className="mt-1 leading-5 font-semibold text-[#162545]">
                    {multipleEvents
                      ? "Multiple event dates"
                      : (date ?? "To be announced")}
                    {time && (
                      <span className="block font-normal text-[#687693]">
                        {time}
                      </span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#77849a]">Venue</dt>
                  <dd className="mt-1 font-semibold text-[#162545]">
                    {multipleEvents ? "See order summary" : "See event details"}
                  </dd>
                </div>
              </dl>
              <p className="border-t border-[#edf1f7] pt-3 text-[10px] leading-4 text-[#77849a]">
                This ticket preview is for UI testing and cannot be used for
                event entry.
              </p>
            </div>
            <div className="grid place-items-center bg-[#f8fbff] p-4">
              <TicketCode orderId={order.id} />
            </div>
          </div>
          <TicketActions order={order} />
        </section>

        <aside className="space-y-4">
          <section className="rounded-[14px] border border-[#a9ead4] bg-[#e5fbf3] px-4 py-4 text-[#07543f]">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-[#078d67] text-white">
                <Check size={22} strokeWidth={3} aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-bold">Simulation complete</h2>
                <p className="mt-0.5 text-xs leading-5">
                  The demo payment was marked successful.
                </p>
              </div>
            </div>
          </section>
          <section
            id="order-summary"
            className="scroll-mt-5 rounded-[14px] border border-[#e3ebf5] bg-white p-5 shadow-[0_8px_24px_rgba(11,21,56,.04)]"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-bold tracking-[-.025em] text-[#0b1538]">
                Order summary
              </h2>
              <span className="text-right text-[10px] leading-4 text-[#77849a]">
                {new Intl.DateTimeFormat("en-NG", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(order.createdAt))}
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {orderEvents.map((event) => (
                <section
                  key={event.eventId}
                  className="rounded-xl bg-[#f4f8fd] p-3"
                >
                  <h3 className="text-sm font-bold text-[#162545]">
                    {event.eventTitle}
                  </h3>
                  <p className="mt-1 text-xs text-[#687693]">
                    {formatEventDate(event.scheduledAt) ??
                      "Date to be announced"}
                    {formatEventTime(event.scheduledAt)
                      ? ` · ${formatEventTime(event.scheduledAt)}`
                      : ""}
                  </p>
                  <dl className="mt-3 space-y-2 border-t border-[#e1eaf5] pt-2.5 text-xs">
                    {event.lines.map((line) => (
                      <div
                        key={`${event.eventId}:${line.id}`}
                        className="flex justify-between gap-3"
                      >
                        <dt className="text-[#52617f]">
                          {line.name} × {line.quantity}
                        </dt>
                        <dd className="shrink-0 font-semibold text-[#162545]">
                          {formatMoney(
                            line.unitPrice * line.quantity,
                            line.currency,
                          )}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}
            </div>
            <dl className="mt-4 space-y-3 border-b border-[#edf1f7] pb-4 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-[#52617f]">Fees</dt>
                <dd className="text-[#77849a]">Not configured</dd>
              </div>
            </dl>
            <div className="flex items-center justify-between gap-3 pt-4">
              <span className="font-bold text-[#0b1538]">Total simulated</span>
              <strong className="text-xl font-bold tracking-[-.025em] text-[#0b1538]">
                {formatMoney(order.total, order.currency)}
              </strong>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#edf1f7] pt-4 text-xs">
              <span className="text-[#687693]">Payment method</span>
              <span className="font-semibold text-[#162545]">
                {order.paymentMethod} · Demo
              </span>
            </div>
            <p className="mt-3 rounded-lg bg-[#f3f8fd] px-3 py-2.5 text-[11px] leading-5 text-[#687693]">
              This order exists only in this browser session. It is not a real
              purchase.
            </p>
          </section>
        </aside>
      </div>
      <div className="mx-auto max-w-[1536px] px-4 sm:px-8 lg:px-12">
        <RecommendationEvents
          currentEventIds={orderEvents.map((event) => event.eventId)}
        />
      </div>
    </>
  );
}

export function PublicOrderConfirmationPage({
  orderId,
}: {
  readonly orderId: string;
}) {
  const orderSnapshot = useSyncExternalStore(
    subscribeSimulatedOrder,
    () => getSimulatedOrderSnapshot(orderId),
    () => null,
  );
  const isHydrated = useSyncExternalStore(
    subscribeToNoStore,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  );
  const order = parseSimulatedOrder(orderSnapshot, orderId);

  if (!isHydrated) {
    return (
      <main className="mx-auto min-h-[55vh] w-full max-w-[1440px] px-5 py-10 sm:px-8">
        <div
          role="status"
          className="h-64 animate-pulse rounded-2xl border border-[#e5ebf4] bg-white"
          aria-label="Loading booking confirmation"
        />
      </main>
    );
  }

  if (!order) {
    return (
      <main className="mx-auto min-h-[60vh] w-full max-w-[960px] px-5 pt-8 pb-20 sm:px-8 sm:pt-12">
        <nav
          aria-label="Breadcrumb"
          className="mb-7 flex items-center gap-2 text-sm text-[#687693]"
        >
          <Link
            href="/"
            className="focus-ring rounded text-[#075bff] hover:underline"
          >
            Discover events
          </Link>
          <ChevronRight size={15} aria-hidden="true" />
          <span aria-current="page" className="text-[#52617f]">
            Confirmation
          </span>
        </nav>
        <section className="rounded-[24px] border border-[#e5ebf4] bg-white p-5 shadow-[0_12px_40px_rgba(11,21,56,.055)] sm:p-10">
          <EmptyState
            title="This demo order isn’t available in this browser session"
            description="Complete the checkout simulation in this browser to create a demo confirmation and ticket preview."
            icon={<Ticket size={26} strokeWidth={1.8} />}
            action={{ label: "Browse events", href: "/" }}
            className="border-[#e5ebf4] bg-[#fbfcff]"
          />
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="focus-ring inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#075bff] hover:bg-[#eef4ff]"
            >
              Return to event discovery{" "}
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-w-0 bg-[#f3f8fd] pb-12">
      <ConfirmedOrder order={order} />
    </main>
  );
}
