import { Radio, Ticket, Users } from "lucide-react";
import type { EventEntity } from "../../domain/entities/event.entity";

export const EMPTY_LIVE_CONTROL_EVENTS: EventEntity[] = [];

export const EVENT_LIVE_CONTROL_PANEL_CLASS =
  "min-w-0 rounded-[14px] border border-[#e5ebf4] bg-white shadow-[0_3px_14px_rgba(18,44,78,.025)]";

export const EVENT_LIVE_CONTROL_STATUSES = [
  "ALL",
  "LIVE",
  "READY",
  "SCHEDULED",
  "COMPLETED",
  "DRAFT",
] as const;

export type EventLiveControlFilterStatus =
  (typeof EVENT_LIVE_CONTROL_STATUSES)[number];

export const EVENT_LIVE_CONTROL_REQUIREMENTS = [
  { key: "crewAssigned", title: "Production crew assigned", icon: Users },
  {
    key: "ingestConfigured",
    title: "Streaming ingest configured",
    icon: Radio,
  },
  {
    key: "ticketPricingConfigured",
    title: "Ticket pricing configured",
    icon: Ticket,
  },
] as const;
