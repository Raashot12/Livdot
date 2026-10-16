import { describe, expect, it } from "vitest";
import type { EventEntity } from "../entities/event.entity";
import { evaluateTransition } from "./transition.policy";

const event: EventEntity = {
  id: "event-1",
  title: "Sample",
  description: "",
  status: "SCHEDULED",
  readiness: {
    crewAssigned: true,
    ingestConfigured: true,
    ticketPricingConfigured: true,
  },
  scheduledAt: null,
  version: 1,
};

describe("evaluateTransition", () => {
  it("accepts the next lifecycle status", () =>
    expect(evaluateTransition(event, "READY").allowed).toBe(true));
  it("rejects an invalid transition", () =>
    expect(evaluateTransition(event, "LIVE")).toMatchObject({
      allowed: false,
      reason: "INVALID_TRANSITION",
    }));
  it("blocks readiness transition with blockers", () =>
    expect(
      evaluateTransition(
        {
          ...event,
          readiness: { ...event.readiness, ingestConfigured: false },
        },
        "READY",
      ),
    ).toMatchObject({ allowed: false, reason: "READINESS_BLOCKED" }));
  it("does not allow a completed event to return to live", () =>
    expect(
      evaluateTransition({ ...event, status: "COMPLETED" }, "LIVE"),
    ).toMatchObject({ allowed: false, reason: "INVALID_TRANSITION" }));
});
