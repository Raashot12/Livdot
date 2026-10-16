import { z } from "zod";
import type { FieldPath } from "react-hook-form";
import {
  getScheduleDateTime,
  getScheduleDateTimeAsDate,
} from "../lib/event-schedule.utils";
export const draftStorageKey = "liv-dot-create-event-draft";
export const bannerAlt = "Event cover banner";
export const steps = [
  "Basics",
  "Schedule",
  "Venue & Access",
  "Ticketing",
  "Streaming",
  "Review",
] as const;
export const stepDescriptions = [
  "Set up and launch your event in a few simple steps.",
  "Set the date, time, and timezone for your event.",
  "Step 3 of 6: Set your venue and access options.",
  "Set up your ticket types and pricing.",
  "Configure your live streaming settings.",
  "Review all the details before publishing.",
] as const;

export const eventDraftSchema = z
  .object({
    name: z.string().trim().min(3, "Enter an event name.").max(100),
    eventType: z.enum(["hybrid", "in-person", "online"]),
    category: z.string().min(1, "Choose a category."),
    audienceAccess: z.enum(["public", "private", "invite"]),
    description: z
      .string()
      .trim()
      .min(20, "Add a little more detail about your event.")
      .max(2000),
    date: z.string().min(1, "Choose a start date."),
    endDate: z.string().min(1, "Choose an end date."),
    startTime: z.string().min(1, "Choose a start time."),
    endTime: z.string().min(1, "Choose an end time."),
    timeZone: z.string().min(1, "Choose a time zone."),
    calendarEnabled: z.boolean(),
    publishTiming: z.enum(["immediately", "later"]),
    publishDate: z.string(),
    venueMode: z.enum(["physical", "online"]),
    venue: z.string().trim().min(2, "Enter a venue name."),
    address: z.string().max(180),
    city: z.string().trim().min(1, "Enter a city."),
    country: z.string().trim().min(1, "Choose a country."),
    onlineVenueUrl: z.string(),
    accessNotes: z.string().max(500),
    livDotListing: z.boolean(),
    shareableLink: z.boolean(),
    ageRestrictionEnabled: z.boolean(),
    venueCapacity: z
      .string()
      .refine(
        (value) =>
          value === "" ||
          (Number.isInteger(Number(value)) && Number(value) >= 0),
        "Enter a whole number.",
      ),
    seatMapEnabled: z.boolean(),
    seatMapSections: z.array(
      z.object({
        name: z.string(),
        rows: z.string(),
        seatsPerRow: z.string(),
        price: z.string(),
        color: z.string(),
      }),
    ),
    ticketTypes: z.array(
      z.object({
        name: z.string(),
        price: z.string(),
        quantity: z.string(),
        active: z.boolean(),
      }),
    ),
    earlyBirdEnabled: z.boolean(),
    maxTicketsEnabled: z.boolean(),
    maxTicketsPerUser: z.string(),
    discountCodesEnabled: z.boolean(),
    streamingEnabled: z.boolean(),
    streamingLowLatency: z.boolean(),
    streamRecording: z.boolean(),
    streamingProvider: z.enum(["livdot", "external"]),
    streamingRegion: z.enum(["auto", "africa", "europe", "north-america"]),
    streamingServer: z.string(),
    streamingPlatform: z.string(),
    streamingUrl: z
      .string()
      .refine(
        (value) => value === "" || /^https?:\/\//i.test(value),
        "Enter a URL that starts with http:// or https://.",
      ),
    streamingKey: z.string().max(180),
  })
  .refine(
    (values) => {
      if (
        !values.date ||
        !values.endDate ||
        !values.startTime ||
        !values.endTime
      )
        return true;
      const startDateTime = getScheduleDateTimeAsDate(
        values.date,
        values.startTime,
        values.timeZone,
      );
      const endDateTime = getScheduleDateTimeAsDate(
        values.endDate,
        values.endTime,
        values.timeZone,
      );
      return Boolean(
        startDateTime &&
        endDateTime &&
        endDateTime.getTime() > startDateTime.getTime(),
      );
    },
    {
      message:
        "Choose valid event times and make sure the end is after the start.",
      path: ["endTime"],
    },
  )
  .refine(
    (values) => values.publishTiming !== "later" || Boolean(values.publishDate),
    {
      message: "Choose when this event should be published.",
      path: ["publishDate"],
    },
  )
  .refine(
    (values) =>
      values.publishTiming !== "later" ||
      !values.publishDate ||
      new Date(values.publishDate).getTime() > Date.now(),
    {
      message: "Choose a publish date and time that is still in the future.",
      path: ["publishDate"],
    },
  )
  .refine(
    (values) =>
      values.venueMode !== "online" || Boolean(values.onlineVenueUrl.trim()),
    {
      message: "Add the online event link.",
      path: ["onlineVenueUrl"],
    },
  )
  .refine(
    (values) =>
      !values.maxTicketsEnabled || Number(values.maxTicketsPerUser) > 0,
    {
      message: "Set a maximum above zero, or turn this setting off.",
      path: ["maxTicketsPerUser"],
    },
  )
  .refine(
    (values) =>
      values.venueMode !== "online" ||
      /^https?:\/\//i.test(values.onlineVenueUrl.trim()),
    {
      message: "Enter a valid online event URL.",
      path: ["onlineVenueUrl"],
    },
  )
  .refine(
    (values) =>
      !values.streamingEnabled ||
      values.streamingProvider !== "external" ||
      Boolean(values.streamingUrl),
    {
      message: "Add the external provider ingest URL.",
      path: ["streamingUrl"],
    },
  )
  .superRefine((values, context) => {
    if (
      values.streamingEnabled &&
      values.streamingProvider === "external" &&
      !values.streamingPlatform
    ) {
      context.addIssue({
        code: "custom",
        message: "Choose a streaming platform.",
        path: ["streamingPlatform"],
      });
    }

    if (values.date && values.timeZone) {
      const currentScheduleDateTime = getScheduleDateTime(values.timeZone);

      if (!currentScheduleDateTime) {
        context.addIssue({
          code: "custom",
          message: "Choose a valid time zone.",
          path: ["timeZone"],
        });
      } else if (values.date < currentScheduleDateTime.date) {
        context.addIssue({
          code: "custom",
          message: "Choose today or a future date.",
          path: ["date"],
        });
      } else if (values.startTime) {
        const startDateTime = getScheduleDateTimeAsDate(
          values.date,
          values.startTime,
          values.timeZone,
        );

        if (!startDateTime) {
          context.addIssue({
            code: "custom",
            message: "Choose a valid start time for this time zone.",
            path: ["startTime"],
          });
        } else if (startDateTime.getTime() <= Date.now()) {
          context.addIssue({
            code: "custom",
            message:
              "For today, choose a start time that is still in the future.",
            path: ["startTime"],
          });
        }
      }
    }

    const usesSeatMap =
      values.venueMode === "physical" && values.seatMapEnabled;

    if (usesSeatMap) {
      const capacity = Number(values.venueCapacity);
      if (!Number.isSafeInteger(capacity) || capacity <= 0) {
        context.addIssue({
          code: "custom",
          message: "Enter the venue capacity before enabling a seat map.",
          path: ["venueCapacity"],
        });
      }
      if (values.seatMapSections.length === 0) {
        context.addIssue({
          code: "custom",
          message: "Add at least one seating section.",
          path: ["seatMapSections"],
        });
      }

      let totalSeats = 0;
      values.seatMapSections.forEach((section, index) => {
        if (!section.name.trim()) {
          context.addIssue({
            code: "custom",
            message: "Name this section.",
            path: ["seatMapSections", index, "name"],
          });
        }
        const rows = Number(section.rows);
        const seatsPerRow = Number(section.seatsPerRow);
        if (!Number.isSafeInteger(rows) || rows <= 0) {
          context.addIssue({
            code: "custom",
            message: "Enter a whole number of rows above zero.",
            path: ["seatMapSections", index, "rows"],
          });
        }
        if (!Number.isSafeInteger(seatsPerRow) || seatsPerRow <= 0) {
          context.addIssue({
            code: "custom",
            message: "Enter a whole number of seats per row above zero.",
            path: ["seatMapSections", index, "seatsPerRow"],
          });
        }
        if (!/^\d+(\.\d{1,2})?$/.test(section.price)) {
          context.addIssue({
            code: "custom",
            message: "Enter a valid section price.",
            path: ["seatMapSections", index, "price"],
          });
        }
        if (!/^#[\da-f]{6}$/i.test(section.color)) {
          context.addIssue({
            code: "custom",
            message: "Choose a section color.",
            path: ["seatMapSections", index, "color"],
          });
        }
        if (
          Number.isSafeInteger(rows) &&
          rows > 0 &&
          Number.isSafeInteger(seatsPerRow) &&
          seatsPerRow > 0
        ) {
          totalSeats += rows * seatsPerRow;
        }
      });

      if (capacity > 0 && totalSeats > capacity) {
        context.addIssue({
          code: "custom",
          message: `The map has ${totalSeats.toLocaleString("en-NG")} seats, above the venue capacity of ${capacity.toLocaleString("en-NG")}.`,
          path: ["seatMapSections"],
        });
      }
      return;
    }

    const activeTickets = values.ticketTypes.filter((ticket) => ticket.active);
    if (activeTickets.length === 0) {
      context.addIssue({
        code: "custom",
        message: "Keep at least one ticket type active.",
        path: ["ticketTypes"],
      });
    }
    values.ticketTypes.forEach((ticket, index) => {
      if (!ticket.name.trim()) {
        context.addIssue({
          code: "custom",
          message: "Name this ticket type.",
          path: ["ticketTypes", index, "name"],
        });
      }
      if (!/^\d+(\.\d{1,2})?$/.test(ticket.price)) {
        context.addIssue({
          code: "custom",
          message: "Enter a valid price.",
          path: ["ticketTypes", index, "price"],
        });
      }
      if (!/^\d+$/.test(ticket.quantity) || Number(ticket.quantity) <= 0) {
        context.addIssue({
          code: "custom",
          message: "Quantity must be a whole number above zero.",
          path: ["ticketTypes", index, "quantity"],
        });
      }
    });
  });

export type EventDraft = z.infer<typeof eventDraftSchema>;

export const initialValues: EventDraft = {
  name: "",
  eventType: "hybrid",
  category: "",
  audienceAccess: "public",
  description: "",
  date: "",
  endDate: "",
  startTime: "",
  endTime: "",
  timeZone: "Africa/Lagos",
  calendarEnabled: true,
  publishTiming: "immediately",
  publishDate: "",
  venueMode: "physical",
  venue: "",
  address: "",
  city: "",
  country: "",
  onlineVenueUrl: "",
  accessNotes: "",
  livDotListing: true,
  shareableLink: true,
  ageRestrictionEnabled: false,
  venueCapacity: "",
  seatMapEnabled: false,
  seatMapSections: [],
  ticketTypes: [],
  earlyBirdEnabled: false,
  maxTicketsEnabled: false,
  maxTicketsPerUser: "",
  discountCodesEnabled: false,
  streamingEnabled: true,
  streamingLowLatency: true,
  streamRecording: false,
  streamingProvider: "livdot",
  streamingRegion: "auto",
  streamingServer: "",
  streamingPlatform: "",
  streamingUrl: "",
  streamingKey: "",
};

export const sectionColorOptions = [
  { label: "Premium blue", value: "#087cf0" },
  { label: "VIP gold", value: "#d29435" },
  { label: "Balcony violet", value: "#8253c7" },
  { label: "General green", value: "#16855d" },
  { label: "Coral", value: "#d64b5b" },
] as const;

export const fieldsByStep: FieldPath<EventDraft>[][] = [
  ["name", "eventType", "category", "audienceAccess", "description"],
  ["date", "endDate", "startTime", "endTime", "timeZone", "publishDate"],
  [
    "venue",
    "address",
    "city",
    "country",
    "onlineVenueUrl",
    "audienceAccess",
    "accessNotes",
    "venueCapacity",
    "seatMapEnabled",
    "seatMapSections",
  ],
  ["ticketTypes", "maxTicketsPerUser", "seatMapEnabled"],
  ["streamingPlatform", "streamingUrl", "streamingKey"],
  [
    "name",
    "eventType",
    "category",
    "audienceAccess",
    "description",
    "date",
    "endDate",
    "startTime",
    "endTime",
    "timeZone",
    "venue",
    "address",
    "city",
    "country",
    "onlineVenueUrl",
    "venueCapacity",
    "seatMapEnabled",
    "seatMapSections",
    "ticketTypes",
    "streamingPlatform",
    "streamingUrl",
    "streamingKey",
  ],
];

export const cardClass =
  "rounded-[13px] border border-[#e5ebf4] bg-white p-4 shadow-[0_4px_16px_rgba(18,44,78,.025)] sm:p-5";
export const fieldClass =
  "h-10 w-full rounded-[9px] border border-[#dce5f2] bg-white px-3 text-[12px] font-medium text-[#14213e] outline-none transition placeholder:font-normal placeholder:text-[#8a97ad] focus:border-[#6da4ff] focus:ring-2 focus:ring-[#075bff]/10";
export const fieldLabelClass =
  "mb-1.5 block text-[11px] font-semibold text-[#0b1538] sm:text-[12px]";
