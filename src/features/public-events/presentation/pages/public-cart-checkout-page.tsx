"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useSyncExternalStore } from "react";
import {
  ArrowRight,
  Check,
  CreditCard,
  LockKeyhole,
  Mail,
  Phone,
  Ticket,
  UserRound,
  UsersRound,
} from "lucide-react";
import type { InputHTMLAttributes } from "react";
import { useEvents } from "@/features/events/application/hooks/use-events";
import type { EventEntity } from "@/features/events/domain/entities/event.entity";
import {
  PublicLoadingState,
  PublicRequestError,
} from "../components/public-query-states";
import {
  formatEventDate,
  formatEventTime,
  isPublicEvent,
} from "../components/public-event-utils";
import {
  clearCheckoutSelection,
  createSimulatedOrderId,
  formatMoney,
  getCheckoutCartSelectionCount,
  getCheckoutLines,
  getCheckoutSelectionCount,
  getClientHydrationSnapshot,
  getServerHydrationSnapshot,
  getCheckoutSelectionSnapshot,
  parseCheckoutCart,
  saveSimulatedOrder,
  subscribeCheckoutSelection,
  subscribeToNoStore,
  type CheckoutLineItem,
  type CheckoutSelection,
  type SimulatedAttendee,
  type SimulatedOrder,
  type SimulatedOrderEvent,
} from "../lib/public-checkout";

type CheckoutGroup = {
  readonly event: EventEntity;
  readonly selection: CheckoutSelection;
  readonly lines: CheckoutLineItem[];
  readonly selectedCount: number;
  readonly pricedCount: number;
};

type AttendeeSlot = {
  readonly eventId: string;
  readonly eventTitle: string;
  readonly ticketName: string;
};

function FormField({
  label,
  icon: Icon,
  required = true,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  readonly label: string;
  readonly icon: typeof UserRound;
  readonly required?: boolean;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs font-semibold text-[#263657]">
        {label} {required && <span className="text-rose-600">*</span>}
      </span>
      <span className="flex min-h-11 items-center gap-2.5 rounded-[9px] border border-[#dce5f0] bg-white px-3.5 transition focus-within:border-[#1688ff] focus-within:ring-2 focus-within:ring-[#1688ff]/15">
        <Icon
          size={17}
          className="shrink-0 text-[#526b91]"
          aria-hidden="true"
        />
        <input
          {...props}
          required={required}
          className="min-w-0 flex-1 bg-transparent text-sm text-[#263657] outline-none placeholder:text-[#a0adbf]"
        />
      </span>
    </label>
  );
}

function buildGroups(
  selections: readonly CheckoutSelection[],
  events: readonly EventEntity[],
): CheckoutGroup[] {
  const eventsById = new Map(events.map((event) => [event.id, event]));
  return selections.flatMap((selection) => {
    const event = eventsById.get(selection.eventId);
    if (!event) return [];
    const lines = getCheckoutLines(event, selection);
    return [
      {
        event,
        selection,
        lines,
        selectedCount: getCheckoutSelectionCount(selection),
        pricedCount: lines.reduce((sum, line) => sum + line.quantity, 0),
      },
    ];
  });
}

function buildAttendeeSlots(groups: readonly CheckoutGroup[]): AttendeeSlot[] {
  return groups.flatMap((group) =>
    group.lines.flatMap((line) =>
      Array.from({ length: line.quantity }, () => ({
        eventId: group.event.id,
        eventTitle: group.event.title,
        ticketName: line.name,
      })),
    ),
  );
}

function BookingProgress() {
  const steps = ["Select tickets", "Checkout & payment", "Confirmation"];
  return (
    <nav
      aria-label="Booking progress"
      className="border-b border-white/10 bg-[#06172f] text-white"
    >
      <ol className="mx-auto flex min-h-[54px] max-w-[1536px] items-center justify-center gap-3 px-4 sm:gap-6">
        {steps.map((label, index) => (
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
              className={`grid size-7 shrink-0 place-items-center rounded-full border text-xs font-bold ${index === 1 ? "border-[#087cf0] bg-[#087cf0] text-white" : index === 0 ? "border-white bg-white text-[#087cf0]" : "border-white/35 bg-white/10 text-white/65"}`}
            >
              {index === 0 ? <Check size={14} aria-hidden="true" /> : index + 1}
            </span>
            <span
              className={
                index === 1 ? "font-semibold text-white" : "text-white/65"
              }
            >
              {label}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function EventOrderSummary({
  groups,
  total,
  currency,
  canPay,
  paying,
}: {
  readonly groups: readonly CheckoutGroup[];
  readonly total: number;
  readonly currency: string;
  readonly canPay: boolean;
  readonly paying: boolean;
}) {
  return (
    <aside className="overflow-hidden rounded-[16px] border border-[#e3ebf5] bg-white shadow-[0_8px_24px_rgba(11,21,56,.05)] lg:sticky lg:top-5">
      <h2 className="px-5 pt-5 text-lg font-bold tracking-[-.025em] text-[#0b1538]">
        Order summary
      </h2>
      <div className="max-h-[min(52vh,520px)] overflow-y-auto px-5 pt-4">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#e9eef6] text-[10px] font-semibold tracking-wide text-[#77849a] uppercase">
              <th className="pb-2">Event and ticket</th>
              <th className="pb-2 text-center">Qty</th>
              <th className="pb-2 text-right">Amount</th>
            </tr>
          </thead>
          {groups.map((group) => (
            <tbody key={group.event.id}>
              <tr className="border-b border-[#edf1f7] bg-[#f6f9fd]">
                <th colSpan={3} className="px-2 py-2.5 text-left">
                  <span className="block text-xs font-bold text-[#162545]">
                    {group.event.title}
                  </span>
                  <span className="mt-0.5 block text-[10px] font-normal text-[#687693]">
                    {formatEventDate(group.event.scheduledAt) ??
                      "Date to be announced"}
                    {formatEventTime(group.event.scheduledAt)
                      ? ` · ${formatEventTime(group.event.scheduledAt)}`
                      : ""}
                  </span>
                </th>
              </tr>
              {group.lines.map((line) => (
                <tr
                  key={`${group.event.id}:${line.id}`}
                  className="border-b border-[#edf1f7] last:border-0"
                >
                  <td className="py-2.5 pr-2 align-top">
                    <span className="block font-semibold text-[#263657]">
                      {line.name}
                    </span>
                    {line.description && (
                      <span className="mt-0.5 line-clamp-2 block text-[10px] leading-4 text-[#77849a]">
                        {line.description}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 text-center align-top text-[#52617f] tabular-nums">
                    {line.quantity}
                  </td>
                  <td className="py-2.5 text-right align-top font-semibold text-[#162545] tabular-nums">
                    {formatMoney(line.unitPrice * line.quantity, line.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
      <div className="border-t border-[#e9eef6] px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <span className="font-semibold text-[#52617f]">Subtotal</span>
          <span className="text-lg font-bold text-[#0b1538] tabular-nums">
            {formatMoney(total, currency)}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-[#77849a]">
          Fees are not configured for this demo.
        </p>
        <button
          type="submit"
          form="combined-cart-payment"
          disabled={!canPay || paying}
          className="focus-ring mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-[#087cf0] px-4 text-sm font-bold text-white transition-colors hover:bg-[#006ee0] disabled:cursor-not-allowed disabled:bg-[#b7c5d8]"
        >
          {paying
            ? "Simulating payment…"
            : `Simulate Paystack payment ${formatMoney(total, currency)}`}
          <ArrowRight size={17} aria-hidden="true" />
        </button>
        <p className="mt-2.5 text-center text-[11px] leading-5 text-[#77849a]">
          Demo only. No real payment is made.
        </p>
      </div>
    </aside>
  );
}

export function PublicCartCheckoutPage() {
  const router = useRouter();
  const { data: events, isPending, isError, refetch } = useEvents();
  const selectionSnapshot = useSyncExternalStore(
    subscribeCheckoutSelection,
    getCheckoutSelectionSnapshot,
    () => null,
  );
  const isHydrated = useSyncExternalStore(
    subscribeToNoStore,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  );
  const selections = useMemo(
    () => parseCheckoutCart(selectionSnapshot),
    [selectionSnapshot],
  );
  const groups = useMemo(
    () => buildGroups(selections, events ?? []),
    [events, selections],
  );
  const attendeeSlots = useMemo(() => buildAttendeeSlots(groups), [groups]);
  const lines = groups.flatMap((group) => group.lines);
  const total = lines.reduce(
    (sum, line) => sum + line.unitPrice * line.quantity,
    0,
  );
  const currency = lines[0]?.currency ?? "NGN";
  const currencies = new Set(lines.map((line) => line.currency));
  const selectedCount = getCheckoutCartSelectionCount(selections);
  const pricedCount = groups.reduce((sum, group) => sum + group.pricedCount, 0);
  const allEventsAvailable =
    groups.length === selections.length &&
    groups.every((group) => isPublicEvent(group.event));
  const canPay =
    selectedCount > 0 &&
    selectedCount === pricedCount &&
    allEventsAvailable &&
    currencies.size === 1;
  const [paying, setPaying] = useState(false);

  async function simulateCombinedPayment(formData: FormData) {
    if (!canPay || !events || paying) return;
    setPaying(true);
    await new Promise((resolve) => window.setTimeout(resolve, 850));

    const attendees: SimulatedAttendee[] = attendeeSlots.map((slot, index) => ({
      name: String(formData.get(`attendee-name-${index}`) ?? "").trim(),
      email: String(formData.get(`attendee-email-${index}`) ?? "").trim(),
      ticketName: slot.ticketName,
      eventId: slot.eventId,
      eventTitle: slot.eventTitle,
    }));
    const orderEvents: SimulatedOrderEvent[] = groups.map((group) => {
      const eventLines = group.lines.map((line) => ({
        ...line,
        eventId: group.event.id,
        eventTitle: group.event.title,
      }));
      return {
        eventId: group.event.id,
        eventTitle: group.event.title,
        scheduledAt: group.event.scheduledAt,
        lines: eventLines,
      };
    });
    const firstEvent = orderEvents[0];
    if (!firstEvent) {
      setPaying(false);
      return;
    }

    const order: SimulatedOrder = {
      id: createSimulatedOrderId(),
      eventId: firstEvent.eventId,
      eventTitle:
        orderEvents.length === 1
          ? firstEvent.eventTitle
          : `${orderEvents.length} event booking`,
      scheduledAt: orderEvents.length === 1 ? firstEvent.scheduledAt : null,
      lines: orderEvents.flatMap((event) => event.lines),
      events: orderEvents,
      total,
      currency,
      paymentMethod: "Paystack demo simulation",
      contactName: String(formData.get("contact-name") ?? "").trim(),
      contactEmail: String(formData.get("contact-email") ?? "").trim(),
      contactPhone: String(formData.get("contact-phone") ?? "").trim(),
      attendees,
      createdAt: new Date().toISOString(),
      paymentStatus: "paid",
      simulated: true,
    };
    saveSimulatedOrder(order);
    clearCheckoutSelection();
    router.push(`/confirmation/${encodeURIComponent(order.id)}`);
  }

  if (!isHydrated || isPending) {
    return (
      <main className="mx-auto min-h-[70vh] max-w-[1440px] px-5 py-8 sm:px-8">
        <PublicLoadingState
          label="Preparing combined checkout"
          variant="page"
        />
      </main>
    );
  }

  if (isError || !events) {
    return (
      <main className="mx-auto min-h-[70vh] max-w-[1440px] px-5 py-8 sm:px-8">
        <PublicRequestError
          title="Checkout could not be loaded"
          onRetry={() => void refetch()}
        />
      </main>
    );
  }

  if (selections.length === 0) {
    return (
      <main className="mx-auto grid min-h-[65vh] place-items-center px-5 py-12 text-center">
        <div>
          <Ticket
            size={30}
            className="mx-auto text-[#087cf0]"
            aria-hidden="true"
          />
          <h1 className="mt-4 text-2xl font-bold text-[#0b1538]">
            Your basket is empty
          </h1>
          <p className="mt-2 text-sm text-[#687693]">
            Add tickets from one or more events to continue.
          </p>
          <Link
            href="/#all-events"
            className="focus-ring mt-5 inline-flex min-h-11 items-center gap-2 rounded-[10px] bg-[#087cf0] px-4 text-sm font-bold text-white hover:bg-[#006ee0]"
          >
            Browse events <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </main>
    );
  }

  const missingEvents = groups.length !== selections.length;
  const mixedCurrencies = currencies.size > 1;
  const unpricedTickets = selectedCount !== pricedCount;

  return (
    <main className="min-w-0 bg-[#f3f8fd] pb-14">
      <BookingProgress />
      <div className="mx-auto max-w-[1536px] px-4 pt-5 sm:px-8 lg:px-12 lg:pt-6">
        <Link
          href="/"
          className="focus-ring inline-flex min-h-9 items-center gap-2 rounded text-sm font-medium text-[#52617f] hover:text-[#075bff]"
        >
          <ArrowRight className="rotate-180" size={15} aria-hidden="true" />
          Back to events
        </Link>
        <div className="mt-4 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(340px,420px)] lg:gap-6">
          <form
            id="combined-cart-payment"
            action={simulateCombinedPayment}
            className="space-y-4"
          >
            <section className="rounded-[16px] border border-[#e3ebf5] bg-white p-5 shadow-[0_8px_24px_rgba(11,21,56,.04)] sm:p-6">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eaf4ff] text-[#087cf0]">
                  <UserRound size={21} aria-hidden="true" />
                </span>
                <div>
                  <h1 className="text-xl font-bold tracking-[-.03em] text-[#0b1538] sm:text-2xl">
                    Contact information
                  </h1>
                  <p className="mt-1 text-sm text-[#687693]">
                    We’ll use these details for this demo order.
                  </p>
                </div>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Full name"
                  icon={UserRound}
                  name="contact-name"
                  autoComplete="name"
                  minLength={2}
                  placeholder="Your full name"
                />
                <FormField
                  label="Email address"
                  icon={Mail}
                  name="contact-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                />
                <FormField
                  label="Phone number"
                  icon={Phone}
                  name="contact-phone"
                  type="tel"
                  autoComplete="tel"
                  minLength={7}
                  placeholder="+234 801 234 5678"
                />
              </div>
            </section>

            <section className="rounded-[16px] border border-[#e3ebf5] bg-white p-5 shadow-[0_8px_24px_rgba(11,21,56,.04)] sm:p-6">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eaf4ff] text-[#087cf0]">
                  <UsersRound size={21} aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-xl font-bold tracking-[-.03em] text-[#0b1538] sm:text-2xl">
                    Ticket holder details
                  </h2>
                  <p className="mt-1 text-sm text-[#687693]">
                    Add a name for each ticket across your events.
                  </p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {attendeeSlots.map((slot, index) => (
                  <div
                    key={`${slot.eventId}:${slot.ticketName}:${index}`}
                    className="grid gap-3 rounded-[12px] border border-[#e8edf5] bg-[#fbfcff] p-4 sm:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)_minmax(0,1.2fr)] sm:items-end"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#162545]">
                        Ticket holder {index + 1}
                      </p>
                      <p className="mt-1 truncate text-[11px] text-[#687693]">
                        {slot.eventTitle} · {slot.ticketName}
                      </p>
                    </div>
                    <FormField
                      label="Full name"
                      icon={UserRound}
                      name={`attendee-name-${index}`}
                      autoComplete="name"
                      minLength={2}
                      placeholder="Ticket holder name"
                    />
                    <FormField
                      label="Email (optional)"
                      icon={Mail}
                      name={`attendee-email-${index}`}
                      type="email"
                      autoComplete="email"
                      required={false}
                      placeholder="name@example.com"
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[16px] border border-[#e3ebf5] bg-white p-5 shadow-[0_8px_24px_rgba(11,21,56,.04)] sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eaf4ff] text-[#087cf0]">
                    <LockKeyhole size={21} aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-[#0b1538]">
                      Payment method
                    </h2>
                    <p className="mt-1 text-sm text-[#687693]">
                      Paystack-style demo simulation. No payment details are
                      collected.
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-2 rounded-lg bg-[#e5fbf3] px-3 py-2 text-xs font-semibold text-[#08704f]">
                  <CreditCard size={15} aria-hidden="true" />
                  Card demo
                </span>
              </div>
            </section>
          </form>

          <div className="space-y-4">
            {(missingEvents ||
              unpricedTickets ||
              mixedCurrencies ||
              !allEventsAvailable) && (
              <div
                role="status"
                className="rounded-[12px] border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900"
              >
                {mixedCurrencies
                  ? "Events in different currencies can’t be paid together."
                  : missingEvents || !allEventsAvailable
                    ? "An event in this basket is unavailable. Remove it from the basket to continue."
                    : "Some tickets need a valid price before checkout can continue."}
              </div>
            )}
            <EventOrderSummary
              groups={groups}
              total={total}
              currency={currency}
              canPay={canPay}
              paying={paying}
            />
            <div className="flex items-start gap-3 rounded-[12px] border border-[#e3ebf5] bg-white px-4 py-3 text-xs leading-5 text-[#52617f]">
              <Check
                size={17}
                className="mt-0.5 shrink-0 text-[#087cf0]"
                aria-hidden="true"
              />
              <p>
                One demo order will include tickets from all events in this
                basket.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
