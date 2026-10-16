import type { EventStatus } from "../../domain/types/event-status";

export const EVENT_OVERVIEW_PANEL_CLASS =
  "min-w-0 rounded-[14px] border border-[#e5ebf4] bg-white p-4 shadow-[0_3px_14px_rgba(18,44,78,.025)] sm:p-5";

export const EVENT_OVERVIEW_LIFECYCLE: {
  readonly status: EventStatus;
  readonly label: string;
}[] = [
  { status: "DRAFT", label: "Draft" },
  { status: "SCHEDULED", label: "Scheduled" },
  { status: "READY", label: "Ready" },
  { status: "LIVE", label: "Live" },
  { status: "COMPLETED", label: "Completed" },
  { status: "REPLAY_AVAILABLE", label: "Replay" },
];

export const EVENT_OVERVIEW_REQUIREMENTS = [
  {
    key: "crewAssigned",
    title: "Production crew assigned",
    hrefSuffix: "crew",
  },
  {
    key: "ingestConfigured",
    title: "Streaming ingest configured",
    hrefSuffix: "crew?tab=streaming",
  },
  {
    key: "ticketPricingConfigured",
    title: "Ticket pricing configured",
    hrefSuffix: "tickets",
  },
] as const;
