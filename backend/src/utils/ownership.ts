import { Role } from '@prisma/client';
import { prisma } from '../config/db';
import { ForbiddenError, NotFoundError } from '../errors/AppError';
import { AuthenticatedUser } from '../types/auth.types';

/**
 * Verifies that a JobVacancy is owned by the authenticated company.
 * Throws NotFoundError if the job does not exist.
 * Throws ForbiddenError if the job is owned by a different company.
 */
export async function verifyJobOwnership(jobId: string, companyProfileId: string) {
  const job = await prisma.jobVacancy.findUnique({
    where: { id: jobId }
  });

  if (!job) {
    throw new NotFoundError('Job vacancy not found', 'NOT_FOUND');
  }

  if (job.companyId !== companyProfileId) {
    throw new ForbiddenError('You do not have permission to access or modify this job vacancy', 'FORBIDDEN_RESOURCE');
  }

  return job;
}

/**
 * Verifies that an Application belongs to a job posted by the authenticated company.
 * Throws NotFoundError if the application does not exist.
 * Throws ForbiddenError if the job belongs to another company.
 */
export async function verifyApplicationOwnership(applicationId: string, companyProfileId: string) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      job: true
    }
  });

  if (!application) {
    throw new NotFoundError('Application not found', 'NOT_FOUND');
  }

  if (application.job.companyId !== companyProfileId) {
    throw new ForbiddenError('You do not have permission to access or modify this application', 'FORBIDDEN_RESOURCE');
  }

  return application;
}

/**
 * Verifies that the caller has permission to view an application's history.
 * - For JOB_SEEKER: Must be the applicant (seekerId).
 * - For COMPANY: Must own the parent job (job.companyId).
 */
export async function verifyApplicationHistoryAccess(applicationId: string, user: AuthenticatedUser) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      job: true
    }
  });

  if (!application) {
    throw new NotFoundError('Application not found', 'NOT_FOUND');
  }

  if (user.role === Role.JOB_SEEKER) {
    if (application.seekerId !== user.userId) {
      throw new ForbiddenError('You do not have permission to view this application history', 'FORBIDDEN_RESOURCE');
    }
  } else if (user.role === Role.COMPANY) {
    if (!user.companyProfileId || application.job.companyId !== user.companyProfileId) {
      throw new ForbiddenError('You do not have permission to view this candidate application history', 'FORBIDDEN_RESOURCE');
    }
  }

  return application;
}
