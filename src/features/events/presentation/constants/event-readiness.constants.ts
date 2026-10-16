import { Radio, Ticket, Users } from "lucide-react";
import type { EventReadiness } from "../../domain/types/event-readiness";
import type { EventStatus } from "../../domain/types/event-status";

export const EVENT_READINESS_PANEL_CLASS =
  "min-w-0 rounded-[14px] border border-[#e5ebf4] bg-white p-4 shadow-[0_3px_14px_rgba(18,44,78,.025)] sm:p-5";

export const EVENT_READINESS_STAGES: {
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

export const EVENT_READINESS_ITEMS: {
  readonly key: keyof EventReadiness;
  readonly title: string;
  readonly icon: typeof Users;
  readonly href: string;
}[] = [
  {
    key: "crewAssigned",
    title: "Production crew assigned",
    icon: Users,
    href: "crew",
  },
  {
    key: "ingestConfigured",
    title: "Streaming ingest configured",
    icon: Radio,
    href: "crew?tab=streaming",
  },
  {
    key: "ticketPricingConfigured",
    title: "Ticket pricing configured",
    icon: Ticket,
    href: "tickets",
  },
];
