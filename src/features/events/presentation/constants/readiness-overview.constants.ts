import { Radio, Users, Video, type LucideIcon } from "lucide-react";
import type { EventEntity } from "../../domain/entities/event.entity";
import type { EventReadiness } from "../../domain/types/event-readiness";

export type ReadinessTab =
  "ALL" | "READY" | "ATTENTION" | "SCHEDULED" | "INCOMPLETE";
export type ReadinessState = Exclude<ReadinessTab, "ALL">;
export type DateFilter = "ALL" | "UPCOMING" | "PAST" | "UNSCHEDULED";
export type RequirementKey = keyof EventReadiness;

export const EMPTY_EVENTS: EventEntity[] = [];
export const MODULE_STARTED_AT = Date.now();
export const READINESS_PAGE_SIZE = 5;

export const panel =
  "rounded-[13px] border border-[#e5ebf4] bg-white shadow-[0_3px_14px_rgba(18,44,78,.025)]";

export const requirementItems: {
  key: RequirementKey;
  label: string;
  icon: LucideIcon;
  tone: string;
  bar: string;
}[] = [
  {
    key: "crewAssigned",
    label: "Production Crew Assigned",
    icon: Users,
    tone: "bg-[#e5fbf3] text-[#08a96d]",
    bar: "bg-[#08bd83]",
  },
  {
    key: "ingestConfigured",
    label: "Streaming Ingest Configured",
    icon: Radio,
    tone: "bg-[#eaf2ff] text-[#075bff]",
    bar: "bg-[#0876ff]",
  },
  {
    key: "ticketPricingConfigured",
    label: "Ticket Pricing Configured",
    icon: Video,
    tone: "bg-[#f2ebff] text-[#7829ea]",
    bar: "bg-[#8a39f5]",
  },
];

export const tabDefinitions: { id: ReadinessTab; label: string }[] = [
  { id: "ALL", label: "All Events" },
  { id: "READY", label: "Ready" },
  { id: "ATTENTION", label: "Needs Attention" },
  { id: "SCHEDULED", label: "Scheduled" },
  { id: "INCOMPLETE", label: "Incomplete" },
];
