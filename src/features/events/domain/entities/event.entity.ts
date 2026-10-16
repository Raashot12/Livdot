import type { EventReadiness } from "../types/event-readiness";
import type { EventStatus } from "../types/event-status";
import type { EventSeatMap } from "./event-seat-map";
import type { EventTicketOption } from "./event-ticket-option";

export interface EventEntity {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly status: EventStatus;
  readonly readiness: EventReadiness;
  readonly scheduledAt: string | null;
  readonly seatMap?: EventSeatMap | null;
  readonly ticketOptions?: readonly EventTicketOption[] | null;
  readonly version: number;
}
