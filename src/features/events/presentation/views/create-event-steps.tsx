"use client";

import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  ArrowLeft,
  ArrowRight,
  Bold,
  Building2,
  CalendarDays,
  CalendarPlus,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  FileText,
  Globe2,
  ImagePlus,
  Info,
  Italic,
  Link2,
  List,
  ListOrdered,
  LockKeyhole,
  MapPin,
  Music2,
  Pencil,
  Plus,
  Radio,
  ShieldCheck,
  Ticket,
  Trash2,
  Underline,
  Upload,
  Users,
  Video,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { SeatMap3DPreview } from "../components/seat-map-3d-preview";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import {
  bannerAlt,
  cardClass,
  fieldClass,
  fieldLabelClass,
  sectionColorOptions,
  stepDescriptions,
  steps,
} from "../constants/create-event.constants";
import {
  formatCurrency,
  formatDate,
  formatTime,
  getTimeZoneShort,
} from "../lib/create-event-form.utils";
import {
  getLocalDateTimeMinimum,
  getStartDateMinimum,
  getStartTimeMinimum,
} from "../lib/event-schedule.utils";
import { useCreateEventWizard } from "../hooks/use-create-event-wizard";
import {
  ErrorText,
  Field,
  PanelHeading,
  ProviderOption,
  RadioOption,
  RequiredMark,
  SelectField,
  StepProgress,
  SummaryDetail,
  SwitchControl,
  SwitchRow,
  ToolbarButton,
  ToolbarDivider,
  VenueTab,
} from "../components/create-event-form-controls";

gsap.registerPlugin(useGSAP);

export function CreateEventWizard() {
  const {
    root,
    descriptionRef,
    fileInputRef,
    step,
    setStep,
    bannerUrl,
    setBannerUrl,
    editingTicket,
    setEditingTicket,
    errors,
    isSubmitting,
    handleSubmit,
    register,
    setValue,
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
    isCreating,
    handleInvalidSubmit,
  } = useCreateEventWizard();
  const startDateMinimum = getStartDateMinimum(values.timeZone);
  const startTimeMinimum = getStartTimeMinimum(values.date, values.timeZone);
  const publishDateMinimum = getLocalDateTimeMinimum();
  useGSAP(
    () => {
      const panel =
        root.current?.querySelector<HTMLElement>("[data-wizard-step]");
      if (!panel) return;
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(panel, { y: 5, duration: 0.32, ease: "power2.out" });
      });
      return () => media.revert();
    },
    { scope: root, dependencies: [step], revertOnUpdate: true },
  );

  return (
    <div
      ref={root}
      className="mx-auto -mt-[5px] w-full max-w-[1540px] pb-24 2xl:-ml-px 2xl:w-[calc(100%_+_8px)] 2xl:max-w-[1548px]"
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 pl-[3px]">
          <nav
            aria-label="Breadcrumb"
            className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-[#657591] sm:text-[12px]"
          >
            <Link
              href="/dashboard/events"
              className="focus-ring rounded-sm hover:text-[#075bff]"
            >
              Events
            </Link>
            <ChevronRight size={14} aria-hidden="true" />
            <span className="text-[#344563]" aria-current="page">
              Create Event
            </span>
          </nav>
          <h1
            id="create-event-heading"
            className="text-[27px] leading-tight font-bold tracking-[-.035em] text-[#0b1538] sm:text-[31px] sm:leading-[1.1]"
          >
            Create Event
          </h1>
          <p className="mt-0 max-w-[760px] text-[12px] leading-[1.55] text-[#586987] sm:text-[13px]">
            {stepDescriptions[step]}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3 sm:pt-[25px]">
          <button
            type="button"
            onClick={saveDraft}
            className="focus-ring inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#e0e8f4] bg-white px-3.5 text-[12px] font-semibold text-[#123269] shadow-[0_2px_6px_rgba(20,48,87,.035)] transition hover:border-[#b9cff1] hover:bg-[#f9fbff] sm:h-[46px] sm:min-w-[164px] sm:justify-center sm:px-4"
          >
            <FileText size={16} aria-hidden="true" /> Save Draft
          </button>
          <Link
            href="/dashboard/events"
            aria-label="Close event creation"
            className="focus-ring grid size-10 place-items-center rounded-[10px] border border-[#e0e8f4] bg-white text-[#52627f] transition hover:bg-[#f6f9fe] hover:text-[#0b1538] sm:size-11"
          >
            <X size={17} aria-hidden="true" />
          </Link>
        </div>
      </div>

      <StepProgress
        currentStep={step}
        progress={progress}
        onSelect={goToStep}
      />

      <form
        aria-labelledby="create-event-heading"
        noValidate
        id="create-event-form"
        onSubmit={handleSubmit(createEvent, handleInvalidSubmit)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && event.target instanceof HTMLInputElement)
            event.preventDefault();
        }}
        className="min-w-0"
      >
        <div data-wizard-step key={step}>
          {step === 0 && (
            <section className={cardClass}>
              <PanelHeading
                icon={
                  <span className="grid size-6 place-items-center rounded-[6px] bg-[#075bff] text-[15px] font-bold text-white">
                    1
                  </span>
                }
                title="Basic Information"
                description="Tell us about your event. This information will be displayed to attendees."
              />
              <div className="mt-5 grid gap-x-5 gap-y-4 md:grid-cols-2">
                <Field
                  id="event-name"
                  label="Event Name"
                  required
                  registration={register("name")}
                  error={errors.name?.message}
                  maxLength={100}
                />
                <SelectField
                  id="event-type"
                  label="Event Type"
                  required
                  registration={register("eventType")}
                  icon={<Users size={15} />}
                >
                  <option value="hybrid">Hybrid (In-Person + Online)</option>
                  <option value="in-person">In-Person</option>
                  <option value="online">Online</option>
                </SelectField>
                <SelectField
                  id="event-category"
                  label="Category"
                  required
                  registration={register("category")}
                  icon={<Music2 size={15} />}
                >
                  <option value="music-culture-conference">
                    Music · Culture · Conference
                  </option>
                  <option value="music">Music</option>
                  <option value="arts-culture">Arts & Culture</option>
                  <option value="business">Business</option>
                  <option value="technology">Technology</option>
                </SelectField>
                <SelectField
                  id="audience-access"
                  label="Audience Access"
                  required
                  registration={register("audienceAccess")}
                  icon={<Globe2 size={15} />}
                  hint="Anyone can discover and purchase tickets."
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="invite">Invite only</option>
                </SelectField>
              </div>

              <div className="mt-5 grid gap-5 border-t border-[#edf1f6] pt-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,.9fr)]">
                <div className="min-w-0">
                  <label
                    htmlFor="event-description"
                    className={fieldLabelClass}
                  >
                    Event Description <RequiredMark />
                  </label>
                  <div
                    className={`overflow-hidden rounded-[9px] border bg-white transition focus-within:border-[#6da4ff] focus-within:ring-2 focus-within:ring-[#075bff]/10 ${errors.description ? "border-[#e65260]" : "border-[#dce5f2]"}`}
                  >
                    <div
                      role="toolbar"
                      aria-label="Description formatting"
                      className="flex h-10 items-center gap-1 border-b border-[#e8edf5] px-2 text-[#52627f]"
                    >
                      <select
                        aria-label="Paragraph style"
                        defaultValue="paragraph"
                        onChange={(event) => {
                          if (event.target.value === "heading")
                            insertListMarker("## ");
                          event.target.value = "paragraph";
                        }}
                        className="h-8 max-w-[104px] rounded-md bg-transparent px-1.5 text-[10px] outline-none focus:bg-[#f5f8fd]"
                      >
                        <option value="paragraph">Paragraph</option>
                        <option value="heading">Heading</option>
                      </select>
                      <ToolbarDivider />
                      <ToolbarButton
                        label="Bold"
                        onClick={() => formatDescription("**")}
                      >
                        <Bold size={15} />
                      </ToolbarButton>
                      <ToolbarButton
                        label="Italic"
                        onClick={() => formatDescription("*")}
                      >
                        <Italic size={15} />
                      </ToolbarButton>
                      <ToolbarButton
                        label="Underline"
                        onClick={() => formatDescription("__")}
                      >
                        <Underline size={15} />
                      </ToolbarButton>
                      <ToolbarDivider />
                      <ToolbarButton
                        label="Bulleted list"
                        onClick={() => insertListMarker("• ")}
                      >
                        <List size={16} />
                      </ToolbarButton>
                      <ToolbarButton
                        label="Numbered list"
                        onClick={() => insertListMarker("1. ")}
                      >
                        <ListOrdered size={16} />
                      </ToolbarButton>
                      <ToolbarDivider />
                      <ToolbarButton
                        label="Link"
                        onClick={() => formatDescription("[", "](https://)")}
                      >
                        <Link2 size={15} />
                      </ToolbarButton>
                    </div>
                    <textarea
                      id="event-description"
                      {...descriptionRegistration}
                      ref={(element) => {
                        descriptionRegistration.ref(element);
                        descriptionRef.current = element;
                      }}
                      aria-invalid={Boolean(errors.description)}
                      maxLength={2000}
                      className="min-h-[145px] w-full resize-y bg-white px-3.5 py-3 pb-7 text-[11px] leading-[1.65] text-[#4d5f80] outline-none placeholder:text-[#8794aa] sm:text-[12px]"
                    />
                    <span className="sr-only">
                      Write a description for attendees, up to 2,000 characters.
                    </span>
                    <span className="-mt-6 mr-3.5 mb-2.5 block text-right text-[10px] text-[#6d7d98] tabular-nums">
                      {description.length}/2,000
                    </span>
                  </div>
                  {errors.description?.message && (
                    <ErrorText>{errors.description.message}</ErrorText>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <p className={`${fieldLabelClass} mb-0`}>
                      Event Cover Banner <RequiredMark />
                    </p>
                    <Info
                      size={14}
                      className="text-[#61728f]"
                      aria-label="Use a landscape image at 1920 by 1080 pixels."
                    />
                  </div>
                  <div className="relative h-[150px] overflow-hidden rounded-[9px] bg-[#071a38] sm:h-[178px]">
                    {bannerUrl ? (
                      <Image
                        src={bannerUrl}
                        alt={bannerAlt}
                        fill
                        sizes="(max-width: 1279px) 100vw, 34vw"
                        unoptimized={bannerUrl.startsWith("blob:")}
                        className="object-cover object-[9%_45%]"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-[#c6d6ed]">
                        <ImagePlus size={25} aria-hidden="true" />
                      </div>
                    )}
                    {bannerUrl && (
                      <button
                        type="button"
                        onClick={() => setBannerUrl(null)}
                        aria-label="Remove event banner"
                        className="focus-ring absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-[#071a38]/75 text-white transition hover:bg-[#071a38]"
                      >
                        <X size={14} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    aria-label="Upload event cover banner"
                    onChange={handleBannerChange}
                    className="sr-only"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="focus-ring mt-2.5 flex min-h-[59px] w-full items-center gap-3 rounded-[9px] border border-dashed border-[#cfdcf0] bg-[#fbfcff] px-3.5 text-left transition hover:border-[#8eb7f4] hover:bg-[#f5f9ff]"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-[9px] bg-[#eaf2ff] text-[#075bff]">
                      <Upload size={17} aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[11px] font-medium text-[#223454]">
                        Upload new banner
                      </span>
                      <span className="mt-0.5 block text-[9px] leading-[1.35] text-[#6c7c98]">
                        Recommended size: 1920 × 1080 (16:9)
                        <br />
                        JPG, PNG or WebP · Max 5 MB
                      </span>
                    </span>
                  </button>
                </div>
              </div>
            </section>
          )}

          {step === 1 && (
            <section className={cardClass}>
              <PanelHeading
                icon={<CalendarDays size={17} />}
                title="Date, Time & Time Zone"
                description="Choose when your event will take place. You can set a start and end time, and select the correct timezone."
              />
              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Field
                  id="event-start-date"
                  label="Start Date"
                  required
                  type="date"
                  min={startDateMinimum}
                  registration={register("date")}
                  error={errors.date?.message}
                />
                <Field
                  id="event-start-time"
                  label="Start Time"
                  required
                  type="time"
                  min={startTimeMinimum}
                  registration={register("startTime")}
                  error={errors.startTime?.message}
                />
                <Field
                  id="event-end-date"
                  label="End Date"
                  required
                  type="date"
                  min={values.date || startDateMinimum}
                  registration={register("endDate")}
                  error={errors.endDate?.message}
                />
                <Field
                  id="event-end-time"
                  label="End Time"
                  required
                  type="time"
                  registration={register("endTime")}
                  error={errors.endTime?.message}
                />
              </div>
              <div className="mt-4 max-w-[480px]">
                <SelectField
                  id="event-time-zone"
                  label="Time Zone"
                  required
                  registration={register("timeZone")}
                  icon={<Globe2 size={15} />}
                  hint="Your event time will display in this timezone."
                >
                  <option value="Africa/Lagos">
                    West Africa Time (WAT) – Lagos (GMT+1)
                  </option>
                  <option value="Europe/London">
                    Greenwich Mean Time (GMT)
                  </option>
                  <option value="Europe/Paris">
                    Central European Time (CET)
                  </option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                </SelectField>
              </div>
              <SwitchRow
                id="add-to-calendar"
                title="Add to Calendar"
                description="Allow attendees to add this event to their calendars."
                registration={register("calendarEnabled")}
                icon={<CalendarPlus size={17} />}
              />
              <div className="mt-6 border-t border-[#edf1f6] pt-5">
                <h3 className="text-[13px] font-bold text-[#0b1538]">
                  Event Visibility
                </h3>
                <p className="mt-1 text-[11px] text-[#667794]">
                  Control when your event becomes visible to the public.
                </p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <RadioOption
                    value="immediately"
                    checked={values.publishTiming === "immediately"}
                    registration={register("publishTiming")}
                    title="Publish immediately"
                    description="Make the event visible as soon as it is saved."
                  />
                  <RadioOption
                    value="later"
                    checked={values.publishTiming === "later"}
                    registration={register("publishTiming")}
                    title="Schedule for later"
                    description="Set a future date and time to publish."
                  />
                </div>
                {values.publishTiming === "later" && (
                  <div className="mt-4 max-w-[360px]">
                    <Field
                      id="publish-date"
                      label="Publish Date & Time"
                      required
                      type="datetime-local"
                      min={publishDateMinimum}
                      registration={register("publishDate")}
                      error={errors.publishDate?.message}
                    />
                  </div>
                )}
              </div>
            </section>
          )}

          {step === 2 && (
            <div className="grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,.82fr)]">
              <section className={cardClass}>
                <PanelHeading
                  icon={<Building2 size={17} />}
                  title="Venue Information"
                  description="Add where guests will meet or how online attendees can join."
                />
                <div
                  role="tablist"
                  aria-label="Venue type"
                  className="mt-4 flex gap-6 border-b border-[#e7edf5]"
                >
                  <VenueTab
                    active={values.venueMode === "physical"}
                    onClick={() =>
                      setValue("venueMode", "physical", { shouldDirty: true })
                    }
                  >
                    Physical Venue
                  </VenueTab>
                  <VenueTab
                    active={values.venueMode === "online"}
                    onClick={() => {
                      setValue("venueMode", "online", {
                        shouldDirty: true,
                      });
                      setValue("seatMapEnabled", false, {
                        shouldDirty: true,
                      });
                    }}
                  >
                    Online Only
                  </VenueTab>
                </div>
                {values.venueMode === "physical" ? (
                  <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(250px,.82fr)]">
                    <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                      <Field
                        id="venue-name"
                        label="Venue Name"
                        required
                        registration={register("venue")}
                        error={errors.venue?.message}
                      />
                      <Field
                        id="venue-address"
                        label="Address"
                        required
                        registration={register("address")}
                        error={errors.address?.message}
                      />
                      <Field
                        id="venue-city"
                        label="City"
                        required
                        registration={register("city")}
                        error={errors.city?.message}
                      />
                      <SelectField
                        id="venue-country"
                        label="Country"
                        required
                        registration={register("country")}
                        icon={<Globe2 size={15} />}
                      >
                        <option value="Nigeria">Nigeria</option>
                        <option value="Ghana">Ghana</option>
                        <option value="South Africa">South Africa</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="United States">United States</option>
                      </SelectField>
                      <Field
                        id="venue-capacity"
                        label="Venue Capacity"
                        type="number"
                        inputMode="numeric"
                        registration={register("venueCapacity")}
                        error={errors.venueCapacity?.message}
                      />
                    </div>
                    <div className="flex min-h-[218px] items-center rounded-[10px] border border-[#dce5f2] bg-[#fbfcff] p-3">
                      <EmptyState
                        size="compact"
                        icon={<MapPin size={20} strokeWidth={1.8} />}
                        title="Map preview unavailable"
                        description="A location map will appear when venue geocoding is connected."
                        className="w-full border-0 bg-transparent"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 max-w-[560px] space-y-4">
                    <Field
                      id="online-venue-url"
                      label="Online Event Link"
                      required
                      type="url"
                      placeholder="https://your-event-platform.com"
                      registration={register("onlineVenueUrl")}
                      error={errors.onlineVenueUrl?.message}
                      hint="Attendees will receive this link after they register."
                    />
                    <Field
                      id="online-access-notes"
                      label="Access Instructions"
                      registration={register("accessNotes")}
                      hint="Explain how attendees will join the event."
                    />
                  </div>
                )}
              </section>

              <section className={cardClass}>
                <PanelHeading
                  icon={<LockKeyhole size={17} />}
                  title="Event Access"
                  description="Choose how guests can discover and attend."
                />
                <div className="mt-5">
                  <SelectField
                    id="event-access-type"
                    label="Access Type"
                    required
                    registration={register("audienceAccess")}
                    icon={<Globe2 size={15} />}
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="invite">Invite only</option>
                  </SelectField>
                </div>
                <p className="mt-5 text-[11px] font-bold text-[#14213e]">
                  Visibility Settings
                </p>
                <div className="mt-2 divide-y divide-[#edf1f6]">
                  <SwitchRow
                    id="livdot-listing"
                    title="List on LIV DOT"
                    description="Make this event discoverable on the platform."
                    compact
                    registration={register("livDotListing")}
                    icon={<Globe2 size={15} />}
                  />
                  <SwitchRow
                    id="shareable-link"
                    title="Allow shareable link"
                    description="Anyone with the link can view this event."
                    compact
                    registration={register("shareableLink")}
                    icon={<Link2 size={15} />}
                  />
                  <SwitchRow
                    id="age-restriction"
                    title="Age restriction"
                    description="Require attendees to be 18+."
                    compact
                    registration={register("ageRestrictionEnabled")}
                    icon={<ShieldCheck size={15} />}
                  />
                </div>
              </section>

              {values.venueMode === "physical" && (
                <section className={`${cardClass} lg:col-span-2`}>
                  <PanelHeading
                    icon={<Ticket size={17} />}
                    title="Interactive Seating Map"
                    description="Let attendees choose exact seats by section. The map is available only for physical venues with a capacity set."
                  />

                  {hasVenueCapacity || values.seatMapEnabled ? (
                    <label
                      htmlFor="seat-map-enabled"
                      className="mt-4 flex min-h-[58px] cursor-pointer items-center justify-between gap-4 border-y border-[#edf1f6] py-3"
                    >
                      <span className="min-w-0">
                        <span className="block text-[11px] font-semibold text-[#172b49]">
                          Enable interactive seat selection
                        </span>
                        <span className="mt-0.5 block text-[10px] leading-[1.4] text-[#6c7c98]">
                          Build sections by rows and seats per row. Attendees
                          will choose seats from this map at checkout.
                        </span>
                      </span>
                      <SwitchControl
                        id="seat-map-enabled"
                        label="Enable interactive seat selection"
                        registration={register("seatMapEnabled")}
                      />
                    </label>
                  ) : (
                    <div
                      role="status"
                      className="mt-4 flex items-start gap-2.5 rounded-[9px] bg-[#f5f8fc] px-3.5 py-3 text-[11px] leading-relaxed text-[#586987]"
                    >
                      <Info
                        size={15}
                        className="mt-0.5 shrink-0 text-[#075bff]"
                      />
                      <p>
                        Enter the venue capacity above to enable a seating map.
                        The number of mapped seats cannot exceed that capacity.
                      </p>
                    </div>
                  )}
                  {errors.venueCapacity?.message && values.seatMapEnabled && (
                    <ErrorText>{errors.venueCapacity.message}</ErrorText>
                  )}

                  {values.seatMapEnabled && (
                    <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(300px,.9fr)]">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h3 className="text-[12px] font-bold text-[#14213e]">
                              Seating sections
                            </h3>
                            <p className="mt-0.5 text-[10px] text-[#6c7c98]">
                              {seatMapSeatCount.toLocaleString("en-NG")} seats
                              mapped of{" "}
                              {hasVenueCapacity
                                ? seatMapCapacity.toLocaleString("en-NG")
                                : "—"}{" "}
                              venue capacity
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              appendSeatMapSection({
                                name: `Section ${seatMapSectionFields.length + 1}`,
                                rows: "4",
                                seatsPerRow: "10",
                                price: "25000",
                                color:
                                  sectionColorOptions[
                                    seatMapSectionFields.length %
                                      sectionColorOptions.length
                                  ]!.value,
                              })
                            }
                            className="focus-ring inline-flex min-h-9 items-center gap-2 rounded-[8px] border border-[#cfe0fa] bg-[#f8fbff] px-3 text-[10px] font-semibold text-[#075bff] transition hover:bg-[#eff5ff]"
                          >
                            <Plus size={14} /> Add Section
                          </button>
                        </div>

                        {seatMapSectionFields.length > 0 ? (
                          <div className="mt-3 divide-y divide-[#e9eef6] border-y border-[#e9eef6]">
                            {seatMapSectionFields.map((field, index) => {
                              const section =
                                values.seatMapSections[index] ?? field;
                              return (
                                <div
                                  key={field.id}
                                  className="grid gap-x-3 gap-y-3 py-4 sm:grid-cols-2"
                                >
                                  <div className="col-span-full flex items-center justify-between gap-3">
                                    <p className="text-[11px] font-semibold text-[#243755]">
                                      Section {index + 1}
                                    </p>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeSeatMapSection(index)
                                      }
                                      aria-label={`Remove ${section.name || `section ${index + 1}`}`}
                                      className="focus-ring grid size-8 place-items-center rounded-[7px] text-[#6e7d97] transition hover:bg-[#fff3f4] hover:text-[#cb3341]"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                  <Field
                                    id={`seat-section-name-${index}`}
                                    label="Section Name"
                                    required
                                    registration={register(
                                      `seatMapSections.${index}.name`,
                                    )}
                                    error={
                                      errors.seatMapSections?.[index]?.name
                                        ?.message
                                    }
                                  />
                                  <SelectField
                                    id={`seat-section-color-${index}`}
                                    label="Map Color"
                                    registration={register(
                                      `seatMapSections.${index}.color`,
                                    )}
                                    error={
                                      errors.seatMapSections?.[index]?.color
                                        ?.message
                                    }
                                  >
                                    {sectionColorOptions.map((option) => (
                                      <option
                                        key={option.value}
                                        value={option.value}
                                      >
                                        {option.label}
                                      </option>
                                    ))}
                                  </SelectField>
                                  <Field
                                    id={`seat-section-rows-${index}`}
                                    label="Rows"
                                    type="number"
                                    inputMode="numeric"
                                    registration={register(
                                      `seatMapSections.${index}.rows`,
                                    )}
                                    error={
                                      errors.seatMapSections?.[index]?.rows
                                        ?.message
                                    }
                                  />
                                  <Field
                                    id={`seat-section-seats-per-row-${index}`}
                                    label="Seats per row"
                                    type="number"
                                    inputMode="numeric"
                                    registration={register(
                                      `seatMapSections.${index}.seatsPerRow`,
                                    )}
                                    error={
                                      errors.seatMapSections?.[index]
                                        ?.seatsPerRow?.message
                                    }
                                  />
                                  <Field
                                    id={`seat-section-price-${index}`}
                                    label="Price per seat (NGN)"
                                    inputMode="decimal"
                                    registration={register(
                                      `seatMapSections.${index}.price`,
                                    )}
                                    error={
                                      errors.seatMapSections?.[index]?.price
                                        ?.message
                                    }
                                  />
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="mt-4 rounded-[9px] bg-[#f5f8fc] px-3.5 py-3 text-[10px] leading-relaxed text-[#6c7c98]">
                            Add a section to set its rows, seats per row, and
                            seat price.
                          </p>
                        )}
                        {errors.seatMapSections?.message && (
                          <ErrorText>
                            {errors.seatMapSections.message}
                          </ErrorText>
                        )}
                      </div>

                      <div className="min-w-0 border-t border-[#e9eef6] pt-4 xl:border-t-0 xl:border-l xl:pt-0 xl:pl-5">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div>
                            <h3 className="text-[12px] font-bold text-[#14213e]">
                              Map preview
                            </h3>
                            <p className="mt-0.5 text-[10px] text-[#6c7c98]">
                              3D venue with your ticket sections
                            </p>
                          </div>
                          <span className="rounded-full bg-[#eaf3ff] px-2.5 py-1 text-[10px] font-semibold text-[#075bff]">
                            {seatMapPreview.blocks.length} sections
                          </span>
                        </div>
                        <SeatMap3DPreview seatMap={seatMapPreview} />
                        <p className="mt-2 text-[10px] leading-relaxed text-[#6c7c98]">
                          Set seat counts and prices in the section builder.
                          Buyers will choose exact seats from those sections.
                        </p>
                      </div>
                    </div>
                  )}
                </section>
              )}
            </div>
          )}

          {step === 3 && (
            <section className={cardClass}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <PanelHeading
                  icon={<Ticket size={17} />}
                  title={usesSeatMap ? "Seat Map Pricing" : "Ticket Types"}
                  description={
                    usesSeatMap
                      ? "Each seat uses the price set for its section."
                      : "Create different ticket options for your attendees."
                  }
                />
                {!usesSeatMap && (
                  <button
                    type="button"
                    onClick={() =>
                      append({
                        name: "New ticket type",
                        price: "0",
                        quantity: "100",
                        active: true,
                      })
                    }
                    className="focus-ring inline-flex h-9 items-center gap-2 rounded-[8px] bg-[#075bff] px-3.5 text-[11px] font-semibold text-white shadow-[0_3px_8px_rgba(7,91,255,.18)] transition hover:bg-[#034fe2]"
                  >
                    <Plus size={15} /> Add Ticket Type
                  </button>
                )}
              </div>
              {usesSeatMap ? (
                <div className="mt-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-y border-[#edf1f6] py-3">
                    <div>
                      <p className="text-[11px] font-semibold text-[#243755]">
                        {seatMapSeatCount.toLocaleString("en-NG")} reserved
                        seats across {seatMapPreview.blocks.length} sections
                      </p>
                      <p className="mt-0.5 text-[10px] text-[#6c7c98]">
                        Ticket tiers are managed by section in the seating map.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="focus-ring inline-flex min-h-9 items-center gap-2 rounded-[8px] border border-[#cfe0fa] bg-[#f8fbff] px-3 text-[10px] font-semibold text-[#075bff] transition hover:bg-[#eff5ff]"
                    >
                      <Pencil size={13} /> Edit seating layout
                    </button>
                  </div>
                  <div className="divide-y divide-[#edf1f6]">
                    {seatMapPreview.blocks.map((section) => (
                      <div
                        key={String(section.id)}
                        className="flex flex-wrap items-center justify-between gap-3 py-3"
                      >
                        <span className="flex min-w-0 items-center gap-2.5">
                          <span
                            aria-hidden="true"
                            className="size-3 shrink-0 rounded-full"
                            style={{ backgroundColor: section.color }}
                          />
                          <span className="truncate text-[11px] font-semibold text-[#243755]">
                            {section.title}
                          </span>
                        </span>
                        <span className="text-[10px] text-[#6c7c98]">
                          {section.seats.length.toLocaleString("en-NG")} seats
                        </span>
                        <span className="text-[11px] font-semibold text-[#172b49] tabular-nums">
                          {formatCurrency(String(section.price ?? 0))} per seat
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div className="mt-5 overflow-hidden rounded-[10px] border border-[#e5ebf4]">
                    <div className="hidden grid-cols-[minmax(180px,1.6fr)_minmax(120px,.8fr)_minmax(120px,.8fr)_100px_92px] gap-3 bg-[#f8faff] px-4 py-2.5 text-[10px] font-semibold text-[#62728e] sm:grid">
                      <span>Ticket Type</span>
                      <span>Price (₦)</span>
                      <span>Quantity</span>
                      <span>Active</span>
                      <span>Actions</span>
                    </div>
                    {ticketFields.map((field, index) => {
                      const ticket = values.ticketTypes[index] ?? field;
                      const isEditing = editingTicket === field.id;
                      return (
                        <div
                          key={field.id}
                          className="grid gap-3 border-t border-[#edf1f6] px-3 py-3 first:border-t-0 sm:grid-cols-[minmax(180px,1.6fr)_minmax(120px,.8fr)_minmax(120px,.8fr)_100px_92px] sm:items-center sm:gap-3 sm:px-4"
                        >
                          <div className="min-w-0">
                            <span className="mb-1 block text-[10px] font-semibold text-[#75839c] sm:hidden">
                              Ticket Type
                            </span>
                            {isEditing ? (
                              <Field
                                id={`ticket-name-${index}`}
                                label=""
                                registration={register(
                                  `ticketTypes.${index}.name`,
                                )}
                                error={
                                  errors.ticketTypes?.[index]?.name?.message
                                }
                              />
                            ) : (
                              <p className="truncate text-[12px] font-semibold text-[#14213e]">
                                {ticket.name}
                              </p>
                            )}
                            <p className="mt-0.5 text-[10px] text-[#76849c]">
                              {index === 0
                                ? "Watch the live stream from anywhere."
                                : index === 1
                                  ? "Access to the venue, standard seating."
                                  : "Front row, backstage access, exclusive perks."}
                            </p>
                          </div>
                          <div>
                            <span className="mb-1 block text-[10px] font-semibold text-[#75839c] sm:hidden">
                              Price (₦)
                            </span>
                            {isEditing ? (
                              <Field
                                id={`ticket-price-${index}`}
                                label=""
                                inputMode="decimal"
                                registration={register(
                                  `ticketTypes.${index}.price`,
                                )}
                                error={
                                  errors.ticketTypes?.[index]?.price?.message
                                }
                              />
                            ) : (
                              <p className="text-[12px] font-medium text-[#243755] tabular-nums">
                                {formatCurrency(ticket.price)}
                              </p>
                            )}
                          </div>
                          <div>
                            <span className="mb-1 block text-[10px] font-semibold text-[#75839c] sm:hidden">
                              Quantity
                            </span>
                            {isEditing ? (
                              <Field
                                id={`ticket-quantity-${index}`}
                                label=""
                                inputMode="numeric"
                                registration={register(
                                  `ticketTypes.${index}.quantity`,
                                )}
                                error={
                                  errors.ticketTypes?.[index]?.quantity?.message
                                }
                              />
                            ) : (
                              <p className="text-[12px] font-medium text-[#243755] tabular-nums">
                                {Number(ticket.quantity || 0).toLocaleString(
                                  "en-NG",
                                )}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center justify-between sm:justify-start">
                            <span className="text-[10px] font-semibold text-[#75839c] sm:hidden">
                              Active
                            </span>
                            <SwitchControl
                              id={`ticket-active-${index}`}
                              label={`Activate ${ticket.name}`}
                              registration={register(
                                `ticketTypes.${index}.active`,
                              )}
                            />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                setEditingTicket(isEditing ? null : field.id)
                              }
                              aria-label={
                                isEditing
                                  ? `Save ${ticket.name}`
                                  : `Edit ${ticket.name}`
                              }
                              className="focus-ring grid size-8 place-items-center rounded-[7px] border border-[#e2e9f3] text-[#075bff] transition hover:bg-[#f3f7ff]"
                            >
                              {isEditing ? (
                                <Check size={15} />
                              ) : (
                                <Pencil size={14} />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              disabled={ticketFields.length === 1}
                              aria-label={`Remove ${ticket.name}`}
                              className="focus-ring grid size-8 place-items-center rounded-[7px] border border-[#e2e9f3] text-[#6e7d97] transition hover:bg-[#fff3f4] hover:text-[#cb3341] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-[10px] text-[#bc3343]" role="alert">
                    {errors.ticketTypes?.message}
                  </p>
                </>
              )}
              <div className="mt-6 border-t border-[#edf1f6] pt-5">
                <h3 className="text-[13px] font-bold text-[#14213e]">
                  Additional Settings
                </h3>
                <div className="mt-2 divide-y divide-[#edf1f6]">
                  <SwitchRow
                    id="early-bird"
                    title="Enable early bird pricing"
                    description="Offer discounted prices for a limited time."
                    compact
                    registration={register("earlyBirdEnabled")}
                  />
                  <div className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <SwitchRow
                      id="max-tickets"
                      title="Set maximum tickets per user"
                      description="Limit how many tickets a single user can purchase."
                      compact
                      registration={register("maxTicketsEnabled")}
                    />
                    {values.maxTicketsEnabled && (
                      <div className="ml-auto flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2">
                          <input
                            id="max-tickets-per-user"
                            type="number"
                            min="1"
                            aria-label="Maximum tickets per user"
                            aria-invalid={Boolean(errors.maxTicketsPerUser)}
                            {...register("maxTicketsPerUser")}
                            className={`${fieldClass} h-9 w-[72px] text-center`}
                          />
                          <span className="text-[10px] text-[#667794]">
                            tickets
                          </span>
                        </div>
                        {errors.maxTicketsPerUser?.message && (
                          <ErrorText>
                            {errors.maxTicketsPerUser.message}
                          </ErrorText>
                        )}
                      </div>
                    )}
                  </div>
                  <SwitchRow
                    id="discount-codes"
                    title="Enable discount codes"
                    description="Allow promotional or influencer codes."
                    compact
                    registration={register("discountCodesEnabled")}
                  />
                </div>
              </div>
              <p className="mt-4 flex items-start gap-2 text-[10px] leading-relaxed text-[#697b98]">
                <ShieldCheck
                  size={14}
                  className="mt-0.5 shrink-0 text-[#09a77b]"
                />
                Ticket quantities and prices can be updated before your event is
                published.
              </p>
            </section>
          )}

          {step === 4 && (
            <section className={cardClass}>
              <PanelHeading
                icon={<Radio size={17} />}
                title="Streaming Configuration"
                description="Set up how your live event will be streamed to online attendees."
              />
              <p className="mt-5 text-[11px] font-bold text-[#14213e]">
                Streaming Method
              </p>
              <div
                role="group"
                aria-label="Streaming method"
                className="mt-2 grid gap-3 md:grid-cols-2"
              >
                <ProviderOption
                  selected={values.streamingProvider === "livdot"}
                  onSelect={() =>
                    setValue("streamingProvider", "livdot", {
                      shouldDirty: true,
                    })
                  }
                  icon={<Radio size={17} />}
                  title="Use LIV DOT (Recommended)"
                  description="Stream directly through our platform."
                />
                <ProviderOption
                  selected={values.streamingProvider === "external"}
                  onSelect={() =>
                    setValue("streamingProvider", "external", {
                      shouldDirty: true,
                    })
                  }
                  icon={<Video size={17} />}
                  title="Use External Provider"
                  description="YouTube, Zoom, Vimeo, or custom RTMP."
                />
              </div>
              {values.streamingProvider === "livdot" ? (
                <div className="mt-5 grid gap-x-4 gap-y-4 md:grid-cols-2">
                  <SelectField
                    id="stream-region"
                    label="Streaming Region"
                    registration={register("streamingRegion")}
                    icon={<Globe2 size={15} />}
                    hint="Automatically choose the best region for your audience."
                  >
                    <option value="auto">Auto (Recommended)</option>
                    <option value="africa">Africa</option>
                    <option value="europe">Europe</option>
                    <option value="north-america">North America</option>
                  </SelectField>
                  <div className="md:col-span-2">
                    <label htmlFor="stream-server" className={fieldLabelClass}>
                      Ingest Server
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="stream-server"
                        readOnly
                        {...register("streamingServer")}
                        className={`${fieldClass} min-w-0 bg-[#f8faff] text-[#536480]`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          copyValue(values.streamingServer, "Ingest server")
                        }
                        className="focus-ring inline-flex h-10 shrink-0 items-center gap-1.5 rounded-[8px] border border-[#bfd4f6] bg-white px-3 text-[10px] font-semibold text-[#075bff] hover:bg-[#f3f7ff]"
                      >
                        <Copy size={13} /> Copy
                      </button>
                    </div>
                    <p className="mt-1 text-[10px] text-[#71809a]">
                      Use this RTMP URL in your streaming software (OBS, vMix,
                      etc.).
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="stream-key" className={fieldLabelClass}>
                      Stream Key
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="stream-key"
                        type="password"
                        autoComplete="new-password"
                        {...register("streamingKey")}
                        className={`${fieldClass} min-w-0`}
                        placeholder="Enter your private stream key"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          copyValue(values.streamingKey, "Stream key")
                        }
                        className="focus-ring inline-flex h-10 shrink-0 items-center gap-1.5 rounded-[8px] border border-[#bfd4f6] bg-white px-3 text-[10px] font-semibold text-[#075bff] hover:bg-[#f3f7ff]"
                      >
                        <Copy size={13} /> Copy
                      </button>
                    </div>
                    <p className="mt-1 text-[10px] text-[#71809a]">
                      Keep your stream key private. Do not share it publicly.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <SelectField
                    id="external-platform"
                    label="Streaming Platform"
                    required
                    registration={register("streamingPlatform")}
                    icon={<Video size={15} />}
                  >
                    <option value="youtube">YouTube Live</option>
                    <option value="zoom">Zoom</option>
                    <option value="vimeo">Vimeo</option>
                    <option value="custom-rtmp">Custom RTMP</option>
                  </SelectField>
                  <Field
                    id="external-stream-url"
                    label="Ingest Server"
                    registration={register("streamingUrl")}
                    error={errors.streamingUrl?.message}
                    placeholder="rtmp://…"
                  />
                  <Field
                    id="external-stream-key"
                    label="Stream Key"
                    type="password"
                    registration={register("streamingKey")}
                    placeholder="Enter your private stream key"
                  />
                </div>
              )}
              <details className="group mt-5 rounded-[9px] border border-[#e5ebf4]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3.5 py-3 text-[12px] font-semibold text-[#203554] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075bff]">
                  <span>Advanced Settings</span>
                  <ChevronDown
                    size={15}
                    className="transition group-open:rotate-180"
                  />
                </summary>
                <div className="border-t border-[#edf1f6] px-3.5 py-1">
                  <SwitchRow
                    id="stream-low-latency"
                    title="Low latency mode"
                    description="Reduce delay for interactive events."
                    compact
                    registration={register("streamingLowLatency")}
                  />
                  <SwitchRow
                    id="stream-recording"
                    title="Record the stream"
                    description="Save a replay for attendees after the event."
                    compact
                    registration={register("streamRecording")}
                  />
                </div>
              </details>
              <div className="mt-4 flex items-start gap-2.5 rounded-[9px] border border-[#d9e8fb] bg-[#f3f8ff] px-3.5 py-3 text-[11px] leading-relaxed text-[#4d6387]">
                <LockKeyhole
                  size={15}
                  className="mt-0.5 shrink-0 text-[#075bff]"
                />
                Streaming credentials stay private and are never shown on your
                public event page.
              </div>
            </section>
          )}

          {step === 5 && (
            <section className={cardClass}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <PanelHeading
                  icon={<FileText size={17} />}
                  title="Event Summary"
                  description="Review your event details. You can go back to any step to make changes."
                />
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-[8px] border border-[#dbe7f8] bg-[#f8fbff] px-3 text-[10px] font-semibold text-[#075bff] hover:bg-[#eff5ff]"
                >
                  <Pencil size={13} /> Edit
                </button>
              </div>
              <div className="relative mt-4 h-[190px] overflow-hidden rounded-[10px] bg-[#07152c] sm:h-[260px]">
                {bannerUrl ? (
                  <Image
                    src={bannerUrl}
                    alt={bannerAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, 1200px"
                    unoptimized={bannerUrl.startsWith("blob:")}
                    className="object-cover object-[9%_42%]"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-white/60">
                    <ImagePlus size={28} />
                  </div>
                )}
              </div>
              <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-[20px] font-bold tracking-[-.025em] text-[#0b1538] sm:text-[23px]">
                    {values.name}
                  </h3>
                  <p className="mt-1 text-[11px] text-[#5f708e]">
                    {categoryLabel}{" "}
                    <span className="mx-1 text-[#b3bfd0]">·</span>{" "}
                    <span className="text-[#07936c]">{accessLabel}</span>
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-[7px] bg-[#eaf3ff] px-2.5 py-1.5 text-[10px] font-semibold text-[#075bff]">
                  <Radio size={13} /> {eventTypeLabel}
                </span>
              </div>
              <div className="mt-5 grid gap-x-6 gap-y-4 border-y border-[#edf1f6] py-4 md:grid-cols-2">
                <SummaryDetail
                  icon={<CalendarDays size={16} />}
                  label="Date & Time"
                >
                  <span>{dateRange}</span>
                  <span className="block text-[11px] text-[#687996]">
                    {formatTime(values.startTime)} –{" "}
                    {formatTime(values.endTime)} (
                    {getTimeZoneShort(values.timeZone)})
                  </span>
                  {values.calendarEnabled && (
                    <button
                      type="button"
                      onClick={() =>
                        toast.info("Calendar export will be available soon.")
                      }
                      className="mt-1 text-[10px] font-semibold text-[#075bff] hover:underline"
                    >
                      Add to calendar
                    </button>
                  )}
                </SummaryDetail>
                <SummaryDetail icon={<MapPin size={16} />} label="Venue">
                  <span>
                    {values.venueMode === "online"
                      ? "Online event"
                      : values.venue}
                  </span>
                  <span className="block text-[11px] text-[#687996]">
                    {values.venueMode === "online"
                      ? values.onlineVenueUrl
                      : `${values.city}, ${values.country}`}
                  </span>
                  {values.venueMode === "physical" && (
                    <a
                      href="https://www.openstreetmap.org/#map=16/6.427/3.421"
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 block text-[10px] font-semibold text-[#075bff] hover:underline"
                    >
                      View on map →
                    </a>
                  )}
                </SummaryDetail>
                <SummaryDetail
                  icon={<Ticket size={16} />}
                  label={usesSeatMap ? "Seating Map" : "Ticket Types"}
                >
                  <span>
                    {usesSeatMap
                      ? `${seatMapPreview.blocks.length} sections`
                      : `${activeTicketCount} ticket types`}{" "}
                    <span className="text-[#9aa7ba]">·</span> From{" "}
                    {visibleStartingPrice == null
                      ? "—"
                      : formatCurrency(String(visibleStartingPrice))}
                  </span>
                  <span className="block text-[11px] text-[#687996]">
                    {usesSeatMap
                      ? seatMapSeatCount.toLocaleString("en-NG")
                      : activeTicketQuantity.toLocaleString("en-NG")}{" "}
                    {usesSeatMap ? "seats mapped" : "tickets available"}
                  </span>
                </SummaryDetail>
                <SummaryDetail icon={<Users size={16} />} label="Capacity">
                  <span>
                    {Number(values.venueCapacity || 0).toLocaleString("en-NG")}{" "}
                    capacity
                  </span>
                  <span className="block text-[11px] text-[#687996]">
                    {eventTypeLabel}
                  </span>
                </SummaryDetail>
                <SummaryDetail icon={<Radio size={16} />} label="Streaming">
                  <span>
                    {values.streamingEnabled
                      ? `${values.streamingProvider === "livdot" ? "LIV DOT" : values.streamingPlatform} Streaming`
                      : "Streaming disabled"}
                  </span>
                  <span className="block text-[11px] text-[#078765]">
                    {!values.streamingEnabled
                      ? "In-person event"
                      : values.streamingProvider === "livdot"
                        ? values.streamingKey
                          ? "RTMP ingest configured · Ready to go"
                          : "Add a stream key before publishing"
                        : values.streamingUrl
                          ? "Provider ingest configured"
                          : "Add the provider ingest URL"}
                  </span>
                </SummaryDetail>
              </div>
              <div className="mt-4">
                <h3 className="text-[12px] font-bold text-[#172a49]">
                  Description
                </h3>
                <p className="mt-1.5 max-w-[100ch] text-[11px] leading-[1.65] text-[#657591]">
                  {values.description}
                </p>
              </div>
            </section>
          )}
        </div>
      </form>

      <footer className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e2e8f2] bg-white/95 shadow-[0_-5px_18px_rgba(14,36,70,.05)] backdrop-blur-sm md:left-[240px]">
        <div className="mx-auto flex min-h-[62px] max-w-[1760px] items-center justify-between gap-3 px-4 sm:px-6 lg:pr-[23px] lg:pl-[28px]">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((current) => Math.max(0, current - 1))}
                className="focus-ring inline-flex h-10 items-center gap-2 rounded-[9px] border border-[#cddaf0] bg-white px-3 text-[11px] font-semibold text-[#24436f] transition hover:bg-[#f7faff] sm:px-4 sm:text-[12px]"
              >
                <ArrowLeft size={15} /> Back
              </button>
            )}
            <span className="hidden text-[10px] text-[#73829b] sm:inline">
              Step {step + 1} of {steps.length}
            </span>
          </div>
          {step < steps.length - 1 ? (
            <button
              type="button"
              onClick={goForward}
              className="focus-ring inline-flex min-h-10 shrink-0 items-center gap-2 rounded-[10px] bg-gradient-to-r from-[#075bff] to-[#00c8d7] px-4 text-[11px] font-semibold text-white shadow-[0_4px_10px_rgba(0,100,239,.16)] transition hover:brightness-105 sm:px-6 sm:text-[12px]"
            >
              Continue to {steps[step + 1]} <ArrowRight size={15} />
            </button>
          ) : (
            <div className="flex min-w-0 items-center gap-3">
              <p className="hidden max-w-[250px] text-right text-[10px] leading-[1.4] text-[#687996] lg:block">
                {values.publishTiming === "later"
                  ? `Scheduled to publish ${formatDate(values.publishDate.slice(0, 10), values.timeZone)}.`
                  : "Your event will publish immediately and be visible to the public."}
              </p>
              <button
                type="submit"
                form="create-event-form"
                disabled={isSubmitting || isCreating}
                className="focus-ring inline-flex min-h-10 shrink-0 items-center gap-2 rounded-[9px] bg-[#08b97e] px-4 text-[11px] font-semibold text-white shadow-[0_4px_10px_rgba(8,185,126,.16)] transition hover:bg-[#06a970] disabled:cursor-wait disabled:opacity-70 sm:px-6 sm:text-[12px]"
              >
                {isCreating ? "Publishing…" : "Publish Event"}{" "}
                <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
