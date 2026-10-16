export type DemoCheckoutLineItem = {
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

export type DemoAttendee = {
  readonly name: string;
  readonly email: string;
  readonly ticketName: string;
  readonly eventId?: string;
  readonly eventTitle?: string;
};

export type DemoOrderEvent = {
  readonly eventId: string;
  readonly eventTitle: string;
  readonly scheduledAt: string | null;
  readonly lines: readonly DemoCheckoutLineItem[];
};

export type DemoTicketOrder = {
  readonly id: string;
  readonly eventId: string;
  readonly eventTitle: string;
  readonly scheduledAt: string | null;
  readonly lines: readonly DemoCheckoutLineItem[];
  readonly events?: readonly DemoOrderEvent[];
  readonly total: number;
  readonly currency: string;
  readonly paymentMethod: string;
  readonly contactName: string;
  readonly contactEmail: string;
  readonly contactPhone: string;
  readonly attendees: readonly DemoAttendee[];
  readonly createdAt: string;
  readonly paymentStatus: "paid";
  readonly simulated: true;
};

const ORDER_PREFIX = "liv-dot:simulated-order:v1:";
const ORDERS_KEY = "liv-dot:simulated-orders:v1";
const ORDER_CHANGE_EVENT = "liv-dot:simulated-order-change";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function createSimulatedOrderId() {
  const token =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replaceAll("-", "").slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `LVD-DEMO-${token.toUpperCase()}`;
}

export function parseSimulatedOrder(
  raw: string | null,
  orderId: string,
): DemoTicketOrder | null {
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
      typeof value.contactName !== "string" ||
      typeof value.contactEmail !== "string" ||
      typeof value.createdAt !== "string" ||
      (value.paymentStatus !== undefined && value.paymentStatus !== "paid") ||
      !Array.isArray(value.lines) ||
      !Array.isArray(value.attendees)
    ) {
      return null;
    }
    return { ...value, paymentStatus: "paid" } as unknown as DemoTicketOrder;
  } catch {
    return null;
  }
}

export function parseSimulatedOrders(raw: string | null): DemoTicketOrder[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value
      .flatMap((candidate) => {
        if (!isRecord(candidate) || typeof candidate.id !== "string") return [];
        const order = parseSimulatedOrder(
          JSON.stringify(candidate),
          candidate.id,
        );
        return order ? [order] : [];
      })
      .sort(
        (left, right) =>
          new Date(right.createdAt).getTime() -
          new Date(left.createdAt).getTime(),
      );
  } catch {
    return [];
  }
}

export function saveSimulatedOrder(order: DemoTicketOrder) {
  const serializedOrder = JSON.stringify(order);
  try {
    window.sessionStorage.setItem(
      `${ORDER_PREFIX}${order.id}`,
      serializedOrder,
    );
  } catch {
    // The shared browser order store remains available if session storage is
    // blocked.
  }
  try {
    const orders = parseSimulatedOrders(
      window.localStorage.getItem(ORDERS_KEY),
    );
    window.localStorage.setItem(
      ORDERS_KEY,
      JSON.stringify([
        order,
        ...orders.filter((item) => item.id !== order.id),
      ]),
    );
  } catch {
    // Keep the confirmation flow usable when local storage is unavailable.
  }
  window.dispatchEvent(new Event(ORDER_CHANGE_EVENT));
}

export function subscribeSimulatedOrder(onStoreChange: () => void) {
  window.addEventListener(ORDER_CHANGE_EVENT, onStoreChange);
  return () => window.removeEventListener(ORDER_CHANGE_EVENT, onStoreChange);
}

export function getSimulatedOrderSnapshot(orderId: string) {
  let sessionOrder: string | null = null;
  try {
    sessionOrder = window.sessionStorage.getItem(`${ORDER_PREFIX}${orderId}`);
  } catch {
    // Fall back to the persistent browser order store.
  }
  if (sessionOrder) return sessionOrder;
  try {
    const order = parseSimulatedOrders(
      window.localStorage.getItem(ORDERS_KEY),
    ).find((item) => item.id === orderId);
    return order ? JSON.stringify(order) : null;
  } catch {
    return null;
  }
}

export function readSimulatedOrder(orderId: string) {
  return parseSimulatedOrder(getSimulatedOrderSnapshot(orderId), orderId);
}

export function subscribeSimulatedOrders(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === ORDERS_KEY || event.key === null) onStoreChange();
  };
  window.addEventListener(ORDER_CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", handleStorage);
  migrateLegacySessionOrders();
  return () => {
    window.removeEventListener(ORDER_CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", handleStorage);
  };
}

function migrateLegacySessionOrders() {
  try {
    const currentOrders = parseSimulatedOrders(
      window.localStorage.getItem(ORDERS_KEY),
    );
    const knownIds = new Set(currentOrders.map((order) => order.id));
    const legacyOrders = Array.from(
      { length: window.sessionStorage.length },
      (_, index) => window.sessionStorage.key(index),
    ).flatMap((key) => {
      if (!key?.startsWith(ORDER_PREFIX)) return [];
      const orderId = key.slice(ORDER_PREFIX.length);
      const order = parseSimulatedOrder(
        window.sessionStorage.getItem(key),
        orderId,
      );
      return order && !knownIds.has(order.id) ? [order] : [];
    });
    if (legacyOrders.length === 0) return;
    window.localStorage.setItem(
      ORDERS_KEY,
      JSON.stringify([...legacyOrders, ...currentOrders]),
    );
    window.dispatchEvent(new Event(ORDER_CHANGE_EVENT));
  } catch {
    // A blocked storage API should not stop the ticketing views from loading.
  }
}

export function getSimulatedOrdersSnapshot() {
  try {
    return window.localStorage.getItem(ORDERS_KEY);
  } catch {
    return null;
  }
}

export function readSimulatedOrders() {
  return parseSimulatedOrders(getSimulatedOrdersSnapshot());
}

export function getOrderEvents(order: DemoTicketOrder): DemoOrderEvent[] {
  if (order.events?.length) return [...order.events];
  return [
    {
      eventId: order.eventId,
      eventTitle: order.eventTitle,
      scheduledAt: order.scheduledAt,
      lines: order.lines,
    },
  ];
}

export function getOrderLinesForEvent(
  order: DemoTicketOrder,
  eventId: string,
) {
  return (
    getOrderEvents(order).find((event) => event.eventId === eventId)?.lines ??
    []
  );
}

export function getOrderAttendeesForEvent(
  order: DemoTicketOrder,
  eventId: string,
) {
  return order.attendees.filter(
    (attendee) =>
      attendee.eventId === eventId ||
      (!attendee.eventId && order.eventId === eventId),
  );
}

export function getOrderTicketCount(order: DemoTicketOrder) {
  return getOrderEvents(order).reduce(
    (sum, event) =>
      sum + event.lines.reduce((lineSum, line) => lineSum + line.quantity, 0),
    0,
  );
}

export function formatTicketMoney(amount: number, currency: string) {
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
