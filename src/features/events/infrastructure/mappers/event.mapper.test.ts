import { describe, expect, it } from "vitest";
import { eventDtoToEntity } from "./event.mapper";

describe("eventDtoToEntity", () => {
  it("maps event DTO values into the domain entity", () => {
    const dto = {
      id: "demo",
      title: "Demo",
      description: "",
      status: "DRAFT" as const,
      readiness: {
        crewAssigned: false,
        ingestConfigured: false,
        ticketPricingConfigured: false,
      },
      scheduledAt: null,
      version: 0,
    };
    expect(eventDtoToEntity(dto)).toEqual(dto);
  });
});
