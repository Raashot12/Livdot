import { delay, http, HttpResponse } from "msw";
import { evaluateTransition } from "@/features/events/domain/policies/transition.policy";
import type { EventStatus } from "@/features/events/domain/types/event-status";
import {
  createEventRequestSchema,
  updateEventReadinessRequestSchema,
} from "@/features/events/infrastructure/dto/event.dto";
import { eventMockStore } from "../state/event.mock-store";

const latency = Number(process.env.NEXT_PUBLIC_MOCK_API_LATENCY_MS ?? 350);
const wait = () => delay(Number.isFinite(latency) ? latency : 350);
const failIfConfigured = (
  operation: "read" | "create" | "readiness" | "transition",
) =>
  eventMockStore.shouldFail(operation)
    ? HttpResponse.json(
        { message: "Simulated mock service failure." },
        { status: 503 },
      )
    : null;

export const eventHandlers = [
  http.get("*/api/v1/events", async () => {
    await wait();
    const failure = failIfConfigured("read");
    if (failure) return failure;
    return HttpResponse.json(eventMockStore.list());
  }),
  http.get("*/api/v1/events/:eventId", async ({ params }) => {
    await wait();
    const failure = failIfConfigured("read");
    if (failure) return failure;
    const event = eventMockStore.get(String(params.eventId));
    return event
      ? HttpResponse.json(event)
      : HttpResponse.json({ message: "Event was not found." }, { status: 404 });
  }),
  http.post("*/api/v1/events", async ({ request }) => {
    await wait();
    const failure = failIfConfigured("create");
    if (failure) return failure;
    const input = createEventRequestSchema.safeParse(
      await request.json().catch(() => null),
    );
    if (!input.success)
      return HttpResponse.json(
        { message: "Enter valid event details before publishing." },
        { status: 400 },
      );
    return HttpResponse.json(eventMockStore.create(input.data), {
      status: 201,
    });
  }),
  http.patch(
    "*/api/v1/events/:eventId/readiness",
    async ({ params, request }) => {
      await wait();
      const failure = failIfConfigured("readiness");
      if (failure) return failure;
      const input = updateEventReadinessRequestSchema.safeParse(
        await request.json().catch(() => null),
      );
      if (!input.success)
        return HttpResponse.json(
          { message: "Update at least one valid readiness requirement." },
          { status: 400 },
        );
      const event = eventMockStore.updateReadiness(
        String(params.eventId),
        input.data,
      );
      return event
        ? HttpResponse.json(event)
        : HttpResponse.json(
            { message: "Event was not found." },
            { status: 404 },
          );
    },
  ),
  http.post(
    "*/api/v1/events/:eventId/transitions",
    async ({ params, request }) => {
      await wait();
      const failure = failIfConfigured("transition");
      if (failure) return failure;
      const event = eventMockStore.get(String(params.eventId));
      if (!event)
        return HttpResponse.json(
          { message: "Event was not found." },
          { status: 404 },
        );
      const body = (await request.json().catch(() => null)) as {
        target?: EventStatus;
        expectedVersion?: number;
      } | null;
      if (!body?.target || typeof body.expectedVersion !== "number")
        return HttpResponse.json(
          { message: "A target status and expectedVersion are required." },
          { status: 400 },
        );
      if (event.version !== body.expectedVersion)
        return HttpResponse.json(
          { message: "Event version is stale. Refresh and try again." },
          { status: 409 },
        );
      const result = evaluateTransition(event, body.target);
      if (!result.allowed)
        return HttpResponse.json(
          {
            message:
              result.reason === "READINESS_BLOCKED"
                ? "Event readiness requirements are incomplete."
                : "Requested event transition is invalid.",
            blockers: result.blockers,
          },
          { status: 422 },
        );
      const updated = {
        ...event,
        status: body.target,
        version: event.version + 1,
      };
      eventMockStore.replace(updated);
      return HttpResponse.json(updated);
    },
  ),
];
