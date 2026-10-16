"use client";

import type { EventSeatMap } from "../../domain/entities/event-seat-map";
import { Auditorium3DViewer } from "@/shared/components/media/auditorium-3d-viewer";

export function SeatMap3DPreview({
  seatMap,
}: {
  readonly seatMap: EventSeatMap;
}) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-[#dfe9f6] bg-white">
      <Auditorium3DViewer
        className="h-[250px] sm:h-[300px]"
        stageLabel={seatMap.stageLabel ?? "STAGE"}
      />
      <div className="border-t border-[#e5edf7] px-3 py-3">
        {seatMap.blocks.length ? (
          <div className="flex flex-wrap gap-2">
            {seatMap.blocks.map((block) => (
              <span
                key={String(block.id)}
                className="inline-flex min-h-8 items-center gap-2 rounded-full border border-[#e2eaf5] bg-[#f8fbff] px-3 text-[10px] font-semibold text-[#273c59]"
              >
                <span
                  className="size-2.5 rounded-full border border-black/10"
                  style={{ backgroundColor: block.color ?? "#93c5fd" }}
                  aria-hidden="true"
                />
                {block.title}
                <span className="font-medium text-[#687693]">
                  {block.seats.filter((seat) => seat.salable).length} seats
                </span>
              </span>
            ))}
          </div>
        ) : (
          <p className="px-1 py-1 text-xs leading-relaxed text-[#5f708c]">
            Add a section to set its ticket price and available seats.
          </p>
        )}
      </div>
    </div>
  );
}
