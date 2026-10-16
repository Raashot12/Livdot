import type { EventEntity } from "@/features/events/domain/entities/event.entity";
import type {
  EventSeatMap,
  EventSeatMapBlock,
} from "@/features/events/domain/entities/event-seat-map";

interface SeatSectionFixture {
  readonly id: string;
  readonly title: string;
  readonly rows: number;
  readonly seatsPerRow: number;
  readonly price: number;
  readonly color: string;
  readonly unavailableSeatIds?: readonly string[];
}

function rowLabel(index: number) {
  let value = index + 1;
  let label = "";
  while (value > 0) {
    const remainder = (value - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    value = Math.floor((value - 1) / 26);
  }
  return label;
}

function createSeatMap(
  eventId: string,
  sections: readonly SeatSectionFixture[],
): EventSeatMap {
  const layoutColumns = Math.max(
    1,
    Math.min(3, Math.ceil(Math.sqrt(sections.length))),
  );
  const maxRows = Math.max(...sections.map((section) => section.rows));
  const maxSeatsPerRow = Math.max(
    ...sections.map((section) => section.seatsPerRow),
  );
  const columnGap = (maxSeatsPerRow + 2) * 28;
  const rowGap = (maxRows + 2) * 28;

  const blocks: EventSeatMapBlock[] = sections.map((section, index) => {
    const originX = (index % layoutColumns) * columnGap;
    const originY = Math.floor(index / layoutColumns) * rowGap + 48;
    const seats = Array.from(
      { length: section.rows * section.seatsPerRow },
      (_, seatIndex) => {
        const row = rowLabel(Math.floor(seatIndex / section.seatsPerRow));
        const seatNumber = (seatIndex % section.seatsPerRow) + 1;
        const id = `${row}-${seatNumber}`;

        return {
          id,
          title: String(seatNumber),
          row,
          x: originX + (seatNumber - 1) * 26,
          y: originY + Math.floor(seatIndex / section.seatsPerRow) * 26,
          salable: !section.unavailableSeatIds?.includes(id),
          color: section.color,
          price: section.price,
          currency: "NGN",
        };
      },
    );

    return {
      id: `${eventId}-${section.id}`,
      title: section.title,
      color: section.color,
      price: section.price,
      currency: "NGN",
      x: originX,
      y: originY,
      labels: Array.from({ length: section.rows }, (_, rowIndex) => ({
        title: rowLabel(rowIndex),
        x: originX - 20,
        y: originY + rowIndex * 26,
      })),
      seats,
    };
  });

  return { blocks, maxSelectable: 8, stageLabel: "STAGE" };
}

export const eventFixtures: EventEntity[] = [
  {
    id: "evt-lagos-jazz-night-2026",
    title: "Lagos Jazz & Soul Night",
    description:
      "An evening of live jazz, soul and Lagos energy. Choose your seats for a night of outstanding performances and local artists.",
    status: "SCHEDULED",
    readiness: {
      crewAssigned: true,
      ingestConfigured: true,
      ticketPricingConfigured: true,
    },
    scheduledAt: "2026-11-21T18:00:00.000Z",
    seatMap: createSeatMap("evt-lagos-jazz-night-2026", [
      {
        id: "front-row",
        title: "Front Row",
        rows: 3,
        seatsPerRow: 8,
        price: 45000,
        color: "#f5b942",
        unavailableSeatIds: ["A-1"],
      },
      {
        id: "main-floor",
        title: "Main Floor",
        rows: 5,
        seatsPerRow: 12,
        price: 25000,
        color: "#168bff",
      },
      {
        id: "balcony",
        title: "Balcony",
        rows: 4,
        seatsPerRow: 10,
        price: 12000,
        color: "#a78bfa",
      },
    ]),
    version: 1,
  },
  {
    id: "evt-abuja-creators-summit-2026",
    title: "Abuja Creators & Culture Summit",
    description:
      "A full day of conversations, workshops and performances celebrating Nigeria’s creative community. Select your section and seats before checkout.",
    status: "SCHEDULED",
    readiness: {
      crewAssigned: true,
      ingestConfigured: true,
      ticketPricingConfigured: true,
    },
    scheduledAt: "2026-12-05T08:00:00.000Z",
    seatMap: createSeatMap("evt-abuja-creators-summit-2026", [
      {
        id: "premium",
        title: "Premium",
        rows: 4,
        seatsPerRow: 8,
        price: 80000,
        color: "#f5b942",
        unavailableSeatIds: ["A-1", "A-2"],
      },
      {
        id: "standard",
        title: "Standard",
        rows: 6,
        seatsPerRow: 12,
        price: 35000,
        color: "#168bff",
      },
      {
        id: "gallery",
        title: "Gallery",
        rows: 4,
        seatsPerRow: 10,
        price: 20000,
        color: "#a78bfa",
      },
    ]),
    version: 1,
  },
];
