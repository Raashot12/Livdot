import { Activity } from "lucide-react";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { DASHBOARD_PANEL_CLASS } from "../../constants/dashboard-overview.constants";
import { CardHeading } from "./dashboard-overview-cards";

export function UnsupportedAnalytics() {
  return (
    <section className={`${DASHBOARD_PANEL_CLASS} p-4 sm:p-[17px]`}>
      <CardHeading title="Audience & Revenue" />
      <EmptyState
        size="compact"
        icon={<Activity size={21} strokeWidth={1.8} />}
        title="Analytics will appear here"
        description="Audience and revenue data will show when ticket sales and streaming analytics are connected."
      />
    </section>
  );
}
