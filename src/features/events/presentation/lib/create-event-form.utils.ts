import type { EventSeatMap } from "../../domain/entities/event-seat-map";
import type { EventDraft } from "../constants/create-event.constants";

export function getActiveTicketQuantity(
  ticketTypes: EventDraft["ticketTypes"],
) {
  return ticketTypes.reduce(
    (total, ticket) =>
      total + (ticket.active ? Number(ticket.quantity || 0) : 0),
    0,
  );
}

export function buildEventSeatMap(
  sections: EventDraft["seatMapSections"],
  maxSelectable?: number,
): EventSeatMap {
  const preparedSections = sections.flatMap((section, index) => {
    const rows = Number(section.rows);
    const seatsPerRow = Number(section.seatsPerRow);
    if (
      !section.name.trim() ||
      !Number.isSafeInteger(rows) ||
      rows <= 0 ||
      !Number.isSafeInteger(seatsPerRow) ||
      seatsPerRow <= 0
    ) {
      return [];
    }
    return [{ section, index, rows, seatsPerRow }];
  });
  const layoutColumns = Math.max(
    1,
    Math.min(3, Math.ceil(Math.sqrt(preparedSections.length))),
  );
  const maxRows = Math.max(1, ...preparedSections.map((item) => item.rows));
  const maxSeatsPerRow = Math.max(
    1,
    ...preparedSections.map((item) => item.seatsPerRow),
  );
  const columnGap = (maxSeatsPerRow + 2) * 28;
  const rowGap = (maxRows + 2) * 28;

  const blocks = preparedSections.map(
    ({ section, index, rows, seatsPerRow }) => {
      const layoutColumn = index % layoutColumns;
      const layoutRow = Math.floor(index / layoutColumns);
      const originX = layoutColumn * columnGap;
      const originY = layoutRow * rowGap + 48;
      const color = /^#[\da-f]{6}$/i.test(section.color)
        ? section.color
        : "#087cf0";
      const seats = Array.from(
        { length: rows * seatsPerRow },
        (_, seatIndex) => {
          const rowIndex = Math.floor(seatIndex / seatsPerRow);
          const seatNumber = (seatIndex % seatsPerRow) + 1;
          const row = seatRowLabel(rowIndex);
          return {
            id: `${row}-${seatNumber}`,
            title: String(seatNumber),
            row,
            x: originX + (seatNumber - 1) * 26,
            y: originY + rowIndex * 26,
            salable: true,
            color,
            price: Number(section.price) || 0,
            currency: "NGN",
          };
        },
      );

      return {
        id: `section-${index + 1}`,
        title: section.name.trim(),
        color,
        price: Number(section.price) || 0,
        currency: "NGN",
        x: originX,
        y: originY,
        labels: Array.from({ length: rows }, (_, rowIndex) => ({
          title: seatRowLabel(rowIndex),
          x: originX - 20,
          y: originY + rowIndex * 26,
        })),
        seats,
      };
    },
  );
  const safeMaxSelectable =
    Number.isSafeInteger(maxSelectable) && Number(maxSelectable) > 0
      ? Number(maxSelectable)
      : undefined;

  return {
    blocks,
    ...(safeMaxSelectable ? { maxSelectable: safeMaxSelectable } : {}),
    stageLabel: "STAGE",
  };
}

function seatRowLabel(index: number) {
  let value = index + 1;
  let label = "";
  while (value > 0) {
    const remainder = (value - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    value = Math.floor((value - 1) / 26);
  }
  return label;
}

export function formatDate(date: string, timeZone: string) {
  if (!date) return "Choose a date";
  const parsed = new Date(`${date}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return "Choose a date";
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: timeZone || "UTC",
  }).format(parsed);
}

export function formatTime(value: string) {
  if (!value) return "Choose a time";
  const [hourText = "0", minute = "00"] = value.split(":");
  const hour = Number(hourText);
  const suffix = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${minute} ${suffix}`;
}

export function formatCurrency(value: string) {
  return `₦${Number(value || 0).toLocaleString("en-NG")}`;
}

export function getTimeZoneShort(value: string) {
  if (value === "Africa/Lagos") return "WAT";
  if (value === "Europe/London") return "GMT";
  if (value === "Europe/Paris") return "CET";
  return "ET";
}

export function getEventTypeLabel(value: EventDraft["eventType"]) {
  if (value === "in-person") return "In-Person Event";
  if (value === "online") return "Online Event";
  return "Hybrid Event";
}

export function getCategoryLabel(value: string) {
  if (value === "music-culture-conference")
    return "Music · Culture · Conference";
  if (value === "arts-culture") return "Arts & Culture";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function getAudienceLabel(value: EventDraft["audienceAccess"]) {
  if (value === "private") return "Private";
  if (value === "invite") return "Invite Only";
  return "Public";
}
