import type { EventEntity } from "../../domain/entities/event.entity";
import type { EventDto } from "../dto/event.dto";

export function eventDtoToEntity(dto: EventDto): EventEntity {
  return { ...dto, readiness: { ...dto.readiness } };
}
