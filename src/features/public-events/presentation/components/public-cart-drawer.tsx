"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, ShoppingBag, Trash2 } from "lucide-react";
import type { EventEntity } from "@/features/events/domain/entities/event.entity";
import { useEvents } from "@/features/events/application/hooks/use-events";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  formatEventDate,
  formatEventTime,
  isPublicEvent,
} from "./public-event-utils";
import {
  formatMoney,
  getCheckoutLines,
  getCheckoutSelectionCount,
  removeCheckoutEventSelection,
  removeCheckoutLine,
  writeCheckoutSelection,
  type CheckoutLineItem,
  type CheckoutSelection,
} from "../lib/public-checkout";
import { PublicLoadingState, PublicRequestError } from "./public-query-states";

type CartGroup = {
  readonly eventId: string;
  readonly selection: CheckoutSelection;
  readonly event: EventEntity | null;
  readonly lines: CheckoutLineItem[];
  readonly selectedCount: number;
  readonly pricedCount: number;
  readonly subtotal: number;
};

function buildCartGroups(
  selections: readonly CheckoutSelection[],
  events: readonly EventEntity[],
): CartGroup[] {
  const eventsById = new Map(events.map((event) => [event.id, event]));
  return selections.map((selection) => {
    const event = eventsById.get(selection.eventId) ?? null;
    const lines = event ? getCheckoutLines(event, selection) : [];
    return {
      eventId: selection.eventId,
      selection,
      event,
      lines,
      selectedCount: getCheckoutSelectionCount(selection),
      pricedCount: lines.reduce((sum, line) => sum + line.quantity, 0),
      subtotal: lines.reduce(
        (sum, line) => sum + line.unitPrice * line.quantity,
        0,
      ),
    };
  });
}

function CartDrawerBody({
  selections,
  onClose,
}: {
  readonly selections: readonly CheckoutSelection[];
  readonly onClose: () => void;
}) {
  const { data: events, isPending, isError, refetch } = useEvents();

  if (isPending) {
    return (
      <div className="px-5 py-6">
        <PublicLoadingState label="Loading your basket" variant="listing" />
      </div>
    );
  }

  if (isError || !events) {
    return (
      <div className="px-5 py-6">
        <PublicRequestError
          title="Basket details could not be loaded"
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  if (selections.length === 0) {
    return <EmptyBasket onClose={onClose} />;
  }

  const groups = buildCartGroups(selections, events);
  const lines = groups.flatMap((group) => group.lines);
  const totalsByCurrency = new Map<string, number>();
  for (const line of lines) {
    totalsByCurrency.set(
      line.currency,
      (totalsByCurrency.get(line.currency) ?? 0) +
        line.unitPrice * line.quantity,
    );
  }
  const canCheckout =
    groups.every(
      (group) =>
        group.event !== null &&
        isPublicEvent(group.event) &&
        group.selectedCount > 0 &&
        group.selectedCount === group.pricedCount,
    ) && totalsByCurrency.size === 1;
  const hasUnavailableItems = groups.some(
    (group) =>
      !group.event ||
      !isPublicEvent(group.event) ||
      group.selectedCount !== group.pricedCount,
  );
  const hasMixedCurrencies = totalsByCurrency.size > 1;

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[360px] table-fixed border-collapse text-left text-xs">
            <colgroup>
              <col className="w-[52%]" />
              <col className="w-[12%]" />
              <col className="w-[26%]" />
              <col className="w-[10%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-[#e8edf5] text-[10px] font-semibold tracking-wide text-[#77849a] uppercase">
                <th className="pr-2 pb-2">Event / ticket</th>
                <th className="pb-2 text-center">Qty</th>
                <th className="pb-2 text-right">Amount</th>
                <th className="pb-2" aria-label="Remove item" />
              </tr>
            </thead>
            {groups.map((group) => (
              <tbody key={group.eventId}>
                <tr className="border-b border-[#edf1f7] bg-[#f6f9fd]">
                  <th colSpan={4} className="px-2 py-3 text-left">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#162545]">
                          {group.event?.title ?? "Event unavailable"}
                        </p>
                        {group.event?.scheduledAt && (
                          <p className="mt-1 flex items-center gap-1.5 text-[11px] font-normal text-[#687693]">
                            <CalendarDays size={13} aria-hidden="true" />
                            {formatEventDate(group.event.scheduledAt)}
                            {formatEventTime(group.event.scheduledAt)
                              ? ` · ${formatEventTime(group.event.scheduledAt)}`
                              : ""}
                          </p>
                        )}
                      </div>
                      {(!group.event ||
                        !isPublicEvent(group.event) ||
                        group.lines.length === 0) && (
                        <button
                          type="button"
                          onClick={() =>
                            removeCheckoutEventSelection(group.eventId)
                          }
                          className="focus-ring shrink-0 rounded px-1.5 py-1 text-[11px] font-semibold text-[#075bff] hover:bg-white"
                        >
                          Remove event
                        </button>
                      )}
                    </div>
                  </th>
                </tr>
                {group.lines.map((line) => (
                  <tr
                    key={`${group.eventId}:${line.id}`}
                    className="border-b border-[#edf1f7] last:border-0"
                  >
                    <td className="py-3 pr-2 align-top">
                      <p className="font-semibold text-[#162545]">
                        {line.name}
                      </p>
                      {line.description && (
                        <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-[#77849a]">
                          {line.description}
                        </p>
                      )}
                    </td>
                    <td className="py-3 text-center align-top text-[#52617f] tabular-nums">
                      {line.quantity}
                    </td>
                    <td className="py-3 text-right align-top font-semibold text-[#162545] tabular-nums">
                      {formatMoney(
                        line.unitPrice * line.quantity,
                        line.currency,
                      )}
                    </td>
                    <td className="py-2 pl-1 text-right align-top">
                      <button
                        type="button"
                        onClick={() =>
                          writeCheckoutSelection(
                            removeCheckoutLine(group.selection, line),
                          )
                        }
                        aria-label={`Remove ${line.name} from basket`}
                        className="focus-ring grid size-8 place-items-center rounded-lg text-[#77849a] transition-colors hover:bg-rose-50 hover:text-rose-700"
                      >
                        <Trash2 size={15} aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>

        {hasUnavailableItems && (
          <p role="status" className="mt-4 text-xs leading-5 text-amber-800">
            Remove unavailable or unpriced tickets before checkout.
          </p>
        )}
        {hasMixedCurrencies && (
          <p role="status" className="mt-4 text-xs leading-5 text-amber-800">
            A combined checkout needs all events to use the same currency.
          </p>
        )}
      </div>

      <footer className="border-t border-[#e5ebf4] bg-white px-5 py-5">
        <div className="space-y-2">
          {[...totalsByCurrency.entries()].map(([currency, subtotal]) => (
            <div
              key={currency}
              className="flex items-center justify-between gap-4 text-sm"
            >
              <span className="font-semibold text-[#52617f]">
                {totalsByCurrency.size > 1
                  ? `${currency} subtotal`
                  : "Subtotal"}
              </span>
              <span className="font-bold text-[#0b1538] tabular-nums">
                {formatMoney(subtotal, currency)}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] leading-4 text-[#77849a]">
          Fees, if configured, are shown at checkout. Payment is simulated.
        </p>
        {canCheckout ? (
          <Link
            href="/checkout/cart"
            onClick={onClose}
            className="focus-ring mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-[#087cf0] px-4 text-sm font-bold text-white transition-colors hover:bg-[#006ee0]"
          >
            Continue to checkout <ArrowRight size={17} aria-hidden="true" />
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="mt-4 inline-flex min-h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-[10px] bg-[#b7c5d8] px-4 text-sm font-bold text-white"
          >
            Continue to checkout <ArrowRight size={17} aria-hidden="true" />
          </button>
        )}
      </footer>
    </>
  );
}

function EmptyBasket({ onClose }: { readonly onClose: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 py-12 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-[#eff6ff] text-[#087cf0]">
        <ShoppingBag size={25} aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-base font-bold text-[#162545]">
        Your basket is empty
      </h3>
      <p className="mt-1 max-w-[30ch] text-sm leading-5 text-[#687693]">
        Choose tickets for an event and they’ll appear here.
      </p>
      <Link
        href="/#all-events"
        onClick={onClose}
        className="focus-ring mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-[#075bff] hover:bg-[#eff6ff]"
      >
        Browse events <ArrowRight size={15} aria-hidden="true" />
      </Link>
    </div>
  );
}

export function PublicCartDrawer({
  open,
  onOpenChange,
  selections,
  itemCount,
}: {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly selections: readonly CheckoutSelection[];
  readonly itemCount: number;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed inset-y-0 top-0 right-0 left-auto z-50 flex h-dvh w-screen max-w-[30rem] translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-0 border-l border-[#e3ebf5] bg-white p-0 text-[#0b1538] shadow-2xl">
        <div className="border-b border-[#e5ebf4] px-5 py-5 pr-14">
          <DialogTitle className="text-lg font-bold tracking-[-.025em] text-[#0b1538]">
            Your basket
            {itemCount > 0 && (
              <span className="ml-2 text-sm font-medium text-[#687693]">
                ({itemCount} {itemCount === 1 ? "ticket" : "tickets"})
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-[#687693]">
            Review tickets across your selected events.
          </DialogDescription>
        </div>
        {open && (
          <CartDrawerBody
            selections={selections}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
