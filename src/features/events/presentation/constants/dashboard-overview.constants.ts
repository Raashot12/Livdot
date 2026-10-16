import {
  CalendarDays,
  CircleAlert,
  CheckCircle2,
  Radio,
  Ticket,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { EventStatus } from "../../domain/types/event-status";
import type { EventReadiness } from "../../domain/types/event-readiness";

export const DASHBOARD_PANEL_CLASS =
  "min-w-0 rounded-[13px] border border-[#e5ebf4] bg-white shadow-[0_3px_14px_rgba(18,44,78,.025)]";

export const DASHBOARD_STATUS_COLORS: Record<EventStatus, string> = {
  DRAFT: "#98a6bd",
  SCHEDULED: "#1d74ff",
  READY: "#00b879",
  LIVE: "#ef4444",
  COMPLETED: "#7c3aed",
  REPLAY_AVAILABLE: "#ca36b9",
};

export const DASHBOARD_METRICS = [
  {
    key: "totalCount",
    icon: CalendarDays,
    label: "Total Events",
    tone: "bg-[#edf4ff] text-[#0865ff]",
  },
  {
    key: "liveCount",
    icon: Radio,
    label: "Live Events",
    tone: "bg-[#fff0f1] text-[#ee3340]",
  },
  {
    key: "readyCount",
    icon: CheckCircle2,
    label: "Ready to Go Live",
    tone: "bg-[#eafaf2] text-[#06ae68]",
  },
  {
    key: "attentionCount",
    icon: CircleAlert,
    label: "Needs Attention",
    tone: "bg-[#fff6e8] text-[#d98600]",
  },
] as const;

export const READINESS_REQUIREMENT_ITEMS = [
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
] as const satisfies readonly {
  key: keyof EventReadiness;
  title: string;
  icon: LucideIcon;
}[];
