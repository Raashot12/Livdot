import type { LucideIcon } from "lucide-react";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { EVENT_LIVE_BROADCAST_PANEL_CLASS } from "../constants/event-live-broadcast-control.constants";

export function EventLiveBroadcastDataPanel({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <section className={EVENT_LIVE_BROADCAST_PANEL_CLASS}>
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#edf4ff] text-[#075bff]">
          <Icon size={17} aria-hidden="true" />
        </span>
        <h2 className="text-[14px] font-bold text-[#101b43]">{title}</h2>
      </div>
      <EmptyState
        size="compact"
        icon={<Icon size={21} />}
        title="No connected data yet"
        description={description}
      />
    </section>
  );
}
