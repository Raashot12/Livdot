import { describe, expect, it, vi } from "vitest";
import type { EventEntity } from "../../domain/entities/event.entity";
import type { EventRepository } from "../ports/event.repository";
import { EventApplicationError } from "../errors/event-application.error";
import { GetEventUseCase } from "./get-event.use-case";
import { ListEventsUseCase } from "./list-events.use-case";
import { TransitionEventUseCase } from "./transition-event.use-case";

const scheduled: EventEntity = {
  id: "evt",
  title: "Demo",
  description: "",
  status: "SCHEDULED",
  readiness: {
    crewAssigned: true,
    ingestConfigured: true,
    ticketPricingConfigured: true,
  },
  scheduledAt: null,
  version: 3,
};
function makeRepository(overrides: Partial<EventRepository> = {}) {
  const repository: EventRepository = {
    list: vi.fn(async () => [scheduled]),
    getById: vi.fn(async () => scheduled),
    create: vi.fn(async (input) => ({
      ...input,
      id: "evt-created",
      version: 1,
    })),
    updateReadiness: vi.fn(async (_id, readiness) => ({
      ...scheduled,
      readiness: { ...scheduled.readiness, ...readiness },
      version: 4,
    })),
    transition: vi.fn(async (_id, target) => ({
      ...scheduled,
      status: target,
      version: 4,
    })),
    ...overrides,
  };
  return repository;
}

describe("event use cases", () => {
  it("retrieves an event", async () =>
    expect(await new GetEventUseCase(makeRepository()).execute("evt")).toEqual(
      scheduled,
    ));
  it("lists available events", async () =>
    expect(await new ListEventsUseCase(makeRepository()).execute()).toEqual([
      scheduled,
    ]));
  it("submits a valid transition and returns the authoritative event", async () => {
    const repository = makeRepository();
    await expect(
      new TransitionEventUseCase(repository).execute("evt", "READY"),
    ).resolves.toMatchObject({ status: "READY", version: 4 });
    expect(repository.transition).toHaveBeenCalledWith("evt", "READY", 3);
  });
  it("rejects invalid transitions without calling repository mutation", async () => {
    const repository = makeRepository();
    await expect(
      new TransitionEventUseCase(repository).execute("evt", "LIVE"),
    ).rejects.toMatchObject({ code: "INVALID_TRANSITION" });
    expect(repository.transition).not.toHaveBeenCalled();
  });
  it("propagates network failures", async () => {
    const repository = makeRepository({
      list: vi
        .fn()
        .mockRejectedValue(
          new EventApplicationError(
            "NETWORK_FAILURE",
            "Unable to reach the event service.",
          ),
        ),
    });
    await expect(
      new ListEventsUseCase(repository).execute(),
    ).rejects.toMatchObject({ code: "NETWORK_FAILURE" });
  });
  it("propagates version conflicts returned by the repository", async () => {
    const conflict = Object.assign(new Error("stale"), {
      code: "VERSION_CONFLICT",
    });
    const repository = makeRepository({
      transition: vi.fn().mockRejectedValue(conflict),
    });
    await expect(
      new TransitionEventUseCase(repository).execute("evt", "READY"),
    ).rejects.toBe(conflict);
  });
  it("rejects a supplied stale version before mutation", async () => {
    const repository = makeRepository();
    await expect(
      new TransitionEventUseCase(repository).execute("evt", "READY", 2),
    ).rejects.toMatchObject({ code: "VERSION_CONFLICT" });
    expect(repository.transition).not.toHaveBeenCalled();
  });
});
