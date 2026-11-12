import { z } from 'zod';
import { ReportStatus } from '../../common/enums.js';
import { idParam, pagination, queryId } from '../../common/validation.js';

export const createReportSchema = z.object({
  reporterId: idParam,
  bookingId: idParam.nullable().optional(),
  venueId: idParam.nullable().optional(),
  content: z.string().trim().min(1),
});

/** Admin handles a report */
export const updateReportSchema = z.object({
  content: z.string().trim().min(1).optional(),
  status: z.enum(ReportStatus).optional(),
  handledBy: idParam.nullable().optional(),
  adminNote: z.string().nullable().optional(),
});

export const queryReportsSchema = z.object({
  ...pagination,
  status: z.enum(ReportStatus).optional(),
  reporterId: queryId,
  venueId: queryId,
  bookingId: queryId,
  handledBy: queryId,
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
export type UpdateReportInput = z.infer<typeof updateReportSchema>;
export type QueryReportsInput = z.infer<typeof queryReportsSchema>;
