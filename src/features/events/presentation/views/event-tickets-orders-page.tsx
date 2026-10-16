"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  ExternalLink,
  Mail,
  Ticket,
} from "lucide-react";
import { useEvent } from "../../application/hooks/use-event";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { LoadingState } from "@/shared/components/feedback/loading-state";
import {
  formatTicketMoney,
  getOrderAttendeesForEvent,
  getOrderLinesForEvent,
  getSimulatedOrdersSnapshot,
  parseSimulatedOrders,
  subscribeSimulatedOrders,
} from "@/shared/lib/demo-ticketing-store";
import { formatEventDateTime } from "../lib/event-view.utils";

const panel =
  "rounded-[14px] border border-[#e5ebf4] bg-white shadow-[0_3px_14px_rgba(18,44,78,.025)]";

export function EventTicketsOrdersPage({
  eventId,
}: {
  readonly eventId: string;
}) {
  const ordersSnapshot = useSyncExternalStore(
    subscribeSimulatedOrders,
    getSimulatedOrdersSnapshot,
    () => null,
  );
  const {
    data: event,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useEvent(eventId);

  if (isPending) return <LoadingState label="Loading ticketing" rows={5} />;
  if (isError || !event)
    return (
      <ErrorState
        title="Tickets and orders could not be loaded"
        description={
          error instanceof Error
            ? error.message
            : "The event service could not complete the request."
        }
        retry={() => void refetch()}
        isRetrying={isFetching}
      />
    );

  const eventOrders = parseSimulatedOrders(ordersSnapshot)
    .map((order) => ({
      order,
      lines: getOrderLinesForEvent(order, event.id),
      attendees: getOrderAttendeesForEvent(order, event.id),
    }))
    .filter((entry) => entry.lines.length > 0);
  const ticketCount = eventOrders.reduce(
    (sum, entry) =>
      sum + entry.lines.reduce((lineSum, line) => lineSum + line.quantity, 0),
    0,
  );
  const salesByCurrency = new Map<string, number>();
  for (const entry of eventOrders) {
    for (const line of entry.lines) {
      salesByCurrency.set(
        line.currency,
        (salesByCurrency.get(line.currency) ?? 0) +
          line.quantity * line.unitPrice,
      );
    }
  }
  const revenueLabel =
    [...salesByCurrency.entries()]
      .map(([currency, amount]) => formatTicketMoney(amount, currency))
      .join(" · ") || "—";

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
          Tickets &amp; Orders
        </span>
      </nav>

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[28px] leading-tight font-bold tracking-[-.05em] text-[#101b43] sm:text-[32px]">
            Tickets &amp; Orders
          </h1>
          <p className="mt-1 text-[12px] text-[#61708e]">
            Ticketing and attendee records for {event.title}.
          </p>
        </div>
        <Link
          href={`/events/${encodeURIComponent(event.id)}`}
          className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#dce5f2] bg-white px-3.5 text-[11px] font-semibold text-[#075bff] hover:bg-[#f7faff]"
        >
          View Event Page <ExternalLink size={14} aria-hidden="true" />
        </Link>
      </header>

      <section
        className={`${panel} flex flex-wrap items-center gap-3 p-3.5 sm:p-4`}
        aria-label="Selected event"
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
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${event.readiness.ticketPricingConfigured ? "bg-[#e5fbf3] text-[#07855e]" : "bg-[#fff4e3] text-[#a96a00]"}`}
        >
          {event.readiness.ticketPricingConfigured
            ? "Ticket setup complete"
            : "Ticket setup needed"}
        </span>
      </section>

      <section className={`${panel} grid gap-3 p-3 sm:grid-cols-3 sm:p-4`}>
        <SummaryMetric label="Orders" value={String(eventOrders.length)} />
        <SummaryMetric label="Tickets issued" value={String(ticketCount)} />
        <SummaryMetric label="Gross sales · demo" value={revenueLabel} />
      </section>

      <section className={`${panel} overflow-hidden`}>
        <div className="border-b border-[#edf1f7] px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-[15px] font-bold text-[#101b43]">
                Orders and ticket holders
              </h2>
              <p className="mt-1 text-[11px] text-[#687693]">
                Completed checkout simulations are recorded here for this
                browser.
              </p>
            </div>
            <span className="rounded-full bg-[#fff4e3] px-2.5 py-1 text-[10px] font-semibold text-[#a96a00]">
              Demo payments
            </span>
          </div>
        </div>

        {eventOrders.length > 0 ? (
          <ul className="divide-y divide-[#edf1f7]">
            {eventOrders.map(({ order, lines, attendees }) => {
              const orderTickets = lines.reduce(
                (sum, line) => sum + line.quantity,
                0,
              );
              const orderAmount = lines.reduce(
                (sum, line) => sum + line.quantity * line.unitPrice,
                0,
              );

              return (
                <li key={`${event.id}-${order.id}`} className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-all text-[12px] font-bold text-[#14213e]">
                        {order.id}
                      </p>
                      <p className="mt-1 text-[10px] text-[#687693]">
                        {new Date(order.createdAt).toLocaleString("en-NG", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                        {` · ${order.paymentMethod}`}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#e5fbf3] px-2.5 py-1 text-[10px] font-semibold text-[#07855e]">
                      <BadgeCheck size={13} aria-hidden="true" /> Paid · demo
                    </span>
                  </div>

                  <dl className="mt-4 grid gap-3 rounded-xl bg-[#f7faff] p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center">
                    <div className="min-w-0">
                      <dt className="text-[9px] font-medium text-[#687693]">
                        Buyer
                      </dt>
                      <dd className="mt-0.5 truncate text-[11px] font-semibold text-[#14213e]">
                        {order.contactName}
                      </dd>
                      <dd className="truncate text-[10px] text-[#687693]">
                        {order.contactEmail}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[9px] font-medium text-[#687693]">
                        Tickets
                      </dt>
                      <dd className="mt-0.5 text-[11px] font-semibold text-[#14213e]">
                        {orderTickets} {orderTickets === 1 ? "ticket" : "tickets"}
                      </dd>
                    </div>
                    <div className="sm:text-right">
                      <dt className="text-[9px] font-medium text-[#687693]">
                        Event total
                      </dt>
                      <dd className="mt-0.5 text-[15px] font-bold text-[#075bff]">
                        {formatTicketMoney(orderAmount, order.currency)}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-3">
                    <h3 className="text-[10px] font-semibold text-[#52617f]">
                      Issued demo tickets
                    </h3>
                    {attendees.length > 0 ? (
                      <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                        {attendees.map((attendee, index) => (
                          <li
                            key={`${order.id}-${attendee.eventId ?? event.id}-${index}`}
                            className="flex min-w-0 items-start gap-2.5 rounded-lg border border-[#e8eef6] px-3 py-2.5"
                          >
                            <Ticket
                              size={15}
                              className="mt-0.5 shrink-0 text-[#075bff]"
                              aria-hidden="true"
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[10px] font-semibold text-[#14213e]">
                                {attendee.name || order.contactName} · {attendee.ticketName}
                              </span>
                              <span className="mt-0.5 flex items-center gap-1 truncate text-[9px] text-[#687693]">
                                <Mail size={11} aria-hidden="true" />
                                {attendee.email || order.contactEmail}
                              </span>
                            </span>
                            <span className="shrink-0 text-[9px] font-medium text-[#07855e]">
                              Issued
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-[10px] text-[#687693]">
                        {orderTickets} ticket records are included in this
                        order; attendee details were not provided.
                      </p>
                    )}
                  </div>

                  <ul className="mt-3 space-y-1.5 border-t border-[#edf1f7] pt-3">
                    {lines.map((line) => (
                      <li
                        key={`${order.id}-${line.id}`}
                        className="flex items-center justify-between gap-3 text-[10px] text-[#687693]"
                      >
                        <span className="min-w-0 truncate">
                          {line.quantity} × {line.name}
                        </span>
                        <span className="shrink-0 font-semibold text-[#52617f]">
                          {formatTicketMoney(
                            line.quantity * line.unitPrice,
                            line.currency,
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState
            icon={<Ticket size={24} strokeWidth={1.8} />}
            title="No orders recorded yet"
            description="After a checkout simulation, the order, demo payment status, and ticket holders will show here. Records are stored in this browser and do not represent real payments."
            action={{
              label: "View event page",
              href: `/events/${encodeURIComponent(event.id)}`,
            }}
            className="border-0 bg-transparent p-5 sm:p-8"
          />
        )}
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

function SummaryMetric({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="min-w-0 rounded-xl bg-[#f7faff] p-3.5">
      <p className="text-[10px] font-medium text-[#687693]">{label}</p>
      <p className="mt-1 truncate text-xl font-bold text-[#101b43]">{value}</p>
    </div>
  );
}
