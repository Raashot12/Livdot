"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  useFieldArray,
  useForm,
  useWatch,
  type FieldErrors,
} from "react-hook-form";
import { toast } from "sonner";
import { useCreateEvent } from "../../application/hooks/use-create-event";
import {
  draftStorageKey,
  eventDraftSchema,
  fieldsByStep,
  initialValues,
  steps,
  type EventDraft,
} from "../constants/create-event.constants";
import { normalizeDraft } from "../lib/create-event-draft";
import {
  buildEventSeatMap,
  formatDate,
  getActiveTicketQuantity,
  getAudienceLabel,
  getCategoryLabel,
  getEventTypeLabel,
} from "../lib/create-event-form.utils";
import { getScheduleDateTimeAsDate } from "../lib/event-schedule.utils";

export function useCreateEventWizard() {
  const router = useRouter();
  const createEventMutation = useCreateEvent();
  const root = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(0);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [editingTicket, setEditingTicket] = useState<string | null>(null);
  const form = useForm<EventDraft>({
    defaultValues: initialValues,
    mode: "onTouched",
    resolver: zodResolver(eventDraftSchema),
  });
  const {
    control,
    formState: { errors, isSubmitting },
    getValues,
    handleSubmit,
    register,
    reset,
    setValue,
    trigger,
  } = form;
  const {
    fields: ticketFieldValues,
    append,
    remove,
  } = useFieldArray({ control, name: "ticketTypes" });
  const ticketFields = ticketFieldValues as Array<
    EventDraft["ticketTypes"][number] & { id: string }
  >;
  const {
    fields: seatMapSectionFields,
    append: appendSeatMapSection,
    remove: removeSeatMapSection,
  } = useFieldArray({ control, name: "seatMapSections" });
  const values = {
    ...initialValues,
    ...useWatch({ control, defaultValue: initialValues }),
  } as EventDraft;
  const description = values.description ?? "";
  const descriptionRegistration = register("description");
  const progress = (step / (steps.length - 1)) * 100;
  const seatMapPreview = useMemo(
    () =>
      buildEventSeatMap(
        values.seatMapSections ?? [],
        values.maxTicketsEnabled ? Number(values.maxTicketsPerUser) : undefined,
      ),
    [
      values.maxTicketsEnabled,
      values.maxTicketsPerUser,
      values.seatMapSections,
    ],
  );
  const seatMapSeatCount = seatMapPreview.blocks.reduce(
    (total, section) => total + section.seats.length,
    0,
  );
  const seatMapCapacity = Number(values.venueCapacity);
  const hasVenueCapacity =
    Number.isSafeInteger(seatMapCapacity) && seatMapCapacity > 0;
  const usesSeatMap = values.venueMode === "physical" && values.seatMapEnabled;

  useEffect(() => {
    let cancelled = false;
    try {
      const saved = window.localStorage.getItem(draftStorageKey);
      if (saved) {
        const restored = normalizeDraft(JSON.parse(saved));
        if (restored) {
          queueMicrotask(() => {
            if (cancelled) return;
            reset(restored.data);
            setBannerUrl(restored.bannerUrl);
          });
        }
      }
    } catch {
      toast.error("Saved draft could not be restored", {
        description: "Enter your details and save a new draft to try again.",
      });
    }
    return () => {
      cancelled = true;
    };
  }, [reset]);

  useEffect(() => {
    if (!bannerUrl?.startsWith("blob:")) return;
    return () => URL.revokeObjectURL(bannerUrl);
  }, [bannerUrl]);

  function persistDraft(data = getValues()) {
    try {
      window.localStorage.setItem(
        draftStorageKey,
        JSON.stringify({
          data: { ...data, streamingKey: "" },
          bannerUrl: bannerUrl?.startsWith("/brand/") ? bannerUrl : null,
          savedAt: new Date().toISOString(),
        }),
      );
      return true;
    } catch {
      toast.error("Draft could not be saved", {
        description: "Check your browser storage settings and try again.",
      });
      return false;
    }
  }

  function saveDraft() {
    if (persistDraft()) {
      toast.success("Draft saved on this device", {
        description: "You can return to these event details in this browser.",
      });
    }
  }

  async function goForward() {
    const valid = await trigger(fieldsByStep[step]);
    if (!valid) {
      toast.error("Check the highlighted fields", {
        description: "Fix the marked details before continuing.",
      });
      return;
    }
    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  function handleInvalidSubmit(errors: FieldErrors<EventDraft>) {
    const firstInvalidStep = fieldsByStep
      .slice(0, -1)
      .findIndex((fields) =>
        fields.some((field) => {
          const rootField = field.split(".")[0] as keyof EventDraft;
          return Boolean(errors[rootField]);
        }),
      );

    setStep(firstInvalidStep >= 0 ? firstInvalidStep : 0);
    toast.error("Check the highlighted fields", {
      description: "Review the marked details before publishing.",
    });
  }

  function goToStep(index: number) {
    if (index <= step) setStep(index);
  }

  function handleBannerChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file", {
        description: "Use a JPG, PNG, or WebP banner.",
      });
      event.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Banner is too large", {
        description: "Choose an image under 5 MB.",
      });
      event.target.value = "";
      return;
    }
    setBannerUrl(URL.createObjectURL(file));
  }

  function formatDescription(prefix: string, suffix = prefix) {
    const textarea = descriptionRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.slice(start, end);
    textarea.setRangeText(
      selected ? `${prefix}${selected}${suffix}` : `${prefix}${suffix}`,
      start,
      end,
      "select",
    );
    setValue("description", textarea.value, {
      shouldDirty: true,
      shouldValidate: true,
    });
    textarea.focus();
  }

  function insertListMarker(marker: string) {
    const textarea = descriptionRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const lineStart =
      textarea.value.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
    textarea.setRangeText(marker, lineStart, lineStart, "end");
    setValue("description", textarea.value, {
      shouldDirty: true,
      shouldValidate: true,
    });
    textarea.focus();
  }

  async function copyValue(value: string, label: string) {
    if (!value) {
      toast.error(`${label} is empty`, {
        description: "Add the value before copying it.",
      });
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Could not copy to clipboard", {
        description: "Select and copy the value manually.",
      });
    }
  }

  async function createEvent(data: EventDraft) {
    const scheduledDate = getScheduleDateTimeAsDate(
      data.date,
      data.startTime,
      data.timeZone,
    );
    if (!scheduledDate) {
      toast.error("Event start time is invalid", {
        description: "Choose a valid date and time for the selected time zone.",
      });
      return;
    }
    const scheduledAt = scheduledDate.toISOString();
    const createdStatus =
      data.publishTiming === "later" ? "DRAFT" : "SCHEDULED";
    const ingestConfigured =
      data.streamingEnabled &&
      Boolean(
        data.streamingKey &&
        (data.streamingProvider === "livdot"
          ? data.streamingServer
          : data.streamingUrl),
      );
    const seatMap =
      data.venueMode === "physical" && data.seatMapEnabled
        ? buildEventSeatMap(
            data.seatMapSections,
            data.maxTicketsEnabled ? Number(data.maxTicketsPerUser) : undefined,
          )
        : null;
    const ticketOptions = seatMap
      ? []
      : data.ticketTypes
          .filter((ticket) => ticket.active)
          .map((ticket, index) => ({
            id: `ticket-${index + 1}`,
            name: ticket.name.trim(),
            price: Number(ticket.price),
            currency: "NGN",
            quantityAvailable: Number(ticket.quantity),
            maxPerOrder: data.maxTicketsEnabled
              ? Number(data.maxTicketsPerUser)
              : undefined,
          }));
    const ticketPricingConfigured = seatMap
      ? seatMap.blocks.every(
          (section) => Number(section.price) > 0 && section.seats.length > 0,
        )
      : ticketOptions.some(
          (ticket) => ticket.price > 0 && (ticket.quantityAvailable ?? 0) > 0,
        );

    try {
      const event = await createEventMutation.mutateAsync({
        title: data.name,
        description: data.description,
        status: createdStatus,
        readiness: {
          crewAssigned: false,
          ingestConfigured,
          ticketPricingConfigured,
        },
        scheduledAt,
        seatMap,
        ticketOptions,
      });
      try {
        window.localStorage.removeItem(draftStorageKey);
      } catch {
        // Publishing remains successful if saved drafts are unavailable.
      }
      toast.success(
        createdStatus === "DRAFT" ? "Event draft created" : "Event published",
        {
          description: `${event.title} is now available in your events.`,
        },
      );
      router.push(`/dashboard/events/${event.id}/manage`);
    } catch (error) {
      toast.error("Event could not be created", {
        description:
          error instanceof Error
            ? error.message
            : "Check your connection and try again.",
      });
    }
  }

  const dateLabel = formatDate(values.date, values.timeZone);
  const endDateLabel = formatDate(values.endDate, values.timeZone);
  const dateRange =
    values.date === values.endDate
      ? dateLabel
      : `${dateLabel} – ${endDateLabel}`;
  const eventTypeLabel = getEventTypeLabel(values.eventType);
  const categoryLabel = getCategoryLabel(values.category);
  const accessLabel = getAudienceLabel(values.audienceAccess);
  const activeTicketCount = values.ticketTypes.filter(
    (ticket) => ticket.active,
  ).length;
  const activeTicketQuantity = getActiveTicketQuantity(values.ticketTypes);
  const startingPrice = values.ticketTypes
    .filter((ticket) => ticket.active)
    .map((ticket) => Number(ticket.price))
    .filter(Number.isFinite)
    .sort((a, b) => a - b)[0];
  const sectionStartingPrice = values.seatMapSections
    .filter((section) => section.name.trim())
    .map((section) => Number(section.price))
    .filter(Number.isFinite)
    .sort((a, b) => a - b)[0];
  const visibleStartingPrice = usesSeatMap
    ? sectionStartingPrice
    : startingPrice;

  return {
    root,
    descriptionRef,
    fileInputRef,
    step,
    setStep,
    bannerUrl,
    setBannerUrl,
    editingTicket,
    setEditingTicket,
    form,
    control,
    errors,
    isSubmitting,
    getValues,
    handleSubmit,
    handleInvalidSubmit,
    register,
    setValue,
    trigger,
    ticketFields,
    append,
    remove,
    seatMapSectionFields,
    appendSeatMapSection,
    removeSeatMapSection,
    values,
    description,
    descriptionRegistration,
    progress,
    seatMapPreview,
    seatMapSeatCount,
    seatMapCapacity,
    hasVenueCapacity,
    usesSeatMap,
    saveDraft,
    goForward,
    goToStep,
    handleBannerChange,
    formatDescription,
    insertListMarker,
    copyValue,
    createEvent,
    dateRange,
    eventTypeLabel,
    categoryLabel,
    accessLabel,
    activeTicketCount,
    activeTicketQuantity,
    visibleStartingPrice,
    isCreating: createEventMutation.isPending,
  };
}
