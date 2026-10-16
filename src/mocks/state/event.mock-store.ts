import type { EventEntity } from "@/features/events/domain/entities/event.entity";
import type { EventReadiness } from "@/features/events/domain/types/event-readiness";
import { eventDtoSchema } from "@/features/events/infrastructure/dto/event.dto";
import { eventFixtures } from "../fixtures/events.fixtures";

const storageKey = "liv-dot-events-mock-v1";
const retiredSampleIds = new Set([
  "evt-afrobeats-summit",
  "evt-tech-meets-creativity",
  "evt-creators-connect-2024",
  "evt-future-afrobeats",
  "evt-creator-workshop",
  "evt-ingest-pending",
  "evt-ready",
  "evt-live",
  "evt-completed",
]);

function fixtureEvents(): EventEntity[] {
  return eventFixtures.map((event) => structuredClone(event));
}

function includeMissingFixtures(events: EventEntity[]) {
  const existingIds = new Set(events.map((event) => event.id));
  const missingFixtures = fixtureEvents().filter(
    (event) => !existingIds.has(event.id),
  );
  return [...missingFixtures, ...events];
}

function readStoredEvents(): EventEntity[] {
  if (typeof window === "undefined") return fixtureEvents();
  try {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return fixtureEvents();
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) return fixtureEvents();
    const events: EventEntity[] = [];
    for (const item of parsed) {
      const result = eventDtoSchema.safeParse(item);
      if (!result.success) return fixtureEvents();
      if (!retiredSampleIds.has(result.data.id)) events.push(result.data);
    }
    return includeMissingFixtures(events);
  } catch {
    return fixtureEvents();
  }
}

let events: EventEntity[] = readStoredEvents();
const configuredScenario = process.env.NEXT_PUBLIC_MOCK_FAILURE_SCENARIO;
let failureScenario: "none" | "transition" | "all" =
  configuredScenario === "transition" || configuredScenario === "all"
    ? configuredScenario
    : "none";

function persistEvents() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(events));
  } catch {
    // Keep the current session usable if browser storage is unavailable.
  }
}

export const eventMockStore = {
  list: () => events.map((event) => structuredClone(event)),
  get: (id: string) => {
    const event = events.find((item) => item.id === id);
    return event ? structuredClone(event) : null;
  },
  create: (input: Omit<EventEntity, "id" | "version">) => {
    const slug = input.title
      .normalize("NFKD")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 64);
    const baseId = `evt-${slug || "new-event"}`;
    let id = baseId;
    let suffix = 2;
    while (events.some((event) => event.id === id)) {
      id = `${baseId}-${suffix}`;
      suffix += 1;
    }
    const created: EventEntity = { ...input, id, version: 1 };
    events = [created, ...events];
    persistEvents();
    return structuredClone(created);
  },
  updateReadiness: (id: string, readiness: Partial<EventReadiness>) => {
    const current = events.find((event) => event.id === id);
    if (!current) return null;
    const updated: EventEntity = {
      ...current,
      readiness: { ...current.readiness, ...readiness },
      version: current.version + 1,
    };
    events = events.map((event) => (event.id === id ? updated : event));
    persistEvents();
    return structuredClone(updated);
  },
  replace: (event: EventEntity) => {
    events = events.map((item) =>
      item.id === event.id ? structuredClone(event) : item,
    );
    persistEvents();
  },
  reset: () => {
    events = fixtureEvents();
    persistEvents();
  },
  setFailureScenario: (scenario: "none" | "transition" | "all") => {
    failureScenario = scenario;
  },
  shouldFail: (operation: "read" | "create" | "readiness" | "transition") =>
    failureScenario === "all" ||
    (failureScenario === "transition" && operation === "transition"),
};
