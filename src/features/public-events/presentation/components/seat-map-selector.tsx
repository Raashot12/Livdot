"use client";

import { List, Map as MapIcon } from "lucide-react";
import { useMemo, useState } from "react";
import type { EventSeatMap } from "@/features/events/domain/entities/event-seat-map";
import { Auditorium3DViewer } from "@/shared/components/media/auditorium-3d-viewer";
import {
  buildAuditoriumSeatTargets,
  groupSeatsByRow,
} from "./seat-map-selector.utils";
import { seatMapSelectionKey } from "../lib/public-checkout";

export function SeatMapSelector({
  seatMap,
  selectedKeys,
  onToggleSeat,
}: {
  readonly seatMap: EventSeatMap;
  readonly selectedKeys: readonly string[];
  readonly onToggleSeat: (key: string) => void;
}) {
  const [listView, setListView] = useState(false);
  const selectedKeySet = new Set(selectedKeys);
  const { targets: seatTargets, unrepresentedCount } = useMemo(
    () => buildAuditoriumSeatTargets(seatMap, selectedKeys),
    [seatMap, selectedKeys],
  );

  return (
    <div className="mt-4 overflow-hidden rounded-[14px] border border-[#e4edf8] bg-[#f6faff]">
      <div className="relative h-[420px] sm:h-[480px]">
        {!listView && (
          <>
            <Auditorium3DViewer
              className="absolute inset-0 h-full w-full"
              stageLabel={seatMap.stageLabel ?? "STAGE"}
              seatTargets={seatTargets}
              onSeatSelect={onToggleSeat}
            />
            <div className="pointer-events-none absolute top-4 left-4 z-10 max-w-[220px] rounded-xl border border-white/80 bg-white/90 px-3 py-2 shadow-[0_3px_12px_rgba(16,42,78,.1)]">
              <p className="text-xs font-semibold text-[#1b3150]">
                Explore the auditorium
              </p>
              <p className="mt-0.5 text-[10px] leading-relaxed text-[#52617f]">
                Click an available seat to focus and claim it. Drag or swipe to
                move across the seating map; scroll or pinch to zoom.
              </p>
            </div>
          </>
        )}

        {listView && (
          <div
            role="region"
            aria-label="Select exact seats by section"
            className="absolute inset-0 overflow-auto bg-white p-4 sm:p-6"
          >
            <div className="mb-5">
              <h3 className="text-base font-bold text-[#102341]">
                Choose exact seats
              </h3>
              <p className="mt-1 text-xs text-[#687693]">
                Select an available seat to claim it. Claimed seats are
                disabled. Release your seats from the order summary.
              </p>
            </div>
            <div className="space-y-6">
              {seatMap.blocks.map((block) => (
                <section
                  key={String(block.id)}
                  aria-labelledby={"seat-list-" + block.id}
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3
                      id={"seat-list-" + block.id}
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
                            const isSelected = selectedKeySet.has(key);
                            const seatDescription =
                              block.title +
                              ", " +
                              (row === "Seats" ? "" : "row " + row + ", ") +
                              "seat " +
                              seat.title +
                              (!seat.salable
                                ? ", claimed"
                                : isSelected
                                  ? ", claimed by you, release it in order summary"
                                  : ", available, select to claim");
                            return (
                              <button
                                key={String(seat.id)}
                                type="button"
                                disabled={!seat.salable || isSelected}
                                aria-pressed={isSelected}
                                onClick={() => onToggleSeat(key)}
                                className={
                                  "focus-ring min-h-11 rounded-lg border px-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed " +
                                  (isSelected
                                    ? "border-[#087cf0] bg-[#087cf0] text-white disabled:bg-[#087cf0] disabled:text-white"
                                    : seat.salable
                                      ? "border-[#dce7f5] bg-white text-[#263657] hover:border-[#7ab6f6] hover:bg-[#f2f8ff]"
                                      : "border-[#e1e7ef] bg-[#f1f4f8] text-[#8793a6] disabled:bg-[#f1f4f8] disabled:text-[#8793a6]")
                                }
                                aria-label={seatDescription}
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
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2 text-[11px] text-[#52617f]">
          <span className="inline-flex items-center gap-1.5">
            <span
              className="size-3 rounded-full bg-[#72b6ff]"
              aria-hidden="true"
            />
            Available
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="size-3 rounded-full bg-[#087cf0]"
              aria-hidden="true"
            />
            Claimed by you
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="size-3 rounded-full bg-[#9eacc0]"
              aria-hidden="true"
            />
            Claimed
          </span>
          <span className="shrink-0 font-semibold text-[#314966]">
            Sections
          </span>
          {seatMap.blocks.map((block) => (
            <span
              key={String(block.id)}
              className="inline-flex items-center gap-1.5"
            >
              <span
                className="size-3 shrink-0 rounded-sm border border-black/10"
                style={{ backgroundColor: block.color ?? "#93c5fd" }}
                aria-hidden="true"
              />
              {block.title} ({block.seats.filter((seat) => seat.salable).length}{" "}
              available)
            </span>
          ))}
          {unrepresentedCount > 0 && (
            <span className="text-[#687693]">
              {unrepresentedCount} more{" "}
              {unrepresentedCount === 1 ? "seat" : "seats"} in list
            </span>
          )}
        </div>
        <button
          type="button"
          aria-pressed={listView}
          onClick={() => setListView((current) => !current)}
          className="focus-ring inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border border-[#dce5f2] px-3 text-xs font-semibold text-[#174a87] transition-colors hover:bg-[#f5f9ff]"
        >
          {listView ? (
            <MapIcon size={15} aria-hidden="true" />
          ) : (
            <List size={15} aria-hidden="true" />
          )}
          {listView ? "View 3D venue" : "Choose exact seats"}
        </button>
      </div>
    </div>
  );
}
