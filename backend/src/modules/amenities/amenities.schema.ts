import { z } from 'zod';

export const createAmenitySchema = z.object({
  name: z.string().trim().min(1).max(100),
});

export const updateAmenitySchema = createAmenitySchema.partial();

export type CreateAmenityInput = z.infer<typeof createAmenitySchema>;
export type UpdateAmenityInput = z.infer<typeof updateAmenitySchema>;
