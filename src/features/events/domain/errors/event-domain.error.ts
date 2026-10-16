export type EventDomainErrorCode =
  | "NOT_FOUND"
  | "INVALID_EVENT"
  | "INVALID_TRANSITION"
  | "READINESS_BLOCKED"
  | "VERSION_CONFLICT"
  | "NETWORK_FAILURE"
  | "SERVER_FAILURE";

export class EventDomainError extends Error {
  constructor(
    readonly code: EventDomainErrorCode,
    message: string,
    readonly details?: readonly string[],
  ) {
    super(message);
    this.name = "EventDomainError";
  }
}
