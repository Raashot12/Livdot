import type { EventEntity } from "../../domain/entities/event.entity";
import type { EventReadiness } from "../../domain/types/event-readiness";
import type { EventStatus } from "../../domain/types/event-status";

export type CreateEventInput = Pick<
  EventEntity,
  | "title"
  | "description"
  | "status"
  | "readiness"
  | "scheduledAt"
  | "seatMap"
  | "ticketOptions"
>;

export interface EventRepository {
  list(): Promise<readonly EventEntity[]>;
  getById(id: string): Promise<EventEntity | null>;
  create(input: CreateEventInput): Promise<EventEntity>;
  updateReadiness(
    id: string,
    readiness: Partial<EventReadiness>,
  ): Promise<EventEntity>;
  transition(
    id: string,
    target: EventStatus,
    expectedVersion: number,
  ): Promise<EventEntity>;
}
