import { z } from "zod";

export const queryStringParametersSchema = z.object({});

export const pathParametersSchema = z.object({});

const frontendEventSchema = z.object({
  name: z.string().min(1).max(200),
  attributes: z
    .record(z.union([z.string(), z.number(), z.boolean()]))
    .optional(),
  timestamp: z.number().optional(),
  duration: z.number().nonnegative().optional(),
  status: z.enum(["ok", "error"]).optional(),
  statusMessage: z.string().max(500).optional(),
});

export const payloadSchema = z.object({
  flowName: z.string().min(1).max(200),
  attributes: z
    .record(z.union([z.string(), z.number(), z.boolean()]))
    .optional(),
  events: z.array(frontendEventSchema).min(1).max(100),
});

export type FrontendEvent = z.infer<typeof frontendEventSchema>;
