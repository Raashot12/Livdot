export type SeatMapId = string | number;

export interface EventSeatMapSeat {
  readonly id: SeatMapId;
  readonly title: string;
  readonly x: number;
  readonly y: number;
  readonly salable: boolean;
  readonly color?: string;
  readonly note?: string;
  readonly row?: string;
  readonly price?: number;
  readonly currency?: string;
  readonly custom_data?: Readonly<Record<string, unknown>>;
}

export interface EventSeatMapLabel {
  readonly title: string;
  readonly x: number;
  readonly y: number;
}

export interface EventSeatMapBlock {
  readonly id: SeatMapId;
  readonly title: string;
  readonly color?: string;
  readonly price?: number;
  readonly currency?: string;
  readonly x?: number;
  readonly y?: number;
  readonly labels?: readonly EventSeatMapLabel[];
  readonly seats: readonly EventSeatMapSeat[];
}

/** Venue seating data supplied by the event service when assigned to an event. */
export interface EventSeatMap {
  readonly blocks: readonly EventSeatMapBlock[];
  readonly maxSelectable?: number;
  readonly stageLabel?: string;
}
