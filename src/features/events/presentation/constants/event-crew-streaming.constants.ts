import {
  FileText,
  Headphones,
  Radio,
  Settings,
  Ticket,
  Users,
} from "lucide-react";
import type { EventReadiness } from "../../domain/types/event-readiness";

export const EVENT_CREW_STREAMING_TABS = [
  { id: "overview", label: "Overview" },
  { id: "crew", label: "Crew Management" },
  { id: "streaming", label: "Streaming Setup" },
  { id: "equipment", label: "Equipment" },
  { id: "communications", label: "Communications" },
  { id: "incidents", label: "Incident Logs" },
] as const;

export type EventCrewStreamingTab =
  (typeof EVENT_CREW_STREAMING_TABS)[number]["id"];

export const EVENT_CREW_STREAMING_PANEL_CLASS =
  "min-w-0 rounded-[14px] border border-[#e5ebf4] bg-white p-4 shadow-[0_3px_14px_rgba(18,44,78,.025)] sm:p-5";

export const EVENT_CREW_STREAMING_TAB_CONTENT = {
  crew: {
    icon: Users,
    title: "Crew roster",
    description:
      "Crew members, production roles, contact details, and invitations will appear when crew data is connected.",
  },
  streaming: {
    icon: Radio,
    title: "Streaming setup",
    description:
      "Ingest endpoints and stream keys will appear when streaming configuration is connected.",
  },
  equipment: {
    icon: Settings,
    title: "Equipment checklist",
    description:
      "Equipment, assigned operators, and readiness checks will appear when checklist data is connected.",
  },
  communications: {
    icon: Headphones,
    title: "Production communications",
    description:
      "Crew channels and communication history will appear when messaging is connected.",
  },
  incidents: {
    icon: FileText,
    title: "Incident logs",
    description:
      "Production incidents and response history will appear when incident tracking is connected.",
  },
} satisfies Record<
  Exclude<EventCrewStreamingTab, "overview">,
  {
    readonly icon: typeof Users;
    readonly title: string;
    readonly description: string;
  }
>;

export const EVENT_CREW_READINESS_ITEMS: {
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
