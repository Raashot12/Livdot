"use client";

import { useEffect, useRef, useState } from "react";
import { SeatMapCanvas as SeatMapCanvasLibrary } from "@alisaitteke/seatmap-canvas";
import { List, Map as MapIcon } from "lucide-react";
import type {
  EventSeatMap,
  EventSeatMapBlock,
  EventSeatMapSeat,
  SeatMapId,
} from "@/features/events/domain/entities/event-seat-map";

type SeatMapSeatView = {
  isSelected?: () => boolean;
  select?: (color?: string) => unknown;
  unSelect?: () => unknown;
};

type SeatMapSeatModel = {
  id: SeatMapId;
  title?: string;
  selected?: boolean;
  salable?: boolean;
  block?: { id: SeatMapId; title?: string };
  custom_data?: Record<string, unknown>;
  svg?: SeatMapSeatView | null;
  item?: SeatMapSeatModel;
};

type SeatMapRuntime = {
  data: {
    replaceData: (blocks: EventSeatMapBlock[]) => unknown;
    getBlocks: () => Array<{
      id: SeatMapId;
      title?: string;
      seats: SeatMapSeatModel[];
    }>;
  };
  eventManager: {
    addEventListener: (
      eventName: string,
      listener: (seat: SeatMapSeatModel) => void,
    ) => unknown;
  };
};

const SEAT_CLICK_EVENT = "SEAT.CLICK";

export function seatMapSelectionKey(blockId: SeatMapId, seatId: SeatMapId) {
  return `${blockId}:${seatId}`;
}

function modelFromClick(seat: SeatMapSeatModel) {
  return seat.item ?? seat;
}

function groupSeatsByRow(seats: readonly EventSeatMapSeat[]) {
  const rows = new Map<string, EventSeatMapSeat[]>();
  for (const seat of seats) {
    const row = seat.row ?? "Seats";
    const rowSeats = rows.get(row);
    if (rowSeats) rowSeats.push(seat);
    else rows.set(row, [seat]);
  }
  return [...rows.entries()];
}

export function SeatMapSelector({
  seatMap,
  selectedKeys,
  onToggleSeat,
}: {
  readonly seatMap: EventSeatMap;
  readonly selectedKeys: readonly string[];
  readonly onToggleSeat: (key: string) => void;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<SeatMapRuntime | null>(null);
  const toggleRef = useRef(onToggleSeat);
  const [listView, setListView] = useState(false);

  useEffect(() => {
    toggleRef.current = onToggleSeat;
  }, [onToggleSeat]);

  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;

    const options = {
      resizable: true,
      legend: false,
      click_enable_sold_seats: false,
      min_zoom: 0.45,
      max_zoom: 2.4,
      style: {
        seat: {
          shape: "circle",
          radius: 8,
          color: "#93c5fd",
          not_salable: "#b9c6d8",
          selected: "#087cf0",
          hover: "#39bde8",
          focus: "#087cf0",
        },
        block: {
          fill: "#edf6ff",
          stroke: "#7ebdff",
          border_width: 2,
          title_color: "#102341",
          title_font_size: 13,
        },
      },
    };

    const map = new SeatMapCanvasLibrary(
      container,
      options as unknown as ConstructorParameters<
        typeof SeatMapCanvasLibrary
      >[1],
    ) as unknown as SeatMapRuntime;

    map.data.replaceData(
      structuredClone(seatMap.blocks) as EventSeatMapBlock[],
    );
    map.eventManager.addEventListener(SEAT_CLICK_EVENT, (clickedSeat) => {
      const seat = modelFromClick(clickedSeat);
      if (!seat.block || seat.salable === false) return;
      toggleRef.current(seatMapSelectionKey(seat.block.id, seat.id));
    });

    mapRef.current = map;
    return () => {
      mapRef.current = null;
      container.replaceChildren();
    };
  }, [seatMap]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const selected = new Set(selectedKeys);
    for (const block of map.data.getBlocks()) {
      for (const seat of block.seats) {
        if (!seat.block) continue;
        const shouldBeSelected = selected.has(
          seatMapSelectionKey(seat.block.id, seat.id),
        );
        const isSelected = seat.svg?.isSelected?.() ?? Boolean(seat.selected);
        if (shouldBeSelected && !isSelected) seat.svg?.select?.("#087cf0");
        if (!shouldBeSelected && isSelected) seat.svg?.unSelect?.();
      }
    }
  }, [seatMap, selectedKeys]);

  return (
    <div className="mt-4 overflow-hidden rounded-[14px] border border-[#e4edf8] bg-[#f6faff]">
      <div className="relative h-[420px] sm:h-[480px]">
        {!listView && seatMap.stageLabel && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-2 z-10 flex justify-center"
          >
            <span className="rounded-full border border-[#cbdcf5] bg-white/95 px-6 py-1 text-[10px] font-bold tracking-[.12em] text-[#213756] shadow-[0_2px_7px_rgba(21,53,93,.08)]">
              {seatMap.stageLabel}
            </span>
          </div>
        )}
        <div
          aria-hidden={listView}
          className={`public-seatmap-stage absolute inset-0 transition-opacity duration-200 ${listView ? "invisible opacity-0" : "visible opacity-100"}`}
        >
          <div ref={canvasRef} className="h-full w-full" />
        </div>
        {listView && (
          <div
            aria-label="Seats by section"
            className="absolute inset-0 overflow-auto bg-white p-4 sm:p-6"
          >
            <div className="space-y-6">
              {seatMap.blocks.map((block) => (
                <section
                  key={String(block.id)}
                  aria-labelledby={`seat-list-${block.id}`}
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3
                      id={`seat-list-${block.id}`}
                      className="font-semibold text-[#102341]"
                    >
                      {block.title}
                    </h3>
                    <span className="text-xs text-[#687693]">
                      {block.seats.filter((seat) => seat.salable).length}{" "}
                      available
                    </span>
                  </div>
                  <div className="space-y-3">
                    {groupSeatsByRow(block.seats).map(([row, seats]) => (
                      <div
                        key={row}
                        className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-start gap-3"
                      >
                        <span className="pt-3 text-xs font-bold text-[#687693]">
                          {row}
                        </span>
                        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
                          {seats.map((seat) => {
                            const key = seatMapSelectionKey(block.id, seat.id);
                            const isSelected = selectedKeys.includes(key);
                            return (
                              <button
                                key={String(seat.id)}
                                type="button"
                                disabled={!seat.salable}
                                aria-pressed={isSelected}
                                onClick={() => onToggleSeat(key)}
                                className={`focus-ring min-h-11 rounded-lg border px-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:bg-[#f1f4f8] disabled:text-[#8793a6] ${isSelected ? "border-[#087cf0] bg-[#087cf0] text-white" : "border-[#dce7f5] bg-white text-[#263657] hover:border-[#7ab6f6] hover:bg-[#f2f8ff]"}`}
                                aria-label={`${block.title}, ${row === "Seats" ? "" : `row ${row}, `}seat ${seat.title}${seat.salable ? " available" : " unavailable"}`}
                              >
                                {seat.title}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e4edf8] bg-white px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#52617f]">
          <span className="inline-flex items-center gap-2">
            <span
              className="size-3 rounded-full bg-[#93c5fd]"
              aria-hidden="true"
            />
            Available
          </span>
          <span className="inline-flex items-center gap-2">
            <span
              className="grid size-3 place-items-center rounded-full bg-[#087cf0] text-[8px] text-white"
              aria-hidden="true"
            >
              ✓
            </span>
            Selected
          </span>
          <span className="inline-flex items-center gap-2">
            <span
              className="size-3 rounded-full bg-[#b9c6d8]"
              aria-hidden="true"
            />
            Unavailable
          </span>
          {seatMap.blocks.map((block) => (
            <span
              key={String(block.id)}
              className="inline-flex items-center gap-2"
            >
              <span
                className="size-3 rounded-sm border border-black/10"
                style={{ backgroundColor: block.color ?? "#93c5fd" }}
                aria-hidden="true"
              />
              {block.title}
            </span>
          ))}
        </div>
        <button
          type="button"
          aria-pressed={listView}
          onClick={() => setListView((current) => !current)}
          className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#dce5f2] px-3 text-xs font-semibold text-[#315071] transition-colors hover:bg-[#f5f9ff]"
        >
          {listView ? (
            <MapIcon size={15} aria-hidden="true" />
          ) : (
            <List size={15} aria-hidden="true" />
          )}
          {listView ? "View map" : "View as list"}
        </button>
      </div>
    </div>
  );
}
