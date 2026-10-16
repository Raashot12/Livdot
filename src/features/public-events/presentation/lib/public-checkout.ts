import type { EventEntity } from "@/features/events/domain/entities/event.entity";
import type {
  EventSeatMapSeat,
  SeatMapId,
} from "@/features/events/domain/entities/event-seat-map";
import type { EventTicketOption } from "@/features/events/domain/entities/event-ticket-option";

const CHECKOUT_KEY = "liv-dot:checkout:v1";
const ORDER_PREFIX = "liv-dot:simulated-order:v1:";
const CHECKOUT_CHANGE_EVENT = "liv-dot:checkout-change";
const ORDER_CHANGE_EVENT = "liv-dot:simulated-order-change";

export type CheckoutSelection = {
  readonly eventId: string;
  readonly seatKeys: readonly string[];
  readonly ticketQuantities: Readonly<Record<string, number>>;
};

export type CheckoutCart = {
  readonly selections: readonly CheckoutSelection[];
};

export type CheckoutLineItem = {
  readonly id: string;
  readonly eventId?: string;
  readonly eventTitle?: string;
  readonly name: string;
  readonly description?: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly currency: string;
  readonly seatLabels?: readonly string[];
  readonly seatKeys?: readonly string[];
};

export type SimulatedAttendee = {
  readonly name: string;
  readonly email: string;
  readonly ticketName: string;
  readonly eventId?: string;
  readonly eventTitle?: string;
};

export type SimulatedOrder = {
  readonly id: string;
  readonly eventId: string;
  readonly eventTitle: string;
  readonly scheduledAt: string | null;
  readonly lines: readonly CheckoutLineItem[];
  readonly events?: readonly SimulatedOrderEvent[];
  readonly total: number;
  readonly currency: string;
  readonly paymentMethod: string;
  readonly contactName: string;
  readonly contactEmail: string;
  readonly contactPhone: string;
  readonly attendees: readonly SimulatedAttendee[];
  readonly createdAt: string;
  readonly simulated: true;
};

export type SimulatedOrderEvent = {
  readonly eventId: string;
  readonly eventTitle: string;
  readonly scheduledAt: string | null;
  readonly lines: readonly CheckoutLineItem[];
};

export function seatMapSelectionKey(blockId: SeatMapId, seatId: SeatMapId) {
  return `${blockId}:${seatId}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeCheckoutSelection(value: unknown): CheckoutSelection | null {
  if (
    !isRecord(value) ||
    typeof value.eventId !== "string" ||
    value.eventId.length === 0 ||
    !Array.isArray(value.seatKeys) ||
    !isRecord(value.ticketQuantities)
  ) {
    return null;
  }

  const seatKeys = [
    ...new Set(
      value.seatKeys.filter((key): key is string => typeof key === "string"),
    ),
  ];
  const ticketQuantities = Object.entries(value.ticketQuantities).reduce<
    Record<string, number>
  >((quantities, [id, quantity]) => {
    if (
      id.length > 0 &&
      typeof quantity === "number" &&
      Number.isSafeInteger(quantity) &&
      quantity > 0
    ) {
      quantities[id] = quantity;
    }
    return quantities;
  }, {});
  return { eventId: value.eventId, seatKeys, ticketQuantities };
}

export function getCheckoutSelectionCount(
  selection: CheckoutSelection | null | undefined,
) {
  if (!selection) return 0;
  return (
    selection.seatKeys.length +
    Object.values(selection.ticketQuantities).reduce(
      (sum, quantity) => sum + quantity,
      0,
    )
  );
}

export function getCheckoutCartSelectionCount(
  selections: readonly CheckoutSelection[],
) {
  return selections.reduce(
    (sum, selection) => sum + getCheckoutSelectionCount(selection),
    0,
  );
}

export function subscribeCheckoutSelection(onStoreChange: () => void) {
  window.addEventListener(CHECKOUT_CHANGE_EVENT, onStoreChange);
  return () => window.removeEventListener(CHECKOUT_CHANGE_EVENT, onStoreChange);
}

export function getCheckoutSelectionSnapshot() {
  try {
    return window.sessionStorage.getItem(CHECKOUT_KEY);
  } catch {
    return null;
  }
}

export function parseCheckoutSelection(
  raw: string | null,
  eventId: string,
): CheckoutSelection | null {
  return (
    parseCheckoutCart(raw).find((selection) => selection.eventId === eventId) ??
    null
  );
}

export function parseCheckoutCart(raw: string | null): CheckoutSelection[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (!isRecord(value)) return [];
    const candidates = Array.isArray(value.selections)
      ? value.selections
      : [value];
    const byEvent = new Map<string, CheckoutSelection>();
    for (const candidate of candidates) {
      const selection = normalizeCheckoutSelection(candidate);
      if (selection) byEvent.set(selection.eventId, selection);
    }
    return [...byEvent.values()];
  } catch {
    return [];
  }
}

export function readCheckoutSelection(
  eventId: string,
): CheckoutSelection | null {
  return parseCheckoutSelection(getCheckoutSelectionSnapshot(), eventId);
}

export function parseCurrentCheckoutCart(raw: string | null) {
  return parseCheckoutCart(raw);
}

function persistCheckoutCart(selections: readonly CheckoutSelection[]) {
  try {
    if (selections.length === 0) {
      window.sessionStorage.removeItem(CHECKOUT_KEY);
    } else {
      window.sessionStorage.setItem(
        CHECKOUT_KEY,
        JSON.stringify({ version: 2, selections }),
      );
    }
    window.dispatchEvent(new Event(CHECKOUT_CHANGE_EVENT));
  } catch {
    // Current screen state remains usable if browser storage is blocked.
  }
}

export function writeCheckoutSelection(selection: CheckoutSelection) {
  const current = parseCheckoutCart(getCheckoutSelectionSnapshot());
  const remaining = current.filter(
    (item) => item.eventId !== selection.eventId,
  );
  if (getCheckoutSelectionCount(selection) > 0) remaining.push(selection);
  persistCheckoutCart(remaining);
}

export function removeCheckoutEventSelection(eventId: string) {
  const remaining = parseCheckoutCart(getCheckoutSelectionSnapshot()).filter(
    (selection) => selection.eventId !== eventId,
  );
  persistCheckoutCart(remaining);
}

export function removeCheckoutLine(
  selection: CheckoutSelection,
  line: CheckoutLineItem,
): CheckoutSelection {
  const seatKeysToRemove = new Set(line.seatKeys ?? []);
  const ticketQuantities = { ...selection.ticketQuantities };
  delete ticketQuantities[line.id];
  return {
    ...selection,
    seatKeys: selection.seatKeys.filter((key) => !seatKeysToRemove.has(key)),
    ticketQuantities,
  };
}

export function clearCheckoutSelection() {
  try {
    window.sessionStorage.removeItem(CHECKOUT_KEY);
    window.dispatchEvent(new Event(CHECKOUT_CHANGE_EVENT));
  } catch {
    // Ignore unavailable browser storage.
  }
}

export function configuredSeatMap(event: EventEntity) {
  return event.seatMap?.blocks.some((block) => block.seats.length > 0)
    ? event.seatMap
    : null;
}

function seatPrice(
  seat: EventSeatMapSeat,
  block: NonNullable<EventEntity["seatMap"]>["blocks"][number],
) {
  return seat.price ?? block.price ?? null;
}

export function getCheckoutLines(
  event: EventEntity,
  selection: CheckoutSelection,
): CheckoutLineItem[] {
  const seatMap = configuredSeatMap(event);
  if (seatMap) {
    const selected = new Set(selection.seatKeys);
    return seatMap.blocks.flatMap((block) => {
      const seats = block.seats.filter(
        (seat) =>
          seat.salable && selected.has(seatMapSelectionKey(block.id, seat.id)),
      );
      if (seats.length === 0) return [];
      const groups = new Map<string, EventSeatMapSeat[]>();
      for (const seat of seats) {
        const price = seatPrice(seat, block);
        const currency = seat.currency ?? block.currency ?? "NGN";
        const groupKey = `${price ?? "unpriced"}:${currency}`;
        groups.set(groupKey, [...(groups.get(groupKey) ?? []), seat]);
      }
      return [...groups.entries()].flatMap(([groupKey, groupedSeats]) => {
        const [priceValue, currency] = groupKey.split(":");
        const price = priceValue === "unpriced" ? null : Number(priceValue);
        if (price === null || !Number.isFinite(price)) return [];
        return [
          {
            id: `seat:${block.id}:${groupKey}`,
            name: block.title,
            description: groupedSeats
              .map((seat) =>
                [seat.row ? `Row ${seat.row}` : null, `Seat ${seat.title}`]
                  .filter(Boolean)
                  .join(" · "),
              )
              .join(", "),
            quantity: groupedSeats.length,
            unitPrice: price,
            currency,
            seatLabels: groupedSeats.map((seat) => seat.title),
            seatKeys: groupedSeats.map((seat) =>
              seatMapSelectionKey(block.id, seat.id),
            ),
          },
        ];
      });
    });
  }

  return (event.ticketOptions ?? []).flatMap((ticket) => {
    const quantity = selection.ticketQuantities[ticket.id] ?? 0;
    if (quantity < 1) return [];
    return [lineFromTicket(ticket, quantity)];
  });
}

export function lineFromTicket(
  ticket: EventTicketOption,
  quantity: number,
): CheckoutLineItem {
  return {
    id: ticket.id,
    name: ticket.name,
    description: ticket.description,
    quantity,
    unitPrice: ticket.price,
    currency: ticket.currency ?? "NGN",
  };
}

export function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("en-NG")}`;
  }
}

export function createSimulatedOrderId() {
  const token =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replaceAll("-", "").slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `LVD-DEMO-${token.toUpperCase()}`;
}

export function saveSimulatedOrder(order: SimulatedOrder) {
  try {
    window.sessionStorage.setItem(
      `${ORDER_PREFIX}${order.id}`,
      JSON.stringify(order),
    );
    window.dispatchEvent(new Event(ORDER_CHANGE_EVENT));
  } catch {
    // The confirmation page will show its recoverable empty state.
  }
}

export function subscribeSimulatedOrder(onStoreChange: () => void) {
  window.addEventListener(ORDER_CHANGE_EVENT, onStoreChange);
  return () => window.removeEventListener(ORDER_CHANGE_EVENT, onStoreChange);
}

export function getSimulatedOrderSnapshot(orderId: string) {
  try {
    return window.sessionStorage.getItem(`${ORDER_PREFIX}${orderId}`);
  } catch {
    return null;
  }
}

export function parseSimulatedOrder(
  raw: string | null,
  orderId: string,
): SimulatedOrder | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (
      !isRecord(value) ||
      value.id !== orderId ||
      value.simulated !== true ||
      typeof value.eventTitle !== "string" ||
      typeof value.total !== "number" ||
      typeof value.currency !== "string" ||
      !Array.isArray(value.lines) ||
      !Array.isArray(value.attendees)
    ) {
      return null;
    }
    return value as unknown as SimulatedOrder;
  } catch {
    return null;
  }
}

export function readSimulatedOrder(orderId: string): SimulatedOrder | null {
  return parseSimulatedOrder(getSimulatedOrderSnapshot(orderId), orderId);
}

export function subscribeToNoStore() {
  return () => {};
}

export function getClientHydrationSnapshot() {
  return true;
}

export function getServerHydrationSnapshot() {
  return false;
}
