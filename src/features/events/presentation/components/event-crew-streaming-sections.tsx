import Link from "next/link";
import {
  CheckCircle2,
  ChevronRight,
  type LucideIcon,
  Radio,
  Settings,
  Users,
  Headphones,
  FileText,
} from "lucide-react";
import type { EventEntity } from "../../domain/entities/event.entity";
import {
  EVENT_CREW_READINESS_ITEMS,
  EVENT_CREW_STREAMING_PANEL_CLASS,
  EVENT_CREW_STREAMING_TAB_CONTENT,
  type EventCrewStreamingTab,
} from "../constants/event-crew-streaming.constants";
import { EmptyState } from "@/shared/components/feedback/empty-state";

function EventCrewReadiness({ event }: { event: EventEntity }) {
  return (
    <section className={EVENT_CREW_STREAMING_PANEL_CLASS}>
      <h2 className="text-[15px] font-bold text-[#101b43]">
        Production readiness
      </h2>
      <p className="mt-1 text-[11px] text-[#687693]">
        Current requirements recorded for this event.
      </p>
      <ul className="mt-3 space-y-2">
        {EVENT_CREW_READINESS_ITEMS.map(({ key, title, icon: Icon, href }) => {
          const done = event.readiness[key];
          return (
            <li key={key}>
              <Link
                href={"/dashboard/events/" + event.id + "/" + href}
                className="focus-ring flex min-h-12 items-center gap-3 rounded-xl border border-[#edf1f6] px-3 py-2 hover:bg-[#fbfdff]"
              >
                <span
                  className={
                    "grid size-8 shrink-0 place-items-center rounded-lg " +
                    (done
                      ? "bg-[#e7f9f1] text-[#08a973]"
                      : "bg-[#fff3e0] text-[#dd8900]")
                  }
                >
                  {done ? <CheckCircle2 size={17} /> : <Icon size={17} />}
                </span>
                <strong className="min-w-0 flex-1 truncate text-[11px] font-semibold text-[#172544]">
                  {title}
                </strong>
                <span
                  className={
                    "text-[10px] font-medium " +
                    (done ? "text-[#07855e]" : "text-[#a96a00]")
                  }
                >
                  {done ? "Complete" : "Needs setup"}
                </span>
                <ChevronRight size={14} className="text-[#77859d]" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function EventCrewDataPanel({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <section className={EVENT_CREW_STREAMING_PANEL_CLASS}>
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#edf4ff] text-[#075bff]">
          <Icon size={17} aria-hidden="true" />
        </span>
        <h2 className="text-[14px] font-bold text-[#101b43]">{title}</h2>
      </div>
      <EmptyState
        size="compact"
        title="No connected records yet"
        description={description}
      />
    </section>
  );
}

export function EventCrewStreamingTabContent({
  tab,
  event,
}: {
  tab: EventCrewStreamingTab;
  event: EventEntity;
}) {
  if (tab === "overview") {
    return (
      <div className="grid min-w-0 items-start gap-3.5 xl:grid-cols-[minmax(0,1.15fr)_minmax(300px,.85fr)]">
        <div className="min-w-0 space-y-3.5">
          <EventCrewDataPanel
            icon={Users}
            title="Crew roster"
            description="Crew members, roles, contact details, and assignments will appear when crew data is connected."
          />
          <div className="grid min-w-0 gap-3.5 md:grid-cols-2">
            <EventCrewDataPanel
              icon={Settings}
              title="Equipment checklist"
              description="Production equipment and check results will appear when the checklist is available."
            />
            <EventCrewDataPanel
              icon={Headphones}
              title="Communications"
              description="Production channels and team messages will appear when communications are connected."
            />
          </div>
        </div>
        <div className="min-w-0 space-y-3.5">
          <EventCrewReadiness event={event} />
          <EventCrewDataPanel
            icon={Radio}
            title="Streaming setup"
            description="Ingest endpoints, stream keys, and connection health are not connected to this event yet."
          />
          <EventCrewDataPanel
            icon={FileText}
            title="Incident logs"
            description="Incident records will appear here when the production log is connected."
          />
        </div>
      </div>
    );
  }

  const content = EVENT_CREW_STREAMING_TAB_CONTENT[tab];
  return (
    <div className="grid min-w-0 items-start gap-3.5 xl:grid-cols-[minmax(0,1fr)_minmax(280px,.42fr)]">
      <EventCrewDataPanel
        icon={content.icon}
        title={content.title}
        description={content.description}
      />
      <EventCrewReadiness event={event} />
    </div>
  );
}
