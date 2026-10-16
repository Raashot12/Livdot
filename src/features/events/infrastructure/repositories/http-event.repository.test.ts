import { afterEach, describe, expect, it } from "vitest";
import { server } from "@/mocks/server";
import { eventMockStore } from "@/mocks/state/event.mock-store";
import { HttpEventRepository } from "./http-event.repository";

describe("HTTP event repository with MSW", () => {
  afterEach(() => {
    server.resetHandlers();
    eventMockStore.reset();
    eventMockStore.setFailureScenario("none");
  });
  it("loads realistic event fixtures through the mocked API", async () => {
    const repository = new HttpEventRepository();
    const events = await repository.list();
    expect(events).toHaveLength(4);
    expect(events[0]).toMatchObject({
      id: "evt-ingest-pending",
      status: "SCHEDULED",
      readiness: { ingestConfigured: false },
    });
  });
  it("validates versioned transitions and increments the authoritative version", async () => {
    const repository = new HttpEventRepository();
    await expect(
      repository.transition("evt-ready", "READY", 4),
    ).resolves.toMatchObject({ status: "READY", version: 5 });
    await expect(
      repository.transition("evt-ready", "LIVE", 4),
    ).rejects.toMatchObject({ code: "VERSION_CONFLICT" });
  });
  it("independently rejects a readiness-blocked transition at the mock API", async () => {
    const repository = new HttpEventRepository();
    await expect(
      repository.transition("evt-ingest-pending", "READY", 1),
    ).rejects.toMatchObject({
      code: "READINESS_BLOCKED",
      details: ["Configure streaming ingest"],
    });
  });
  it("supports deterministic simulated service failures", async () => {
    eventMockStore.setFailureScenario("transition");
    await expect(
      new HttpEventRepository().transition("evt-ready", "READY", 4),
    ).rejects.toMatchObject({ code: "SERVER_FAILURE" });
  });
});
