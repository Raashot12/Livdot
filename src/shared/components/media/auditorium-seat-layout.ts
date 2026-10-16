export type AuditoriumSeatPosition = readonly [number, number, number];

const SEATS_PER_SIDE_ROW = 20;
const MODEL_ROWS = 12;
export const AUDITORIUM_SEAT_TARGET_CAPACITY =
  MODEL_ROWS * SEATS_PER_SIDE_ROW * 2;
const MODEL_ROW_RADIUS = 7.48;
const MODEL_ROW_RADIUS_STEP = 1.18;
const MODEL_ROW_HEIGHT = 0.08;
const MODEL_ROW_HEIGHT_STEP = 0.1345;
const FIRST_SEAT_ANGLE = (1.6 * Math.PI) / 180;
const LAST_SEAT_ANGLE = (83 * Math.PI) / 180;

/** Returns clickable positions aligned to the auditorium's 12 x 2 x 20 seat rows. */
export function createAuditoriumSeatPositions(
  count: number,
): AuditoriumSeatPosition[] {
  const safeCount = Math.min(
    Math.max(0, Math.floor(count)),
    AUDITORIUM_SEAT_TARGET_CAPACITY,
  );
  const positions: AuditoriumSeatPosition[] = [];
  const positionsPerVenueRow = SEATS_PER_SIDE_ROW * 2;

  for (let index = 0; index < safeCount; index += 1) {
    const rowIndex = Math.floor(index / positionsPerVenueRow);
    const positionInRow = index % positionsPerVenueRow;
    const sideIndex = Math.floor(positionInRow / SEATS_PER_SIDE_ROW);
    const seatIndex = positionInRow % SEATS_PER_SIDE_ROW;
    const fraction = seatIndex / (SEATS_PER_SIDE_ROW - 1);
    const angle =
      FIRST_SEAT_ANGLE + fraction * (LAST_SEAT_ANGLE - FIRST_SEAT_ANGLE);
    const radius = MODEL_ROW_RADIUS + rowIndex * MODEL_ROW_RADIUS_STEP;
    const xDirection = sideIndex === 0 ? -1 : 1;

    positions.push([
      xDirection * radius * Math.cos(angle),
      MODEL_ROW_HEIGHT + rowIndex * MODEL_ROW_HEIGHT_STEP,
      radius * Math.sin(angle),
    ]);
  }

  return positions;
}

export type AuditoriumSeatStatus = "available" | "selected" | "claimed";

export interface AuditoriumSeatTarget {
  readonly key: string;
  readonly seatLabel: string;
  readonly rowLabel: string;
  readonly sectionTitle: string;
  readonly color: string;
  readonly status: AuditoriumSeatStatus;
  readonly position: AuditoriumSeatPosition;
}

export interface AuditoriumCameraActions {
  readonly zoomIn: () => void;
  readonly zoomOut: () => void;
  readonly reset: () => void;
  readonly focusSeat: (position: AuditoriumSeatPosition) => void;
}
