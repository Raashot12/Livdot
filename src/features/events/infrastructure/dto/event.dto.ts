import { z } from "zod";
import { EVENT_STATUSES } from "../../domain/types/event-status";

const seatMapIdSchema = z.union([z.string().min(1), z.number().int()]);

const seatMapSeatSchema = z.object({
  id: seatMapIdSchema,
  title: z.string().min(1),
  x: z.number().finite(),
  y: z.number().finite(),
  salable: z.boolean(),
  color: z.string().optional(),
  note: z.string().optional(),
  row: z.string().optional(),
  price: z.number().nonnegative().optional(),
  currency: z.string().length(3).optional(),
  custom_data: z.record(z.string(), z.unknown()).optional(),
});

const seatMapSchema = z.object({
  blocks: z.array(
    z.object({
      id: seatMapIdSchema,
      title: z.string().min(1),
      color: z.string().optional(),
      price: z.number().nonnegative().optional(),
      currency: z.string().length(3).optional(),
      x: z.number().finite().optional(),
      y: z.number().finite().optional(),
      labels: z
        .array(
          z.object({
            title: z.string(),
            x: z.number().finite(),
            y: z.number().finite(),
          }),
        )
        .optional(),
      seats: z.array(seatMapSeatSchema),
    }),
  ),
  maxSelectable: z.number().int().positive().optional(),
  stageLabel: z.string().optional(),
});

const ticketOptionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  currency: z.string().length(3).optional(),
  quantityAvailable: z.number().int().nonnegative().nullable().optional(),
  maxPerOrder: z.number().int().positive().optional(),
});

export const eventDtoSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  description: z.string(),
  status: z.enum(EVENT_STATUSES),
  readiness: z.object({
    crewAssigned: z.boolean(),
    ingestConfigured: z.boolean(),
    ticketPricingConfigured: z.boolean(),
  }),
  scheduledAt: z.string().nullable(),
  seatMap: seatMapSchema.nullable().optional(),
  ticketOptions: z.array(ticketOptionSchema).nullable().optional(),
  version: z.number().int().nonnegative(),
});
export type EventDto = z.infer<typeof eventDtoSchema>;

export const createEventRequestSchema = z.object({
  title: z.string().trim().min(3).max(100),
  description: z.string().max(2000),
  status: z.enum(["DRAFT", "SCHEDULED"]),
  readiness: eventDtoSchema.shape.readiness,
  scheduledAt: z.string().datetime().nullable(),
  seatMap: seatMapSchema.nullable().optional(),
  ticketOptions: z.array(ticketOptionSchema).nullable().optional(),
});
export type CreateEventRequest = z.infer<typeof createEventRequestSchema>;

export const updateEventReadinessRequestSchema = eventDtoSchema.shape.readiness
  .partial()
  .refine((readiness) => Object.keys(readiness).length > 0);
export type UpdateEventReadinessRequest = z.infer<
  typeof updateEventReadinessRequestSchema
>;
