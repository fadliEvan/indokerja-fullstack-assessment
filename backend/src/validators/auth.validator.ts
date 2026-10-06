import { z } from 'zod';
import { Role } from '@prisma/client';

export const registerSchema = z
  .object({
    email: z.string().trim().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    fullName: z.string().trim().min(2, 'Full name must be at least 2 characters long'),
    phone: z.string().trim().optional(),
    role: z.nativeEnum(Role, {
      errorMap: () => ({ message: 'Role must be either JOB_SEEKER or COMPANY' })
    }),
    // Company specific fields
    companyName: z.string().trim().optional(),
    industry: z.string().trim().optional(),
    location: z.string().trim().optional(),
    description: z.string().trim().optional(),
    website: z.string().trim().url('Website must be a valid URL').optional().or(z.literal(''))
  })
  .refine(
    (data) => {
      if (data.role === Role.COMPANY) {
        return typeof data.companyName === 'string' && data.companyName.trim().length >= 2;
      }
      return true;
    },
    {
      message: 'Company name is required and must be at least 2 characters for COMPANY registration',
      path: ['companyName']
    }
  );

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export type LoginInput = z.infer<typeof loginSchema>;
