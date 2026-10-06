import { z } from 'zod';
import { JobType } from '@prisma/client';

export const createJobSchema = z
  .object({
    title: z.string().trim().min(3, 'Title must be at least 3 characters long').max(100, 'Title cannot exceed 100 characters'),
    description: z.string().trim().min(10, 'Description must be at least 10 characters long'),
    requirements: z.string().trim().min(10, 'Requirements must be at least 10 characters long'),
    location: z.string().trim().min(2, 'Location is required'),
    jobType: z.nativeEnum(JobType, {
      errorMap: () => ({ message: 'Invalid job type' })
    }),
    salaryMin: z.number().int().positive('Salary min must be positive').optional().nullable(),
    salaryMax: z.number().int().positive('Salary max must be positive').optional().nullable(),
    isNegotiable: z.boolean().optional().default(false)
  })
  .refine(
    (data) => {
      if (typeof data.salaryMin === 'number' && typeof data.salaryMax === 'number') {
        return data.salaryMin <= data.salaryMax;
      }
      return true;
    },
    {
      message: 'Minimum salary cannot exceed maximum salary',
      path: ['salaryMin']
    }
  );

export type CreateJobInput = z.infer<typeof createJobSchema>;

export const jobQuerySchema = z.object({
  keyword: z.string().trim().optional(),
  jobType: z.nativeEnum(JobType).optional(),
  location: z.string().trim().optional()
});

export type JobQueryInput = z.infer<typeof jobQuerySchema>;
