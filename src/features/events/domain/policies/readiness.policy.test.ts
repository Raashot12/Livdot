import { describe, expect, it } from "vitest";
import { evaluateReadiness } from "./readiness.policy";

describe("evaluateReadiness", () => {
  it.each([
    [
      {
        crewAssigned: false,
        ingestConfigured: true,
        ticketPricingConfigured: true,
      },
      "CREW_NOT_ASSIGNED",
    ],
    [
      {
        crewAssigned: true,
        ingestConfigured: false,
        ticketPricingConfigured: true,
      },
      "INGEST_NOT_CONFIGURED",
    ],
    [
      {
        crewAssigned: true,
        ingestConfigured: true,
        ticketPricingConfigured: false,
      },
      "TICKET_PRICING_NOT_CONFIGURED",
    ],
  ] as const)("blocks unmet requirement %s", (readiness, code) => {
    const result = evaluateReadiness(readiness);
    expect(result.ready).toBe(false);
    if (!result.ready)
      expect(result.blockers.map((item) => item.code)).toContain(code);
  });
  it("returns multiple blockers together", () => {
    const result = evaluateReadiness({
      crewAssigned: false,
      ingestConfigured: false,
      ticketPricingConfigured: false,
    });
    expect(result.ready).toBe(false);
    if (!result.ready) expect(result.blockers).toHaveLength(3);
  });
  it("allows when every requirement passes", () => {
    expect(
      evaluateReadiness({
        crewAssigned: true,
        ingestConfigured: true,
        ticketPricingConfigured: true,
      }),
    ).toEqual({ ready: true, blockers: [] });
  });
});
