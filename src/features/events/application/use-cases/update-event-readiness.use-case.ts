import type { EventEntity } from "../../domain/entities/event.entity";
import type { EventReadiness } from "../../domain/types/event-readiness";
import type { EventRepository } from "../ports/event.repository";

export class UpdateEventReadinessUseCase {
  constructor(private readonly repository: EventRepository) {}

  execute(
    id: string,
    readiness: Partial<EventReadiness>,
  ): Promise<EventEntity> {
    return this.repository.updateReadiness(id, readiness);
  }
}
