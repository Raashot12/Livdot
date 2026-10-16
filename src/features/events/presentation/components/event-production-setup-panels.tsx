"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  CheckCircle2,
  CircleAlert,
  LockKeyhole,
  Plus,
  Radio,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useUpdateEventReadiness } from "../../application/hooks/use-update-event-readiness";
import type { EventEntity } from "../../domain/entities/event.entity";
import {
  EVENT_CREW_STREAMING_PANEL_CLASS,
} from "../constants/event-crew-streaming.constants";

type CrewMember = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: string;
};

type EventProductionSetup = {
  readonly crewMembers: readonly CrewMember[];
  readonly streaming: { readonly server: string } | null;
};

const setupStorageKey = "liv-dot-event-production-setup-v1";
const emptySetup: EventProductionSetup = {
  crewMembers: [],
  streaming: null,
};

const crewRoles = [
  "Producer",
  "Stage manager",
  "Camera operator",
  "Audio engineer",
  "Stream operator",
  "Production assistant",
] as const;

const fieldClass =
  "h-10 w-full rounded-[9px] border border-[#dce5f2] bg-white px-3 text-[12px] font-medium text-[#14213e] outline-none transition placeholder:font-normal placeholder:text-[#8a97ad] focus:border-[#6da4ff] focus:ring-2 focus:ring-[#075bff]/10";

function isCrewMember(value: unknown): value is CrewMember {
  if (!value || typeof value !== "object") return false;
  const member = value as Record<string, unknown>;
  return (
    typeof member.id === "string" &&
    typeof member.name === "string" &&
    typeof member.email === "string" &&
    typeof member.role === "string"
  );
}

function readSetup(eventId: string): EventProductionSetup {
  try {
    const stored: unknown = JSON.parse(
      window.localStorage.getItem(setupStorageKey) ?? "{}",
    );
    if (!stored || typeof stored !== "object" || Array.isArray(stored))
      return emptySetup;

    const record = (stored as Record<string, unknown>)[eventId];
    if (!record || typeof record !== "object" || Array.isArray(record))
      return emptySetup;

    const value = record as Record<string, unknown>;
    const streaming = value.streaming;
    const server =
      streaming && typeof streaming === "object" && !Array.isArray(streaming)
        ? (streaming as Record<string, unknown>).server
        : null;
    return {
      crewMembers: Array.isArray(value.crewMembers)
        ? value.crewMembers.filter(isCrewMember)
        : [],
      streaming: typeof server === "string" ? { server } : null,
    };
  } catch {
    return emptySetup;
  }
}

function writeSetup(eventId: string, setup: EventProductionSetup) {
  let stored: unknown = {};
  try {
    stored = JSON.parse(window.localStorage.getItem(setupStorageKey) ?? "{}");
  } catch {
    stored = {};
  }
  const records =
    stored && typeof stored === "object" && !Array.isArray(stored)
      ? (stored as Record<string, unknown>)
      : {};
  window.localStorage.setItem(
    setupStorageKey,
    JSON.stringify({ ...records, [eventId]: setup }),
  );
}

function useEventProductionSetup(eventId: string) {
  const [setup, setSetup] = useState<EventProductionSetup>(emptySetup);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    setSetup(readSetup(eventId));
    setIsLoaded(true);
  }, [eventId]);

  function save(next: EventProductionSetup) {
    try {
      writeSetup(eventId, next);
      setSetup(next);
      return true;
    } catch {
      toast.error("Setup could not be saved", {
        description: "Check this browser's storage settings and try again.",
      });
      return false;
    }
  }

  return { setup, isLoaded, save };
}

function errorDescription(cause: unknown) {
  return cause instanceof Error
    ? cause.message
    : "Check the event and try again.";
}

function SetupStatus({ complete, label }: { complete: boolean; label: string }) {
  const Icon = complete ? CheckCircle2 : CircleAlert;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${complete ? "bg-[#e7f9f1] text-[#07855e]" : "bg-[#fff3e0] text-[#a96a00]"}`}
    >
      <Icon size={13} aria-hidden="true" /> {label}
    </span>
  );
}

export function EventCrewManagementPanel({
  event,
}: {
  readonly event: EventEntity;
}) {
  const { setup, isLoaded, save } = useEventProductionSetup(event.id);
  const updateReadiness = useUpdateEventReadiness();

  async function addCrewMember(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const form = formEvent.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const role = String(formData.get("role") ?? "");
    if (!name || !email || !role) return;

    const next: EventProductionSetup = {
      ...setup,
      crewMembers: [
        ...setup.crewMembers,
        { id: crypto.randomUUID(), name, email, role },
      ],
    };
    if (!save(next)) return;
    form.reset();

    try {
      await updateReadiness.mutateAsync({
        id: event.id,
        readiness: { crewAssigned: true },
      });
      toast.success("Production crew assigned");
    } catch (cause) {
      toast.error("Crew member saved, but readiness could not be updated", {
        description: errorDescription(cause),
      });
    }
  }

  async function removeCrewMember(memberId: string) {
    const nextMembers = setup.crewMembers.filter(
      (member) => member.id !== memberId,
    );
    const nextSetup = { ...setup, crewMembers: nextMembers };
    if (!save(nextSetup)) return;
    if (nextMembers.length === 0 && event.readiness.crewAssigned) {
      try {
        await updateReadiness.mutateAsync({
          id: event.id,
          readiness: { crewAssigned: false },
        });
      } catch (cause) {
        save(setup);
        toast.error("Crew assignment could not be updated", {
          description: errorDescription(cause),
        });
        return;
      }
    }
  }

  async function syncCrewReadiness() {
    try {
      await updateReadiness.mutateAsync({
        id: event.id,
        readiness: { crewAssigned: true },
      });
      toast.success("Crew readiness updated");
    } catch (cause) {
      toast.error("Crew readiness could not be updated", {
        description: errorDescription(cause),
      });
    }
  }

  const hasAssignedCrew = event.readiness.crewAssigned;

  return (
    <section className={EVENT_CREW_STREAMING_PANEL_CLASS}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-[#edf4ff] text-[#075bff]">
              <Users size={17} aria-hidden="true" />
            </span>
            <h2 className="text-[14px] font-bold text-[#101b43]">
              Production crew
            </h2>
          </div>
          <p className="mt-2 text-[11px] text-[#687693]">
            Add at least one person responsible for producing this event.
          </p>
        </div>
        <SetupStatus
          complete={hasAssignedCrew}
          label={hasAssignedCrew ? "Requirement complete" : "Needs assignment"}
        />
      </div>

      <form
        onSubmit={(formEvent) => void addCrewMember(formEvent)}
        className="mt-4 grid gap-3 rounded-xl border border-[#e8edf5] bg-[#fbfcff] p-3 sm:grid-cols-2"
      >
        <label className="text-[10px] font-semibold text-[#253653]">
          Crew member name
          <input
            className={`${fieldClass} mt-1.5`}
            name="name"
            required
            maxLength={100}
            placeholder="e.g. Ada Okafor"
          />
        </label>
        <label className="text-[10px] font-semibold text-[#253653]">
          Contact email
          <input
            className={`${fieldClass} mt-1.5`}
            name="email"
            type="email"
            required
            maxLength={180}
            placeholder="name@example.com"
          />
        </label>
        <label className="text-[10px] font-semibold text-[#253653] sm:col-span-2">
          Production role
          <select
            className={`${fieldClass} mt-1.5`}
            name="role"
            required
            defaultValue=""
          >
            <option value="" disabled>
              Choose a role
            </option>
            {crewRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          disabled={updateReadiness.isPending || !isLoaded}
          className="focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#075bff] px-4 text-[11px] font-semibold text-white transition hover:bg-[#004fe0] disabled:cursor-wait disabled:opacity-60 sm:col-span-2 sm:justify-self-end"
        >
          <Plus size={14} aria-hidden="true" /> Add crew member
        </button>
      </form>

      <div className="mt-4">
        <h3 className="text-[11px] font-bold text-[#253653]">
          Assigned people
        </h3>
        {!isLoaded ? (
          <p className="mt-2 text-[11px] text-[#687693]">Loading crew list…</p>
        ) : setup.crewMembers.length ? (
          <ul className="mt-2 space-y-2">
            {setup.crewMembers.map((member) => (
              <li
                key={member.id}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-[#edf1f6] px-3 py-2.5"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#edf4ff] text-[10px] font-bold text-[#075bff]">
                  {member.name
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((part) => part[0]?.toUpperCase())
                    .join("")}
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-[11px] text-[#172544]">
                    {member.name}
                  </strong>
                  <span className="block truncate text-[10px] text-[#687693]">
                    {member.role} · {member.email}
                  </span>
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${member.name} from the crew`}
                  disabled={updateReadiness.isPending}
                  onClick={() => void removeCrewMember(member.id)}
                  className="focus-ring grid size-8 shrink-0 place-items-center rounded-lg text-[#75829a] hover:bg-[#fff1f1] hover:text-[#c43f48] disabled:opacity-50"
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 rounded-lg border border-dashed border-[#dce5f2] px-3 py-4 text-center text-[11px] text-[#687693]">
            No crew members assigned yet.
          </p>
        )}
      </div>

      {setup.crewMembers.length > 0 && !hasAssignedCrew && (
        <button
          type="button"
          disabled={updateReadiness.isPending}
          onClick={() => void syncCrewReadiness()}
          className="focus-ring mt-3 min-h-9 rounded-lg bg-[#edf4ff] px-3 text-[10px] font-semibold text-[#075bff] disabled:opacity-50"
        >
          Sync crew readiness
        </button>
      )}
      <p className="mt-3 text-[10px] leading-relaxed text-[#77849a]">
        Crew names and contact details are saved in this browser's local
        preview.
      </p>
    </section>
  );
}

export function EventStreamingSetupPanel({
  event,
}: {
  readonly event: EventEntity;
}) {
  const { setup, isLoaded, save } = useEventProductionSetup(event.id);
  const updateReadiness = useUpdateEventReadiness();
  const [server, setServer] = useState("");
  const [streamKey, setStreamKey] = useState("");
  const isConfigured = event.readiness.ingestConfigured;

  useEffect(() => {
    if (isLoaded) setServer(setup.streaming?.server ?? "");
  }, [isLoaded, setup.streaming?.server]);

  async function configureStreaming(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const serverUrl = server.trim();
    if (!/^rtmps?:\/\//i.test(serverUrl)) {
      toast.error("Enter a valid RTMP ingest server", {
        description: "The address must start with rtmp:// or rtmps://.",
      });
      return;
    }
    if (!streamKey.trim()) {
      toast.error("Enter a stream key to confirm the ingest setup");
      return;
    }

    const next: EventProductionSetup = {
      ...setup,
      streaming: { server: serverUrl },
    };
    if (!save(next)) return;
    setStreamKey("");

    try {
      await updateReadiness.mutateAsync({
        id: event.id,
        readiness: { ingestConfigured: true },
      });
      toast.success("Streaming ingest configured", {
        description: "The key was provided and discarded from this form.",
      });
    } catch (cause) {
      toast.error("Setup saved, but streaming readiness could not be updated", {
        description: errorDescription(cause),
      });
    }
  }

  async function clearStreamingSetup() {
    const nextSetup = { ...setup, streaming: null };
    if (!save(nextSetup)) return;
    try {
      await updateReadiness.mutateAsync({
        id: event.id,
        readiness: { ingestConfigured: false },
      });
      setServer("");
      setStreamKey("");
      toast.success("Streaming setup cleared");
    } catch (cause) {
      save(setup);
      toast.error("Streaming setup could not be cleared", {
        description: errorDescription(cause),
      });
    }
  }

  async function syncStreamingReadiness() {
    try {
      await updateReadiness.mutateAsync({
        id: event.id,
        readiness: { ingestConfigured: true },
      });
      toast.success("Streaming readiness updated");
    } catch (cause) {
      toast.error("Streaming readiness could not be updated", {
        description: errorDescription(cause),
      });
    }
  }

  return (
    <section className={EVENT_CREW_STREAMING_PANEL_CLASS}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-[#edf4ff] text-[#075bff]">
              <Radio size={17} aria-hidden="true" />
            </span>
            <h2 className="text-[14px] font-bold text-[#101b43]">
              Streaming ingest
            </h2>
          </div>
          <p className="mt-2 text-[11px] text-[#687693]">
            Enter the RTMP server and stream key used by your encoder.
          </p>
        </div>
        <SetupStatus
          complete={isConfigured}
          label={isConfigured ? "Requirement complete" : "Needs setup"}
        />
      </div>

      {isLoaded && setup.streaming && (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-[#dcefe7] bg-[#f5fcf8] px-3 py-2.5">
          <CheckCircle2 size={15} className="text-[#07855e]" aria-hidden="true" />
          <span className="min-w-0 flex-1 text-[10px] text-[#365c4d]">
            Saved ingest server: <strong>{setup.streaming.server}</strong>
          </span>
          <span className="text-[9px] font-semibold text-[#07855e]">
            Stream key provided
          </span>
        </div>
      )}

      <form
        onSubmit={(formEvent) => void configureStreaming(formEvent)}
        className="mt-4 space-y-3 rounded-xl border border-[#e8edf5] bg-[#fbfcff] p-3"
      >
        <label className="block text-[10px] font-semibold text-[#253653]">
          RTMP ingest server
          <input
            className={`${fieldClass} mt-1.5`}
            name="server"
            required
            value={server}
            onChange={(changeEvent) => setServer(changeEvent.target.value)}
            placeholder="rtmp://ingest.example.com/live"
            autoComplete="url"
          />
        </label>
        <label className="block text-[10px] font-semibold text-[#253653]">
          Stream key
          <input
            className={`${fieldClass} mt-1.5`}
            name="streamKey"
            type="password"
            required
            value={streamKey}
            onChange={(changeEvent) => setStreamKey(changeEvent.target.value)}
            autoComplete="new-password"
            placeholder="Paste the key from your streaming provider"
          />
        </label>
        <button
          type="submit"
          disabled={updateReadiness.isPending || !isLoaded}
          className="focus-ring inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#075bff] px-4 text-[11px] font-semibold text-white transition hover:bg-[#004fe0] disabled:cursor-wait disabled:opacity-60"
        >
          <Radio size={14} aria-hidden="true" />
          {isConfigured ? "Update ingest setup" : "Save streaming setup"}
        </button>
      </form>

      {isConfigured && (
        <button
          type="button"
          disabled={updateReadiness.isPending}
          onClick={() => void clearStreamingSetup()}
          className="focus-ring mt-3 min-h-9 rounded-lg px-3 text-[10px] font-semibold text-[#697893] hover:bg-[#f3f5f9] disabled:opacity-50"
        >
          Clear streaming setup
        </button>
      )}
      {setup.streaming && !isConfigured && (
        <button
          type="button"
          disabled={updateReadiness.isPending}
          onClick={() => void syncStreamingReadiness()}
          className="focus-ring mt-3 min-h-9 rounded-lg bg-[#edf4ff] px-3 text-[10px] font-semibold text-[#075bff] disabled:opacity-50"
        >
          Sync streaming readiness
        </button>
      )}

      <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-relaxed text-[#77849a]">
        <LockKeyhole
          size={12}
          className="mt-0.5 shrink-0"
          aria-hidden="true"
        />
        This local preview saves the server address and readiness state. The
        stream key is never stored in browser storage, and no live connection
        test is performed.
      </p>
    </section>
  );
}
