import type { EventRepository } from "../ports/event.repository";
import type { EventEntity } from "../../domain/entities/event.entity";
import { EventApplicationError } from "../errors/event-application.error";

export class GetEventUseCase {
  constructor(private readonly repository: EventRepository) {}
  async execute(id: string): Promise<EventEntity> {
    const event = await this.repository.getById(id);
    if (!event)
      throw new EventApplicationError(
        "NOT_FOUND",
        `Event ${id} was not found.`,
      );
    return event;
  }
}
