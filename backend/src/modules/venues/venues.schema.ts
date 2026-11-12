import { z } from 'zod';
import { VenueStatus } from '@/common/enums.js';
import { idParam, pagination } from '@/common/validation.js';

const amenityIds = z
  .array(idParam)
  .refine((ids) => new Set(ids).size === ids.length, 'amenityIds must be unique');

export const createVenueSchema = z.object({
  /** Required for admins; owners always create venues for themselves. */
  ownerId: idParam.optional(),
  name: z.string().trim().min(1).max(150),
  address: z.string().trim().min(1).max(255),
  district: z.string().trim().min(1).max(100),
  city: z.string().trim().min(1).max(100),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
  description: z.string().nullable().optional(),
  coverImageUrl: z.string().nullable().optional(),
  /** extra VND added on weekends */
  weekendSurcharge: z.number().int().min(0).optional(),
  bankName: z.string().max(100).nullable().optional(),
  bankAccountNo: z.string().max(50).nullable().optional(),
  bankAccountHolder: z.string().max(100).nullable().optional(),
  /** amenity ids to attach */
  amenityIds: amenityIds.optional(),
});

/** Owner can't be changed; status goes through PATCH /venues/:id/review */
export const updateVenueSchema = createVenueSchema.omit({ ownerId: true }).partial();

export const reviewVenueSchema = z.object({
  status: z.enum(VenueStatus),
  /** admin user id */
  reviewedBy: idParam,
  reviewNote: z.string().max(500).nullable().optional(),
});

export const setAmenitiesSchema = z.object({ amenityIds });

export const queryVenuesSchema = z.object({
  ...pagination,
  ownerId: idParam.optional(),
  status: z.enum(VenueStatus).optional(),
  city: z.string().trim().min(1).optional(),
  district: z.string().trim().min(1).optional(),
  /** search by name or address */
  search: z.string().trim().min(1).optional(),
  sort: z.enum(['newest', 'name']).default('newest'),
});

export type CreateVenueInput = z.infer<typeof createVenueSchema>;
export type UpdateVenueInput = z.infer<typeof updateVenueSchema>;
export type ReviewVenueInput = z.infer<typeof reviewVenueSchema>;
export type QueryVenuesInput = z.infer<typeof queryVenuesSchema>;
