import Link from "next/link";
import { ArrowRight, CircleAlert } from "lucide-react";
import type { EventEntity } from "../../../domain/entities/event.entity";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import {
  DASHBOARD_PANEL_CLASS,
  READINESS_REQUIREMENT_ITEMS,
} from "../../constants/dashboard-overview.constants";
import {
  getEventsBlockedByReadiness,
  getRequirementCompletionCount,
} from "../../lib/dashboard-overview.utils";
import { CardHeading } from "./dashboard-overview-cards";

export function EventReadiness({ events }: { events: readonly EventEntity[] }) {
  const blocked = getEventsBlockedByReadiness(events);

  return (
    <section className={`${DASHBOARD_PANEL_CLASS} p-4`}>
      <CardHeading title="Event Readiness" href="/dashboard/readiness" />
      {events.length ? (
        <>
          <ul className="mt-2 space-y-1.5">
            {READINESS_REQUIREMENT_ITEMS.map(({ key, title, icon: Icon }) => {
              const complete = getRequirementCompletionCount(events, key);
              return (
                <li
                  key={key}
                  className="flex items-center gap-3 rounded-[9px] border border-[#edf1f6] px-3 py-2.5"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#eef4ff] text-[#075bff]">
                    <Icon size={16} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-[10px] font-semibold text-[#101b43]">
                      {title}
                    </strong>
                    <span className="mt-0.5 block text-[10px] text-[#697895]">
                      {complete} of {events.length} events complete
                    </span>
                  </span>
                  <span className="text-[10px] font-semibold text-[#53627e] tabular-nums">
                    {Math.round((complete / events.length) * 100)}%
                  </span>
                </li>
              );
            })}
          </ul>
          {blocked.length > 0 && (
            <Link
              href="/dashboard/readiness"
              className="focus-ring mt-2 flex items-start gap-2.5 rounded-[9px] bg-[#fff0f0] p-3 text-[#c82c34]"
            >
              <CircleAlert
                size={18}
                className="mt-0.5 shrink-0"
                aria-hidden="true"
              />
              <span>
                <strong className="block text-[11px]">
                  {blocked.length} event{blocked.length === 1 ? " is" : "s are"}{" "}
                  not ready
                </strong>
                <span className="mt-0.5 block text-[10px] leading-relaxed">
                  Review outstanding requirements.
                </span>
              </span>
              <ArrowRight
                size={14}
                className="mt-1 ml-auto shrink-0"
                aria-hidden="true"
              />
            </Link>
          )}
        </>
      ) : (
        <EmptyState
          size="compact"
          title="No readiness checks yet"
          description="Readiness summaries will appear as events are created."
        />
      )}
    </section>
  );
}
