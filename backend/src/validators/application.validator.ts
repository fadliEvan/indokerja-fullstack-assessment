import { z } from 'zod';
import { ApplicationStatus } from '@prisma/client';

export const applyJobSchema = z.object({
  jobId: z.string().uuid('Invalid job ID format'),
  coverNote: z.string().trim().max(2000, 'Cover note cannot exceed 2000 characters').optional().nullable(),
  resumeUrl: z.string().trim().url('Resume URL must be a valid URL format').optional().nullable().or(z.literal(''))
});

export type ApplyJobInput = z.infer<typeof applyJobSchema>;

export const updateApplicationStatusSchema = z.object({
  status: z.nativeEnum(ApplicationStatus, {
    errorMap: () => ({ message: 'Invalid application status' })
  }),
  note: z.string().trim().max(1000, 'Note cannot exceed 1000 characters').optional().nullable()
});

export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;
