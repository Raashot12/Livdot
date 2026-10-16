import type { EventRepository } from "../ports/event.repository";
import type { EventEntity } from "../../domain/entities/event.entity";

export class ListEventsUseCase {
  constructor(private readonly repository: EventRepository) {}
  execute(): Promise<readonly EventEntity[]> {
    return this.repository.list();
  }
}
