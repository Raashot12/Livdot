import type { EventEntity } from "../../domain/entities/event.entity";
import type { EventStatus } from "../../domain/types/event-status";
import type { EventReadiness } from "../../domain/types/event-readiness";
import type {
  CreateEventInput,
  EventRepository,
} from "../../application/ports/event.repository";
import { EventApplicationError } from "../../application/errors/event-application.error";
import { eventDtoSchema } from "../dto/event.dto";
import { eventDtoToEntity } from "../mappers/event.mapper";
import { shouldUseMockEventApi } from "@/shared/config/event-api-mode";

const API_BASE = shouldUseMockEventApi
  ? "/api/v1"
  : (process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/v1");

export class HttpEventRepository implements EventRepository {
  async list(): Promise<readonly EventEntity[]> {
    const data = await this.request<unknown>("/events");
    if (!Array.isArray(data))
      throw new EventApplicationError(
        "SERVER_FAILURE",
        "Event service returned an invalid response.",
      );
    return data.map((item) => eventDtoToEntity(this.parseDto(item)));
  }
  async getById(id: string): Promise<EventEntity | null> {
    try {
      return eventDtoToEntity(
        this.parseDto(
          await this.request<unknown>(`/events/${encodeURIComponent(id)}`),
        ),
      );
    } catch (error) {
      if (error instanceof EventApplicationError && error.code === "NOT_FOUND")
        return null;
      throw error;
    }
  }
  async create(input: CreateEventInput): Promise<EventEntity> {
    const data = await this.request<unknown>("/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return eventDtoToEntity(this.parseDto(data));
  }
  async updateReadiness(
    id: string,
    readiness: Partial<EventReadiness>,
  ): Promise<EventEntity> {
    const data = await this.request<unknown>(
      `/events/${encodeURIComponent(id)}/readiness`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(readiness),
      },
    );
    return eventDtoToEntity(this.parseDto(data));
  }
  async transition(
    id: string,
    target: EventStatus,
    expectedVersion: number,
  ): Promise<EventEntity> {
    const data = await this.request<unknown>(
      `/events/${encodeURIComponent(id)}/transitions`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, expectedVersion }),
      },
    );
    return eventDtoToEntity(this.parseDto(data));
  }
  private parseDto(value: unknown) {
    const parsed = eventDtoSchema.safeParse(value);
    if (!parsed.success)
      throw new EventApplicationError(
        "SERVER_FAILURE",
        "Event service returned an invalid event payload.",
      );
    return parsed.data;
  }
  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    let response: Response;
    try {
      response = await fetch(`${API_BASE}${path}`, init);
    } catch {
      throw new EventApplicationError(
        "NETWORK_FAILURE",
        "Unable to reach the event service.",
      );
    }
    const payload = (await response.json().catch(() => null)) as {
      message?: string;
      blockers?: string[];
    } | null;
    if (!response.ok) {
      const code =
        response.status === 404
          ? "NOT_FOUND"
          : response.status === 400
            ? "INVALID_EVENT"
            : response.status === 409
              ? "VERSION_CONFLICT"
              : response.status === 422
                ? payload?.blockers
                  ? "READINESS_BLOCKED"
                  : "INVALID_TRANSITION"
                : response.status >= 500
                  ? "SERVER_FAILURE"
                  : "INVALID_TRANSITION";
      throw new EventApplicationError(
        code,
        payload?.message ?? "The event service could not complete the request.",
        payload?.blockers,
      );
    }
    return payload as T;
  }
}
