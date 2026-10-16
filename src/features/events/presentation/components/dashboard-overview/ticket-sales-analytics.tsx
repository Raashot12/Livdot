"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ArrowRight, Banknote, Ticket, Users } from "lucide-react";
import {
  formatTicketMoney,
  getOrderTicketCount,
  getSimulatedOrdersSnapshot,
  parseSimulatedOrders,
  subscribeSimulatedOrders,
} from "@/shared/lib/demo-ticketing-store";
import { DASHBOARD_PANEL_CLASS } from "../../constants/dashboard-overview.constants";

export function TicketSalesAnalytics() {
  const ordersSnapshot = useSyncExternalStore(
    subscribeSimulatedOrders,
    getSimulatedOrdersSnapshot,
    () => null,
  );
  const orders = parseSimulatedOrders(ordersSnapshot);
  const ticketsSold = orders.reduce(
    (sum, order) => sum + getOrderTicketCount(order),
    0,
  );
  const ticketHolders = orders.reduce(
    (sum, order) =>
      sum + (order.attendees.length || getOrderTicketCount(order)),
    0,
  );
  const revenueByCurrency = new Map<string, number>();
  for (const order of orders) {
    revenueByCurrency.set(
      order.currency,
      (revenueByCurrency.get(order.currency) ?? 0) + order.total,
    );
  }
  const revenue =
    [...revenueByCurrency.entries()]
      .map(([currency, amount]) => formatTicketMoney(amount, currency))
      .join(" · ") || "—";

  const metrics = [
    { label: "Ticket holders", value: ticketHolders, icon: Users },
    { label: "Tickets sold", value: ticketsSold, icon: Ticket },
    { label: "Gross revenue · demo", value: revenue, icon: Banknote },
  ];

  return (
    <section className={`${DASHBOARD_PANEL_CLASS} p-4 sm:p-[17px]`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-bold tracking-[-.035em] text-[#101b43]">
            Audience &amp; Revenue
          </h2>
          <p className="mt-1 text-[10px] text-[#687693]">
            Ticket activity from completed checkouts.
          </p>
        </div>
        <Link
          href="/dashboard/tickets"
          className="focus-ring inline-flex shrink-0 items-center gap-1 rounded text-[11px] font-semibold text-[#075bff] hover:text-[#0046d5]"
        >
          Orders <ArrowRight size={13} aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {metrics.map(({ label, value, icon: Icon }) => (
          <article
            key={label}
            className="min-w-0 rounded-[10px] border border-[#edf1f7] bg-[#f9fbfe] px-3 py-3"
          >
            <div className="flex items-center gap-1.5 text-[#687693]">
              <Icon size={13} aria-hidden="true" />
              <p className="truncate text-[10px] font-medium">{label}</p>
            </div>
            <p className="mt-2 truncate text-[18px] leading-tight font-bold tracking-[-.03em] text-[#101b43] tabular-nums">
              {value}
            </p>
          </article>
        ))}
      </div>
      <p className="mt-3 text-[10px] leading-4 text-[#687693]">
        {orders.length
          ? `${orders.length} completed order${orders.length === 1 ? "" : "s"}. Demo records are saved in this browser.`
          : "Completed ticket purchases will appear here. Demo records are saved in this browser."}
      </p>
    </section>
  );
}
