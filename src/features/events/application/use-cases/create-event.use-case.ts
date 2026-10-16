import type { EventEntity } from "../../domain/entities/event.entity";
import type {
  CreateEventInput,
  EventRepository,
} from "../ports/event.repository";

export class CreateEventUseCase {
  constructor(private readonly repository: EventRepository) {}

  execute(input: CreateEventInput): Promise<EventEntity> {
    return this.repository.create(input);
  }
}
