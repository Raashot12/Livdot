"use client";

import dynamic from "next/dynamic";
import { LoaderCircle, Minus, Plus, RotateCcw } from "lucide-react";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import type {
  AuditoriumCameraActions,
  AuditoriumSeatTarget,
} from "./auditorium-seat-layout";

const AuditoriumCanvas = dynamic(
  () =>
    import("./auditorium-3d-canvas").then(
      (module) => module.Auditorium3DCanvas,
    ),
  {
    ssr: false,
    loading: () => <ViewerLoadingState />,
  },
);

function ViewerLoadingState() {
  return (
    <div
      role="status"
      className="absolute inset-0 grid place-items-center text-sm font-medium text-[#52617f]"
    >
      <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/90 px-4 py-2 shadow-[0_2px_9px_rgba(19,49,86,.1)]">
        <LoaderCircle
          size={16}
          className="animate-spin motion-reduce:animate-none"
          aria-hidden="true"
        />
        Preparing 3D venue
      </span>
    </div>
  );
}

class AuditoriumErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

export function Auditorium3DViewer({
  className = "",
  stageLabel = "STAGE",
  seatTargets = [],
  onSeatSelect,
}: {
  readonly className?: string;
  readonly stageLabel?: string;
  readonly seatTargets?: readonly AuditoriumSeatTarget[];
  readonly onSeatSelect?: (key: string) => void;
}) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [cameraActions, setCameraActions] =
    useState<AuditoriumCameraActions | null>(null);
  const supportsIntersectionObserver =
    typeof IntersectionObserver !== "undefined";

  function handleSeatFocus(focusPosition: readonly [number, number, number]) {
    cameraActions?.focusSeat(focusPosition);
  }

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !supportsIntersectionObserver) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setShouldLoad(true);
        observer.disconnect();
      },
      { rootMargin: "180px" },
    );

    observer.observe(viewer);
    return () => observer.disconnect();
  }, [supportsIntersectionObserver]);

  return (
    <div
      ref={viewerRef}
      role="group"
      aria-label="Fixed low front-angle 3D auditorium showing chair fronts. Drag or swipe to pan, scroll or pinch to zoom, and click an available seat to focus and claim it."
      className={`relative isolate overflow-hidden bg-[radial-gradient(ellipse_at_50%_15%,#fff_0%,#edf5ff_57%,#e5effb_100%)] ${className}`}
    >
      {shouldLoad || !supportsIntersectionObserver ? (
        <AuditoriumErrorBoundary
          key={attempt}
          fallback={
            <div className="absolute inset-0 grid place-items-center px-6 text-center">
              <div className="max-w-xs">
                <p className="text-sm font-semibold text-[#172b49]">
                  The 3D venue did not load.
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#52617f]">
                  Check your connection and try the preview again.
                </p>
                <button
                  type="button"
                  onClick={() => setAttempt((current) => current + 1)}
                  className="focus-ring mt-3 inline-flex min-h-9 items-center gap-2 rounded-lg border border-[#cddcef] bg-white px-3 text-xs font-semibold text-[#174a87] transition-colors hover:bg-[#f4f8ff]"
                >
                  <RotateCcw size={14} aria-hidden="true" />
                  Retry 3D preview
                </button>
              </div>
            </div>
          }
        >
          <AuditoriumCanvas
            seatTargets={seatTargets}
            onSeatSelect={onSeatSelect}
            onSeatFocus={handleSeatFocus}
            onControlsReady={setCameraActions}
          />
        </AuditoriumErrorBoundary>
      ) : (
        <ViewerLoadingState />
      )}

      <div className="pointer-events-none absolute inset-x-0 top-3 z-10 flex justify-center">
        <span className="rounded-full border border-[#cbdcf5] bg-white/95 px-5 py-1 text-[10px] font-bold tracking-[.12em] text-[#213756] shadow-[0_2px_7px_rgba(21,53,93,.08)]">
          {stageLabel}
        </span>
      </div>
      <div className="absolute bottom-3 left-3 z-20 inline-flex items-center gap-1 rounded-xl border border-white/80 bg-white/95 p-1 shadow-[0_3px_12px_rgba(16,42,78,.12)]">
        <button
          type="button"
          aria-label="Zoom in on the seating area"
          title="Zoom in"
          disabled={!cameraActions}
          onClick={() => cameraActions?.zoomIn()}
          className="focus-ring grid size-9 place-items-center rounded-lg text-[#1c477d] transition-colors hover:bg-[#eef6ff] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus size={18} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Zoom out from the seating area"
          title="Zoom out"
          disabled={!cameraActions}
          onClick={() => cameraActions?.zoomOut()}
          className="focus-ring grid size-9 place-items-center rounded-lg text-[#1c477d] transition-colors hover:bg-[#eef6ff] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Minus size={18} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Reset auditorium view"
          title="Reset view"
          disabled={!cameraActions}
          onClick={() => cameraActions?.reset()}
          className="focus-ring grid size-9 place-items-center rounded-lg text-[#1c477d] transition-colors hover:bg-[#eef6ff] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RotateCcw size={15} aria-hidden="true" />
        </button>
      </div>
      <div className="pointer-events-none absolute right-3 bottom-3 z-10 rounded-full border border-white/75 bg-white/85 px-3 py-1.5 text-[10px] font-medium text-[#385273] shadow-[0_2px_7px_rgba(21,53,93,.08)]">
        Drag or swipe to move | scroll or pinch to zoom
      </div>
    </div>
  );
}
