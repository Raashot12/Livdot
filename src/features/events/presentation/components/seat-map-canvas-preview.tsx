"use client";

import { useEffect, useRef } from "react";
import { SeatMapCanvas as SeatMapCanvasLibrary } from "@alisaitteke/seatmap-canvas";
import type {
  EventSeatMap,
  EventSeatMapBlock,
} from "../../domain/entities/event-seat-map";

type SeatMapPreviewRuntime = {
  data: {
    replaceData: (blocks: EventSeatMapBlock[]) => unknown;
  };
};

export function SeatMapCanvasPreview({
  seatMap,
}: {
  readonly seatMap: EventSeatMap;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<SeatMapPreviewRuntime | null>(null);

  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;

    const options = {
      resizable: true,
      legend: false,
      click_enable_sold_seats: false,
      min_zoom: 0.45,
      max_zoom: 1.8,
      style: {
        seat: {
          shape: "circle",
          radius: 6,
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
          title_font_size: 12,
        },
      },
    };
    const map = new SeatMapCanvasLibrary(
      container,
      options as unknown as ConstructorParameters<
        typeof SeatMapCanvasLibrary
      >[1],
    ) as unknown as SeatMapPreviewRuntime;
    mapRef.current = map;

    return () => {
      mapRef.current = null;
      container.replaceChildren();
    };
  }, []);

  useEffect(() => {
    mapRef.current?.data.replaceData(
      structuredClone(seatMap.blocks) as EventSeatMapBlock[],
    );
  }, [seatMap.blocks]);

  return (
    <div
      role="img"
      aria-label={`Preview of ${seatMap.blocks.length} seating sections`}
      className="relative h-[270px] overflow-hidden rounded-[10px] bg-[#f6faff] sm:h-[320px]"
    >
      <div className="pointer-events-none absolute inset-x-0 top-2 z-10 flex justify-center">
        <span className="rounded-full border border-[#cbdcf5] bg-white/95 px-5 py-1 text-[10px] font-bold tracking-[.12em] text-[#213756] shadow-[0_2px_7px_rgba(21,53,93,.08)]">
          {seatMap.stageLabel ?? "STAGE"}
        </span>
      </div>
      <div
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none h-full w-full"
      />
      {seatMap.blocks.length === 0 && (
        <p className="pointer-events-none absolute inset-0 grid place-items-center text-[11px] text-[#6c7c98]">
          Add a section to see the seating layout.
        </p>
      )}
    </div>
  );
}
