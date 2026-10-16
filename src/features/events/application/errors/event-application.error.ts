import type { EventDomainErrorCode } from "../../domain/errors/event-domain.error";

export class EventApplicationError extends Error {
  constructor(
    readonly code: EventDomainErrorCode,
    message: string,
    readonly details?: readonly string[],
  ) {
    super(message);
    this.name = "EventApplicationError";
  }
}
