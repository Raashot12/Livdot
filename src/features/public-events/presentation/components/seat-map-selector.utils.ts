import type {
  EventSeatMap,
  EventSeatMapSeat,
} from "@/features/events/domain/entities/event-seat-map";
import {
  createAuditoriumSeatPositions,
  type AuditoriumSeatTarget,
} from "@/shared/components/media/auditorium-seat-layout";
import { seatMapSelectionKey } from "../lib/public-checkout";

export function groupSeatsByRow(seats: readonly EventSeatMapSeat[]) {
  const rows = new Map<string, EventSeatMapSeat[]>();
  for (const seat of seats) {
    const row = seat.row ?? "Seats";
    const rowSeats = rows.get(row);
    if (rowSeats) rowSeats.push(seat);
    else rows.set(row, [seat]);
  }
  return [...rows.entries()];
}

export function buildAuditoriumSeatTargets(
  seatMap: EventSeatMap,
  selectedKeys: readonly string[],
) {
  const selectedSeatKeys = new Set(selectedKeys);
  const inventory = seatMap.blocks.flatMap((block) =>
    block.seats.map((seat) => {
      const key = seatMapSelectionKey(block.id, seat.id);
      const selected = selectedSeatKeys.has(key);

      return {
        key,
        seatLabel: `${seat.row ?? ""}${seat.title}`,
        rowLabel: seat.row ?? "Seats",
        sectionTitle: block.title,
        color: seat.color ?? block.color ?? "#72b6ff",
        status: !seat.salable
          ? ("claimed" as const)
          : selected
            ? ("selected" as const)
            : ("available" as const),
      };
    }),
  );
  const positions = createAuditoriumSeatPositions(inventory.length);
  const targets: AuditoriumSeatTarget[] = inventory.flatMap((seat, index) => {
    const position = positions[index];
    return position ? [{ ...seat, position }] : [];
  });

  return {
    targets,
    unrepresentedCount: inventory.length - targets.length,
  };
}
