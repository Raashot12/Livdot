import {
  eventDraftSchema,
  initialValues,
} from "../constants/create-event.constants";
export function normalizeDraft(saved: unknown) {
  if (!saved || typeof saved !== "object" || !("data" in saved)) return null;
  const record = saved as Record<string, unknown>;
  if (!record.data || typeof record.data !== "object") return null;
  const source = record.data as Record<string, unknown>;
  const savedTickets = Array.isArray(source.ticketTypes)
    ? source.ticketTypes
    : [];
  const ticketTypes = savedTickets.map((value) => {
    const ticket =
      value && typeof value === "object"
        ? (value as Record<string, unknown>)
        : {};
    return {
      name: typeof ticket.name === "string" ? ticket.name : "",
      price: typeof ticket.price === "string" ? ticket.price : "",
      quantity: typeof ticket.quantity === "string" ? ticket.quantity : "",
      active: typeof ticket.active === "boolean" ? ticket.active : true,
    };
  });
  const savedSections = Array.isArray(source.seatMapSections)
    ? source.seatMapSections
    : [];
  const seatMapSections = savedSections.map((value) => {
    const section =
      value && typeof value === "object"
        ? (value as Record<string, unknown>)
        : {};
    const toString = (field: unknown) =>
      typeof field === "string" || typeof field === "number"
        ? String(field)
        : "";
    return {
      name: toString(section.name),
      rows: toString(section.rows),
      seatsPerRow: toString(section.seatsPerRow),
      price: toString(section.price),
      color: toString(section.color) || "#087cf0",
    };
  });
  const parsed = eventDraftSchema.safeParse({
    ...initialValues,
    ...source,
    ticketTypes,
    seatMapSections,
  });
  if (!parsed.success) return null;
  return {
    data: parsed.data,
    bannerUrl: null,
  };
}
