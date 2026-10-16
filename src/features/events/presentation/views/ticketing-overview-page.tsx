"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ArrowRight, CalendarDays, Ticket } from "lucide-react";
import { useEvents } from "../../application/hooks/use-events";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { LoadingState } from "@/shared/components/feedback/loading-state";
import {
  formatTicketMoney,
  getOrderLinesForEvent,
  getOrderTicketCount,
  getSimulatedOrdersSnapshot,
  parseSimulatedOrders,
  subscribeSimulatedOrders,
} from "@/shared/lib/demo-ticketing-store";
import { formatEventDateTime } from "../lib/event-view.utils";

const panel =
  "rounded-[14px] border border-[#e5ebf4] bg-white shadow-[0_3px_14px_rgba(18,44,78,.025)]";

export function TicketingOverviewPage() {
  const { data, isPending, isError, error, refetch, isFetching } = useEvents();
  const ordersSnapshot = useSyncExternalStore(
    subscribeSimulatedOrders,
    getSimulatedOrdersSnapshot,
    () => null,
  );

  if (isPending)
    return <LoadingState label="Loading ticketing events" rows={4} />;
  if (isError)
    return (
      <ErrorState
        title="Ticketing could not be loaded"
        description={error.message || "Check your connection, then try again."}
        retry={() => void refetch()}
        isRetrying={isFetching}
      />
    );

  const events = data ?? [];
  const orders = parseSimulatedOrders(ordersSnapshot);
  const ticketsIssued = orders.reduce(
    (sum, order) => sum + getOrderTicketCount(order),
    0,
  );
  const salesByCurrency = new Map<string, number>();
  for (const order of orders) {
    salesByCurrency.set(
      order.currency,
      (salesByCurrency.get(order.currency) ?? 0) + order.total,
    );
  }
  const demoSales =
    [...salesByCurrency.entries()]
      .map(([currency, amount]) => formatTicketMoney(amount, currency))
      .join(" · ") || "—";

  return (
    <div className="min-w-0 space-y-4 pb-5">
      <header>
        <h1 className="text-[28px] leading-tight font-bold tracking-[-.05em] text-[#101b43] sm:text-[32px]">
          Tickets &amp; Orders
        </h1>
        <p className="mt-1 text-[12px] text-[#61708e]">
          Review orders, ticket holders, and sales recorded in this browser.
        </p>
      </header>

      <section
        className={`${panel} grid gap-3 p-3 sm:grid-cols-3 sm:p-4`}
        aria-label="Demo ticketing summary"
      >
        <SummaryMetric label="Demo orders" value={String(orders.length)} />
        <SummaryMetric label="Tickets issued" value={String(ticketsIssued)} />
        <SummaryMetric label="Gross sales · demo" value={demoSales} />
      </section>

      {events.length ? (
        <ul className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => {
            const eventOrders = orders.filter(
              (order) => getOrderLinesForEvent(order, event.id).length > 0,
            );
            const eventTickets = eventOrders.reduce(
              (sum, order) =>
                sum +
                getOrderLinesForEvent(order, event.id).reduce(
                  (lineSum, line) => lineSum + line.quantity,
                  0,
                ),
              0,
            );

            return (
              <li key={event.id} className={`${panel} min-w-0 p-4`}>
                <span className="grid size-10 place-items-center rounded-xl bg-[#edf4ff] text-[#075bff]">
                  <Ticket size={19} aria-hidden="true" />
                </span>
                <h2 className="mt-3 truncate text-[14px] font-semibold text-[#101b43]">
                  {event.title}
                </h2>
                <p className="mt-1 inline-flex items-center gap-1.5 text-[10px] text-[#687693]">
                  <CalendarDays size={13} aria-hidden="true" />
                  {formatEventDateTime(event.scheduledAt, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <p className="mt-1 text-[10px] text-[#687693]">
                  {eventOrders.length} {eventOrders.length === 1 ? "order" : "orders"}
                  {" · "}
                  {eventTickets} {eventTickets === 1 ? "ticket" : "tickets"} issued
                </p>
                <Link
                  href={`/dashboard/events/${event.id}/tickets`}
                  className="focus-ring mt-4 inline-flex min-h-9 items-center gap-2 rounded-lg border border-[#dce5f2] px-3 text-[10px] font-semibold text-[#075bff] hover:bg-[#f7faff]"
                >
                  Open ticketing <ArrowRight size={13} aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <section className={`${panel} p-4 sm:p-6`}>
          <EmptyState
            title="No events to manage yet"
            description="Create an event first. Ticketing and order details will become available when connected data exists."
            action={{ label: "Create event", href: "/dashboard/events/new" }}
            secondaryAction={{
              label: "View events",
              href: "/dashboard/events",
            }}
            className="border-0 bg-transparent"
          />
        </section>
      )}
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
