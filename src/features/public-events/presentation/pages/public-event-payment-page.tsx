"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useSyncExternalStore } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  CalendarDays,
  Check,
  CreditCard,
  Hash,
  LockKeyhole,
  Mail,
  Smartphone,
  Ticket,
  UserRound,
  UsersRound,
} from "lucide-react";
import type { InputHTMLAttributes } from "react";
import { useEvent } from "@/features/events/application/hooks/use-event";
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
  createSimulatedOrderId,
  formatMoney,
  getCheckoutSelectionSnapshot,
  getClientHydrationSnapshot,
  getCheckoutLines,
  getServerHydrationSnapshot,
  parseCheckoutSelection,
  removeCheckoutEventSelection,
  saveSimulatedOrder,
  subscribeCheckoutSelection,
  subscribeToNoStore,
  type CheckoutLineItem,
  type SimulatedOrder,
} from "../lib/public-checkout";

type PaymentMethod = "card" | "bank" | "ussd" | "mobile";

const paymentMethods: {
  id: PaymentMethod;
  label: string;
  icon: typeof CreditCard;
}[] = [
  { id: "card", label: "Card", icon: CreditCard },
  { id: "bank", label: "Bank transfer", icon: Banknote },
  { id: "ussd", label: "USSD", icon: Hash },
  { id: "mobile", label: "Mobile money", icon: Smartphone },
];

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

function FormField({
  label,
  icon: Icon,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  readonly label: string;
  readonly icon: typeof UserRound;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs font-semibold text-[#263657]">
        {label} <span className="text-rose-600">*</span>
      </span>
      <span className="flex min-h-11 items-center gap-2.5 rounded-[9px] border border-[#dce5f0] bg-white px-3.5 shadow-[0_2px_5px_rgba(11,21,56,.025)] transition focus-within:border-[#1688ff] focus-within:ring-2 focus-within:ring-[#1688ff]/15">
        <Icon
          size={17}
          className="shrink-0 text-[#526b91]"
          aria-hidden="true"
        />
        <input
          {...props}
          required
          className="min-w-0 flex-1 bg-transparent text-sm text-[#263657] outline-none placeholder:text-[#a0adbf]"
        />
      </span>
    </label>
  );
}

function OrderSummary({
  title,
  scheduledAt,
  lines,
  total,
  currency,
  onEdit,
  canSubmit,
  paying,
}: {
  readonly title: string;
  readonly scheduledAt: string | null;
  readonly lines: readonly CheckoutLineItem[];
  readonly total: number;
  readonly currency: string;
  readonly onEdit: () => void;
  readonly canSubmit: boolean;
  readonly paying: boolean;
}) {
  return (
    <aside className="overflow-hidden rounded-[16px] border border-[#e3ebf5] bg-white shadow-[0_10px_30px_rgba(11,21,56,.06)] lg:sticky lg:top-5">
      <h2 className="px-5 pt-5 text-lg font-bold tracking-[-.025em] text-[#0b1538]">
        Order summary
      </h2>
      <div className="relative mx-5 mt-4 h-[176px] overflow-hidden rounded-[12px] bg-[#06172f]">
        <Image
          src="/brand/live-performance.webp"
          alt="Illustrative live performance"
          fill
          sizes="(max-width: 1024px) 100vw, 420px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#03132c]/95 via-[#03132c]/55 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
          <span className="mb-2 w-fit rounded-full border border-white/30 bg-black/25 px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase">
            Event
          </span>
          <h3 className="max-w-[23ch] text-lg leading-tight font-bold">
            {title}
          </h3>
          <p className="mt-2 flex items-center gap-2 text-xs text-white/85">
            <CalendarDays size={14} aria-hidden="true" />
            {formatEventDate(scheduledAt) ?? "Date to be announced"}
            {formatEventTime(scheduledAt)
              ? ` · ${formatEventTime(scheduledAt)}`
              : ""}
          </p>
        </div>
      </div>
      <div className="px-5 pt-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-[#142343]">Selected tickets</h3>
          <button
            type="button"
            onClick={onEdit}
            className="focus-ring rounded px-1.5 py-1 text-xs font-semibold text-[#087cf0] hover:bg-[#eff6ff]"
          >
            Edit tickets
          </button>
        </div>
        <ul className="mt-3 space-y-2.5">
          {lines.map((line) => (
            <li
              key={line.id}
              className="flex items-start justify-between gap-3 rounded-[10px] bg-[#f3f8fd] px-3.5 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-[#162545]">
                  {line.name}{" "}
                  <span className="font-normal text-[#687693]">
                    × {line.quantity}
                  </span>
                </p>
                {line.description && (
                  <p className="mt-1 text-xs leading-4 text-[#687693]">
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
        <div className="mt-4 space-y-2 border-t border-[#e9eef6] pt-3 text-sm">
          <div className="flex justify-between gap-3 text-[#687693]">
            <span>Ticket subtotal</span>
            <span>{formatMoney(total, currency)}</span>
          </div>
          <div className="flex justify-between gap-3 text-[#687693]">
            <span>Fees</span>
            <span>Not configured</span>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between rounded-[10px] bg-[#eef7ff] px-3.5 py-3.5">
          <span className="font-bold text-[#142343]">Total amount</span>
          <span className="text-xl font-bold tracking-[-.03em] text-[#087cf0]">
            {formatMoney(total, currency)}
          </span>
        </div>
        <div className="my-3 flex items-start gap-2.5 rounded-[10px] bg-[#f3f8fd] px-3 py-3 text-xs leading-5 text-[#52617f]">
          <Check
            size={16}
            className="mt-0.5 shrink-0 text-[#087cf0]"
            aria-hidden="true"
          />
          Your demo ticket details will appear on the next screen after the
          simulation completes.
        </div>
        <button
          type="submit"
          form="simulated-payment"
          disabled={!canSubmit || paying}
          className="focus-ring inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-[#087cf0] px-4 text-sm font-bold text-white transition hover:bg-[#006ee0] disabled:cursor-not-allowed disabled:bg-[#b7c5d8]"
        >
          {paying
            ? "Simulating payment…"
            : `Simulate payment ${formatMoney(total, currency)}`}{" "}
          <ArrowRight size={17} aria-hidden="true" />
        </button>
        <p className="mt-2.5 text-center text-[11px] leading-5 text-[#77849a]">
          Paystack style test only. No real money is moved.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2 px-5 pb-5 text-center text-[10px] text-[#52617f]">
        <span className="rounded-lg bg-[#f7faff] px-2 py-2">
          <LockKeyhole
            className="mx-auto mb-1 text-[#0c9b72]"
            size={17}
            aria-hidden="true"
          />
          Secure demo
        </span>
        <span className="rounded-lg bg-[#f7faff] px-2 py-2">
          <Check
            className="mx-auto mb-1 text-[#087cf0]"
            size={17}
            aria-hidden="true"
          />
          Instant preview
        </span>
        <span className="rounded-lg bg-[#f7faff] px-2 py-2">
          <Ticket
            className="mx-auto mb-1 text-[#0c9b72]"
            size={17}
            aria-hidden="true"
          />
          No real charge
        </span>
      </div>
    </aside>
  );
}

export function PublicEventPaymentPage({
  eventId,
}: {
  readonly eventId: string;
}) {
  const router = useRouter();
  const { data: event, isPending, isError, refetch } = useEvent(eventId);
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
  const selection = parseCheckoutSelection(selectionSnapshot, eventId);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [attendeeNames, setAttendeeNames] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [paying, setPaying] = useState(false);
  const lines = useMemo(
    () => (event && selection ? getCheckoutLines(event, selection) : []),
    [event, selection],
  );
  const attendeeCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const total = lines.reduce(
    (sum, line) => sum + line.unitPrice * line.quantity,
    0,
  );
  const currency = lines[0]?.currency ?? "NGN";

  async function simulatePayment(formData: FormData) {
    if (!event || !selection || lines.length === 0 || paying) return;
    setPaying(true);
    await new Promise((resolve) => window.setTimeout(resolve, 850));
    const attendeeTicketNames = lines.flatMap((line) =>
      Array.from({ length: line.quantity }, () => line.name),
    );
    const attendees = attendeeNames.map((name, index) => ({
      name: name.trim(),
      email: String(formData.get(`attendee-email-${index}`) ?? "").trim(),
      ticketName: attendeeTicketNames[index] ?? "Event ticket",
    }));
    const orderLines = lines.map((line) => ({
      ...line,
      eventId: event.id,
      eventTitle: event.title,
    }));
    const order: SimulatedOrder = {
      id: createSimulatedOrderId(),
      eventId: event.id,
      eventTitle: event.title,
      scheduledAt: event.scheduledAt,
      lines: orderLines,
      events: [
        {
          eventId: event.id,
          eventTitle: event.title,
          scheduledAt: event.scheduledAt,
          lines: orderLines,
        },
      ],
      total,
      currency,
      paymentMethod:
        paymentMethods.find((method) => method.id === paymentMethod)?.label ??
        "Card",
      contactName: String(formData.get("contact-name") ?? "").trim(),
      contactEmail: String(formData.get("contact-email") ?? "").trim(),
      contactPhone: String(formData.get("phone") ?? "").trim(),
      attendees,
      createdAt: new Date().toISOString(),
      paymentStatus: "paid",
      simulated: true,
    };
    saveSimulatedOrder(order);
    removeCheckoutEventSelection(event.id);
    router.push(`/confirmation/${encodeURIComponent(order.id)}`);
  }

  if (isPending || !isHydrated) {
    return (
      <main className="mx-auto min-h-[70vh] max-w-[1440px] px-5 py-8 sm:px-8">
        <PublicLoadingState label="Preparing checkout" variant="page" />
      </main>
    );
  }
  if (isError || !event) {
    return (
      <main className="mx-auto min-h-[70vh] max-w-[1440px] px-5 py-8 sm:px-8">
        <PublicRequestError
          title="Checkout could not be loaded"
          onRetry={() => void refetch()}
        />
      </main>
    );
  }
  if (
    !isPublicEvent(event) ||
    !selection ||
    selection.eventId !== event.id ||
    lines.length === 0 ||
    attendeeCount === 0
  ) {
    return (
      <main className="mx-auto min-h-[70vh] max-w-[1440px] px-5 py-12 text-center">
        <h1 className="text-2xl font-bold text-[#0b1538]">
          Your ticket selection has expired
        </h1>
        <p className="mt-2 text-sm text-[#687693]">
          Select tickets again to continue to checkout.
        </p>
        <Link
          href={`/checkout/${encodeURIComponent(eventId)}`}
          className="focus-ring mt-5 inline-flex min-h-11 items-center gap-2 rounded-[10px] bg-[#087cf0] px-4 text-sm font-bold text-white"
        >
          Choose tickets <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </main>
    );
  }

  const canSimulate =
    attendeeNames.length === attendeeCount &&
    attendeeNames.every((name) => name.trim().length >= 2);

  return (
    <main className="min-w-0 bg-[#f3f8fd] pb-14">
      <BookingProgress />
      <div className="mx-auto grid w-full max-w-[1536px] items-start gap-5 px-4 pt-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(340px,420px)] lg:gap-6 lg:px-12 lg:pt-6">
        <div className="space-y-4">
          <section className="rounded-[16px] border border-[#e3ebf5] bg-white p-5 shadow-[0_8px_24px_rgba(11,21,56,.04)] sm:p-6">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eaf4ff] text-[#087cf0]">
                <UserRound size={21} aria-hidden="true" />
              </span>
              <div>
                <h1 className="text-xl font-bold tracking-[-.03em] text-[#0b1538] sm:text-2xl">
                  Event & ticket holder information
                </h1>
                <p className="mt-1 text-sm text-[#687693]">
                  We’ll use this email to send your demo ticket and event
                  updates.
                </p>
              </div>
            </div>
            <form
              id="simulated-payment"
              action={simulatePayment}
              className="mt-5"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Full name"
                  icon={UserRound}
                  name="contact-name"
                  autoComplete="name"
                  placeholder="Your full name"
                  value={contactName}
                  onChange={(event) => setContactName(event.target.value)}
                />
                <FormField
                  label="Email address"
                  icon={Mail}
                  name="contact-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={contactEmail}
                  onChange={(event) => setContactEmail(event.target.value)}
                />
                <FormField
                  label="Phone number"
                  icon={Smartphone}
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+234 801 234 5678"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
                <label className="flex min-h-11 items-center gap-2.5 self-end pb-1 text-xs leading-5 text-[#52617f]">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="size-4 accent-[#087cf0]"
                  />
                  Send event updates and reminders to this email.
                </label>
              </div>
              <div className="mt-5 border-t border-[#edf1f7] pt-5">
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eaf4ff] text-[#087cf0]">
                    <UsersRound size={21} aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold tracking-[-.025em] text-[#0b1538]">
                      Attendee details
                    </h2>
                    <p className="mt-0.5 text-sm text-[#687693]">
                      Enter the name for each ticket.
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  {Array.from({ length: attendeeCount }, (_, index) => (
                    <div
                      key={index}
                      className="grid gap-3 rounded-[11px] border border-[#e6edf6] bg-[#fbfdff] p-3 sm:grid-cols-[120px_minmax(0,1fr)_minmax(0,1fr)] sm:items-end sm:p-4"
                    >
                      <div className="flex items-center gap-2.5 self-center">
                        <span className="grid size-9 place-items-center rounded-full bg-[#e6f4ff] text-[#278ded]">
                          <UserRound size={16} aria-hidden="true" />
                        </span>
                        <div>
                          <p className="text-xs font-bold text-[#162545]">
                            Attendee {index + 1}
                          </p>
                          <p className="text-[11px] text-[#687693]">
                            {lines.flatMap((line) =>
                              Array.from(
                                { length: line.quantity },
                                () => line.name,
                              ),
                            )[index] ?? lines[0]?.name}
                          </p>
                        </div>
                      </div>
                      <label className="block">
                        <span className="mb-1.5 block text-[11px] font-semibold text-[#52617f]">
                          Full name <span className="text-rose-600">*</span>
                        </span>
                        <input
                          required
                          minLength={2}
                          value={attendeeNames[index] ?? ""}
                          onChange={(event) =>
                            setAttendeeNames((current) => {
                              const next = [...current];
                              next[index] = event.target.value;
                              return next;
                            })
                          }
                          placeholder="Ticket holder name"
                          className="focus-ring min-h-10 w-full rounded-[8px] border border-[#dce5f0] bg-white px-3 text-sm text-[#263657] placeholder:text-[#a0adbf]"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1.5 block text-[11px] font-semibold text-[#52617f]">
                          Email <span className="font-normal">(optional)</span>
                        </span>
                        <input
                          name={`attendee-email-${index}`}
                          type="email"
                          placeholder="attendee@example.com"
                          className="focus-ring min-h-10 w-full rounded-[8px] border border-[#dce5f0] bg-white px-3 text-sm text-[#263657] placeholder:text-[#a0adbf]"
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <section
                className="mt-5 border-t border-[#edf1f7] pt-5"
                aria-labelledby="payment-method-heading"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eaf4ff] text-[#087cf0]">
                      <LockKeyhole size={20} aria-hidden="true" />
                    </span>
                    <div>
                      <h2
                        id="payment-method-heading"
                        className="text-lg font-bold tracking-[-.025em] text-[#0b1538]"
                      >
                        Payment method
                      </h2>
                      <p className="mt-0.5 text-sm text-[#687693]">
                        Paystack-style test simulation · no real payment is
                        sent.
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-lg bg-[#e8faf2] px-3 py-2 text-xs font-semibold text-[#087a5b]">
                    <LockKeyhole size={14} aria-hidden="true" />
                    Simulation mode
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 overflow-hidden rounded-[10px] border border-[#dfe8f3] sm:grid-cols-4">
                  {paymentMethods.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={paymentMethod === id}
                      onClick={() => setPaymentMethod(id)}
                      className={`focus-ring flex min-h-12 items-center justify-center gap-2 border-b border-[#dfe8f3] px-2 text-xs font-semibold transition last:border-r-0 sm:border-r sm:border-b-0 ${paymentMethod === id ? "bg-[#eff7ff] text-[#087cf0] shadow-[inset_0_-2px_0_#087cf0] sm:shadow-[inset_0_-3px_0_#087cf0]" : "bg-white text-[#52617f] hover:bg-[#f8fbff]"}`}
                    >
                      <Icon size={17} aria-hidden="true" />
                      {label}
                    </button>
                  ))}
                </div>
                <div className="rounded-b-[10px] border border-t-0 border-[#e6edf6] bg-[#fcfdff] p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-[#162545]">
                        {
                          paymentMethods.find(({ id }) => id === paymentMethod)
                            ?.label
                        }{" "}
                        simulation
                      </h3>
                      <p className="mt-1 max-w-[55ch] text-xs leading-5 text-[#687693]">
                        This step mimics a successful Paystack checkout in your
                        browser. Do not enter card or bank credentials.
                      </p>
                    </div>
                    <span className="shrink-0 rounded-md bg-[#eaf4ff] px-2 py-1 text-[10px] font-bold tracking-wide text-[#087cf0] uppercase">
                      Test flow
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#dfe8f3] bg-white px-3.5 py-3 text-xs text-[#52617f]">
                    <LockKeyhole
                      size={15}
                      className="shrink-0 text-[#087cf0]"
                      aria-hidden="true"
                    />
                    No payment details are collected or transmitted.
                  </div>
                  <div className="mt-3 flex items-start gap-2 text-[11px] leading-5 text-[#77849a]">
                    <Check
                      size={14}
                      className="mt-0.5 shrink-0 text-[#0c9b72]"
                      aria-hidden="true"
                    />
                    A demo confirmation and ticket preview will be generated for
                    this browser session.
                  </div>
                </div>
              </section>
            </form>
          </section>
        </div>

        <OrderSummary
          title={event.title}
          scheduledAt={event.scheduledAt}
          lines={lines}
          total={total}
          currency={currency}
          onEdit={() => router.push(`/checkout/${encodeURIComponent(eventId)}`)}
          canSubmit={canSimulate}
          paying={paying}
        />
      </div>
      <div className="mx-auto max-w-[1536px] px-5 pt-3 sm:px-8 lg:px-12">
        <Link
          href={`/checkout/${encodeURIComponent(eventId)}`}
          className="focus-ring inline-flex min-h-9 items-center gap-2 rounded px-2 text-xs font-semibold text-[#526b91] hover:bg-white"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Back to tickets
        </Link>
      </div>
    </main>
  );
}
