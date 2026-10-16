import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
} from "lucide-react";
import { toast } from "sonner";
import { useTransitionEvent } from "../../application/hooks/use-transition-event";
import { useUpdateEventReadiness } from "../../application/hooks/use-update-event-readiness";
import { evaluateReadiness } from "../../domain/policies/readiness.policy";
import type { EventEntity } from "../../domain/entities/event.entity";
import type { EventReadiness } from "../../domain/types/event-readiness";
import type { EventStatus } from "../../domain/types/event-status";
import {
  EVENT_READINESS_ITEMS,
  EVENT_READINESS_PANEL_CLASS,
  EVENT_READINESS_STAGES,
} from "../constants/event-readiness.constants";
import { getEventReadinessProgress } from "../lib/event-readiness.utils";

export function EventReadinessLifecycle({ status }: { status: EventStatus }) {
  const index = EVENT_READINESS_STAGES.findIndex(
    (item) => item.status === status,
  );
  return (
    <section className={EVENT_READINESS_PANEL_CLASS}>
      <h2 className="text-[15px] font-bold text-[#101b43]">Event lifecycle</h2>
      <p className="mt-1 text-[11px] text-[#687693]">
        Status reported by the event service.
      </p>
      <ol className="relative mt-5 grid grid-cols-3 gap-y-4 sm:grid-cols-6">
        <div
          className="absolute top-3 right-[8%] left-[8%] hidden h-0.5 bg-[#e0e7f1] sm:block"
          aria-hidden="true"
        />
        {EVENT_READINESS_STAGES.map((stage, step) => {
          const complete = index > step;
          const active = index === step;
          return (
            <li
              key={stage.status}
              aria-current={active ? "step" : undefined}
              className="relative flex flex-col items-center text-center"
            >
              <span
                className={`z-[1] grid size-6 place-items-center rounded-full border-2 ${complete ? "border-[#0bb87b] bg-[#0bb87b] text-white" : active ? "border-[#075bff] bg-white text-[#075bff] ring-4 ring-[#eaf2ff]" : "border-[#cbd6e5] bg-white text-transparent"}`}
              >
                {complete ? (
                  <CheckCircle2 size={15} aria-hidden="true" />
                ) : (
                  <i className="size-1.5 rounded-full bg-current" />
                )}
              </span>
              <span
                className={`mt-2 text-[10px] font-semibold ${active ? "text-[#075bff]" : "text-[#53627e]"}`}
              >
                {stage.label}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function EventReadinessCard({ event }: { event: EventEntity }) {
  const updateReadiness = useUpdateEventReadiness();
  const { complete, percentage: percent } = getEventReadinessProgress(event);
  const ready = evaluateReadiness(event.readiness).ready;

  async function setRequirement(key: keyof EventReadiness, value: boolean) {
    try {
      const readiness: Partial<EventReadiness> = { [key]: value };
      await updateReadiness.mutateAsync({ id: event.id, readiness });
      toast.success(
        value ? "Requirement marked complete" : "Requirement reopened",
      );
    } catch (cause) {
      toast.error("Readiness could not be updated", {
        description:
          cause instanceof Error
            ? cause.message
            : "Check the event and try again.",
      });
    }
  }
  return (
    <section className={EVENT_READINESS_PANEL_CLASS}>
      <div className="grid gap-5 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center">
        <div className="flex flex-col items-center">
          <h2 className="self-start text-[15px] font-bold text-[#101b43]">
            Overall readiness
          </h2>
          <div
            className="mt-3 grid size-36 place-items-center rounded-full"
            style={{
              background: `conic-gradient(#08bd83 ${percent}%, #e8edf5 ${percent}% 100%)`,
            }}
          >
            <div className="grid size-[112px] place-content-center rounded-full bg-white text-center">
              <strong className="text-[27px] leading-none font-bold text-[#101b43]">
                {percent}%
              </strong>
              <span className="mt-1 text-[10px] text-[#687693]">
                {complete} of {EVENT_READINESS_ITEMS.length} tracked
                requirements
              </span>
            </div>
          </div>
        </div>
        <div>
          <span
            className={`inline-flex items-center gap-2 text-[18px] font-bold ${ready ? "text-[#08a96d]" : "text-[#d93038]"}`}
          >
            {ready ? <CheckCircle2 size={19} /> : <CircleAlert size={19} />}
            {ready ? "Ready to go live" : "Not ready yet"}
          </span>
          <p className="mt-1 text-[11px] leading-relaxed text-[#687693]">
            {ready
              ? "All tracked requirements are complete."
              : `${EVENT_READINESS_ITEMS.length - complete} tracked requirement${EVENT_READINESS_ITEMS.length - complete === 1 ? " remains" : "s remain"} before this event can be marked Ready.`}
          </p>
          <ul className="mt-4 space-y-2">
            {EVENT_READINESS_ITEMS.map(({ key, title, icon: Icon, href }) => {
              const done = event.readiness[key];
              return (
                <li key={key}>
                  <div className="flex min-h-12 items-center gap-2 rounded-xl border border-[#edf1f6] px-2 py-2 sm:gap-3 sm:px-3">
                    <Link
                      href={`/dashboard/events/${event.id}/${href}`}
                      className="focus-ring flex min-w-0 flex-1 items-center gap-3 rounded-lg py-1 hover:bg-[#fbfdff]"
                    >
                      <span
                        className={`grid size-8 shrink-0 place-items-center rounded-lg ${done ? "bg-[#e7f9f1] text-[#08a973]" : "bg-[#fff3e0] text-[#dd8900]"}`}
                      >
                        {done ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <strong className="block truncate text-[11px] font-semibold text-[#172544]">
                          {title}
                        </strong>
                        <span
                          className={`mt-0.5 block text-[10px] ${done ? "text-[#07855e]" : "text-[#a96a00]"}`}
                        >
                          {done ? "Complete" : "Needs attention"}
                        </span>
                      </span>
                      <ChevronRight
                        size={15}
                        className="text-[#71809b]"
                        aria-hidden="true"
                      />
                    </Link>
                    <button
                      type="button"
                      aria-pressed={done}
                      aria-label={`${done ? "Reopen" : "Mark complete"}: ${title}`}
                      disabled={updateReadiness.isPending}
                      onClick={() => void setRequirement(key, !done)}
                      className={`focus-ring min-h-9 shrink-0 rounded-lg px-2 text-[9px] font-semibold transition sm:px-3 ${done ? "text-[#687693] hover:bg-[#f3f5f9]" : "bg-[#edf4ff] text-[#075bff] hover:bg-[#e2edff]"} disabled:cursor-wait disabled:opacity-60`}
                    >
                      {done ? "Reopen" : "Mark complete"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function EventReadinessTransitionCard({
  event,
}: {
  event: EventEntity;
}) {
  const transition = useTransitionEvent();
  const readiness = evaluateReadiness(event.readiness);
  const canMarkReady = event.status === "SCHEDULED" && readiness.ready;
  async function markReady() {
    try {
      await transition.mutateAsync({
        id: event.id,
        target: "READY",
        expectedVersion: event.version,
      });
      toast.success("Event marked ready");
    } catch (cause) {
      toast.error("Event could not be marked ready", {
        description:
          cause instanceof Error
            ? cause.message
            : "Review the requirements and try again.",
      });
    }
  }
  return (
    <section className={EVENT_READINESS_PANEL_CLASS}>
      <h2 className="text-[15px] font-bold text-[#101b43]">
        Transition requirements
      </h2>
      <p className="mt-1 text-[11px] text-[#687693]">
        All tracked requirements must be complete before an event can move to
        Ready.
      </p>
      <button
        type="button"
        disabled={!canMarkReady || transition.isPending}
        onClick={() => void markReady()}
        className="focus-ring mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#075bff] px-4 text-[11px] font-semibold text-white hover:bg-[#004fe0] disabled:cursor-not-allowed disabled:bg-[#dce2eb] disabled:text-[#94a1b8]"
      >
        {transition.isPending ? "Updating status…" : "Mark event ready"}{" "}
        <ArrowRight size={14} aria-hidden="true" />
      </button>
      {!readiness.ready && (
        <p className="mt-2 text-[10px] leading-relaxed text-[#9c3a3a]">
          Complete the requirements above to enable this action.
        </p>
      )}
    </section>
  );
}
