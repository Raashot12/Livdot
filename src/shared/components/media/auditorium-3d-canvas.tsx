"use client";

import {
  Bounds,
  Center,
  OrbitControls,
  useBounds,
  useGLTF,
  useProgress,
} from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, type ComponentRef } from "react";
import { Group, MOUSE, TOUCH, Vector3 } from "three";
import type {
  AuditoriumCameraActions,
  AuditoriumSeatTarget,
} from "./auditorium-seat-layout";
import { AuditoriumSeatMarkers } from "./auditorium-seat-markers";

const AUDITORIUM_MODEL_URL = "/model/auditorium.glb";
type AuditoriumBoundsApi = NonNullable<ReturnType<typeof useBounds>>;
type AuditoriumBoundsApiRef = { current: AuditoriumBoundsApi | null };

function AuditoriumModel() {
  const { scene } = useGLTF(AUDITORIUM_MODEL_URL);
  const venue = useMemo(() => {
    const model = scene.clone(true);
    model.getObjectByName("Main_Display_Screen")?.removeFromParent();
    return model;
  }, [scene]);

  return <primitive object={venue} dispose={null} />;
}

function ModelLoadingStatus() {
  const { active, progress } = useProgress();

  if (!active) return null;

  return (
    <div
      role="status"
      className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-[11px] font-medium text-[#29405f] shadow-[0_2px_9px_rgba(19,49,86,.12)]"
    >
      Loading auditorium model · {Math.round(progress)}%
    </div>
  );
}

function BoundsApiBridge({
  boundsApiRef,
}: {
  readonly boundsApiRef: AuditoriumBoundsApiRef;
}) {
  const bounds = useBounds();

  useEffect(() => {
    boundsApiRef.current = bounds;

    return () => {
      boundsApiRef.current = null;
    };
  }, [bounds, boundsApiRef]);

  return null;
}

function VenueOrbitControls({
  boundsApiRef,
  onControlsReady,
}: {
  readonly boundsApiRef: AuditoriumBoundsApiRef;
  readonly onControlsReady?: (actions: AuditoriumCameraActions | null) => void;
}) {
  const controlsRef = useRef<ComponentRef<typeof OrbitControls> | null>(null);
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    onControlsReady?.({
      zoomIn: () => {
        controls.dollyIn(1.25);
        controls.update();
      },
      zoomOut: () => {
        controls.dollyOut(1.25);
        controls.update();
      },
      reset: () => {
        const bounds = boundsApiRef.current;
        if (!bounds) return;

        const { center, distance } = bounds.refresh().getSize();
        camera.up.set(0, 1, 0);
        camera.position.set(
          center.x,
          center.y + distance * 0.45,
          center.z + distance,
        );
        camera.lookAt(center);
        controls.target.copy(center);
        controls.update();
        bounds.refresh().fit().clip();
        controls.update();
      },
      focusSeat: (position) => {
        const offsetX = position[0] - controls.target.x;
        const offsetY = position[1] - controls.target.y;
        const offsetZ = position[2] - controls.target.z;
        controls.target.set(position[0], position[1], position[2]);
        camera.position.x += offsetX;
        camera.position.y += offsetY;
        camera.position.z += offsetZ;
        controls.dollyIn(1.35);
        controls.update();
      },
    });

    return () => onControlsReady?.(null);
  }, [boundsApiRef, camera, onControlsReady]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      enablePan
      enableRotate={false}
      zoomToCursor
      minZoom={0.7}
      maxZoom={240}
      mouseButtons={{
        LEFT: MOUSE.PAN,
        MIDDLE: MOUSE.DOLLY,
        RIGHT: MOUSE.PAN,
      }}
      touches={{ ONE: TOUCH.PAN, TWO: TOUCH.DOLLY_PAN }}
    />
  );
}

export function Auditorium3DCanvas({
  seatTargets = [],
  onSeatSelect,
  onSeatFocus,
  onControlsReady,
}: {
  readonly seatTargets?: readonly AuditoriumSeatTarget[];
  readonly onSeatSelect?: (key: string) => void;
  readonly onSeatFocus?: (position: readonly [number, number, number]) => void;
  readonly onControlsReady?: (actions: AuditoriumCameraActions | null) => void;
}) {
  const boundsApiRef = useRef<AuditoriumBoundsApi | null>(null);
  const auditoriumGroupRef = useRef<Group>(null);

  function focusSeatInWorld(position: readonly [number, number, number]) {
    const group = auditoriumGroupRef.current;
    if (!group) return;

    group.updateWorldMatrix(true, false);
    const worldPosition = new Vector3(...position).applyMatrix4(
      group.matrixWorld,
    );
    onSeatFocus?.([worldPosition.x, worldPosition.y, worldPosition.z]);
  }

  return (
    <div className="absolute inset-0">
      <Canvas
        aria-hidden="true"
        orthographic
        camera={{
          position: [0, 24, 52],
          up: [0, 1, 0],
          zoom: 1,
          near: 0.1,
          far: 200,
        }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
        fallback={
          <p className="grid h-full place-items-center px-5 text-center text-sm text-[#52617f]">
            3D viewing is unavailable in this browser. Use the seat list to
            choose your seats.
          </p>
        }
      >
        <ambientLight intensity={1.8} />
        <directionalLight position={[6, 10, 7]} intensity={2.2} />
        <directionalLight position={[-7, 5, -4]} intensity={0.8} />
        <Suspense fallback={null}>
          <Bounds fit clip observe margin={1.25}>
            <BoundsApiBridge boundsApiRef={boundsApiRef} />
            <Center>
              <group ref={auditoriumGroupRef} rotation={[0, Math.PI, 0]}>
                <AuditoriumModel />
                <AuditoriumSeatMarkers
                  seats={seatTargets}
                  onSeatSelect={onSeatSelect}
                  onSeatFocus={focusSeatInWorld}
                />
              </group>
            </Center>
          </Bounds>
        </Suspense>
        <VenueOrbitControls
          boundsApiRef={boundsApiRef}
          onControlsReady={onControlsReady}
        />
      </Canvas>
      <ModelLoadingStatus />
    </div>
  );
}
