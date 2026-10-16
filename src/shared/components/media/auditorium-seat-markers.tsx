"use client";

import { Html } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import { Color, DoubleSide, Object3D, type InstancedMesh } from "three";
import type { AuditoriumSeatTarget } from "./auditorium-seat-layout";

function getSeatNumberLabel(seat: AuditoriumSeatTarget) {
  return seat.seatLabel.startsWith(seat.rowLabel)
    ? seat.seatLabel.slice(seat.rowLabel.length)
    : seat.seatLabel;
}

export function AuditoriumSeatMarkers({
  seats,
  onSeatSelect,
  onSeatFocus,
}: {
  readonly seats: readonly AuditoriumSeatTarget[];
  readonly onSeatSelect?: (key: string) => void;
  readonly onSeatFocus?: (position: readonly [number, number, number]) => void;
}) {
  const meshRef = useRef<InstancedMesh>(null);
  const [focusedKey, setFocusedKey] = useState<string | null>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const focusedIndex = seats.findIndex((seat) => seat.key === focusedKey);

  function focusAndClaimSeat(seat: AuditoriumSeatTarget) {
    setFocusedKey(seat.key);
    onSeatFocus?.(seat.position);
    if (seat.status === "available") onSeatSelect?.(seat.key);
  }

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    seats.forEach((seat, index) => {
      dummy.position.set(
        seat.position[0],
        seat.position[1] + 0.035,
        seat.position[2],
      );
      dummy.rotation.set(-Math.PI / 2, 0, 0);
      dummy.scale.setScalar(index === focusedIndex ? 1.3 : 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);

      const color =
        seat.status === "selected"
          ? "#087cf0"
          : seat.status === "claimed"
            ? "#9eacc0"
            : seat.color;
      mesh.setColorAt(index, new Color(color));
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [dummy, focusedIndex, seats]);

  if (!seats.length) return null;

  return (
    <>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, seats.length]}
        frustumCulled={false}
        onClick={(event) => {
          event.stopPropagation();
          const seat =
            event.instanceId === undefined
              ? undefined
              : seats[event.instanceId];
          if (!seat) return;

          focusAndClaimSeat(seat);
        }}
      >
        <circleGeometry args={[0.2, 20]} />
        <meshBasicMaterial
          side={DoubleSide}
          vertexColors
          transparent
          opacity={0.96}
          depthWrite={false}
          polygonOffset
          polygonOffsetFactor={-2}
          toneMapped={false}
        />
      </instancedMesh>

      {seats.map((seat) => (
        <Html
          key={seat.key}
          center
          pointerEvents="none"
          position={[
            seat.position[0],
            seat.position[1] + 0.075,
            seat.position[2],
          ]}
          style={{
            cursor: seat.status === "available" ? "pointer" : "default",
            pointerEvents: "none",
          }}
          zIndexRange={[100, 0]}
        >
          {seat.status === "available" ? (
            <button
              type="button"
              aria-label={`Claim seat ${seat.seatLabel} in ${seat.sectionTitle}, row ${seat.rowLabel}`}
              data-seat-label={seat.seatLabel}
              data-seat-section={seat.sectionTitle}
              data-seat-status={seat.status}
              onClick={(event) => {
                event.stopPropagation();
                focusAndClaimSeat(seat);
              }}
              className="focus-ring pointer-events-auto cursor-pointer rounded-[2px] text-[4px] leading-[5px] font-extrabold whitespace-nowrap text-[#122d50] tabular-nums drop-shadow-[0_0_2px_rgba(255,255,255,.95)] select-none"
            >
              {getSeatNumberLabel(seat)}
            </button>
          ) : (
            <span
              aria-hidden="true"
              data-seat-label={seat.seatLabel}
              data-seat-section={seat.sectionTitle}
              data-seat-status={seat.status}
              className={
                "pointer-events-none text-[4px] leading-[5px] font-extrabold whitespace-nowrap tabular-nums select-none " +
                (seat.status === "selected"
                  ? "text-white drop-shadow-[0_1px_1px_rgba(0,35,94,.7)]"
                  : "text-[#5c6b82]")
              }
            >
              {getSeatNumberLabel(seat)}
            </span>
          )}
        </Html>
      ))}
    </>
  );
}
