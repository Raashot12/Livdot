import type { EventRepository } from "../ports/event.repository";
import type { EventEntity } from "../../domain/entities/event.entity";
import type { EventStatus } from "../../domain/types/event-status";
import { evaluateTransition } from "../../domain/policies/transition.policy";
import { EventApplicationError } from "../errors/event-application.error";

export class TransitionEventUseCase {
  constructor(private readonly repository: EventRepository) {}
  async execute(
    id: string,
    target: EventStatus,
    expectedVersion?: number,
  ): Promise<EventEntity> {
    const current = await this.repository.getById(id);
    if (!current)
      throw new EventApplicationError(
        "NOT_FOUND",
        `Event ${id} was not found.`,
      );
    const result = evaluateTransition(current, target);
    if (!result.allowed) {
      const code = result.reason;
      throw new EventApplicationError(
        code,
        code === "READINESS_BLOCKED"
          ? "Event is not operationally ready."
          : "Requested event transition is invalid.",
        result.blockers,
      );
    }
    const version = expectedVersion ?? current.version;
    if (version !== current.version)
      throw new EventApplicationError(
        "VERSION_CONFLICT",
        "The event changed while this action was in progress. Refresh and try again.",
      );
    try {
      return await this.repository.transition(id, target, version);
    } catch (error) {
      if (error instanceof EventApplicationError) throw error;
      throw error;
    }
  }
}
