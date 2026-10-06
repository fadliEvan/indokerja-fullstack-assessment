import { ApplicationStatus, JobStatus } from '@prisma/client';
import { prisma } from '../config/db';
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '../errors/AppError';
import { ApplyJobInput, UpdateApplicationStatusInput } from '../validators/application.validator';
import { verifyJobOwnership } from '../utils/ownership';

// Strict, unidirectional applicant status progression lifecycle
const ALLOWED_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  [ApplicationStatus.APPLIED]: [ApplicationStatus.REVIEWING],
  [ApplicationStatus.REVIEWING]: [ApplicationStatus.SHORTLISTED, ApplicationStatus.REJECTED],
  [ApplicationStatus.SHORTLISTED]: [ApplicationStatus.ACCEPTED, ApplicationStatus.REJECTED],
  [ApplicationStatus.ACCEPTED]: [],
  [ApplicationStatus.REJECTED]: []
};

export class ApplicationService {
  /**
   * Seeker applies to an open job vacancy.
   * Atomically creates Application + initial ApplicationHistory in a single transaction.
   */
  async applyForJob(seekerId: string, input: ApplyJobInput) {
    // 1. Verify job exists and is OPEN
    const job = await prisma.jobVacancy.findUnique({
      where: { id: input.jobId }
    });

    if (!job) {
      throw new NotFoundError('Job vacancy not found', 'NOT_FOUND');
    }

    if (job.status === JobStatus.CLOSED) {
      throw new BadRequestError('Cannot apply to a closed job vacancy', 'JOB_CLOSED');
    }

    // 2. Proactive check for single application rule
    const existing = await prisma.application.findUnique({
      where: {
        jobId_seekerId: {
          jobId: input.jobId,
          seekerId
        }
      }
    });

    if (existing) {
      throw new ConflictError('You have already applied for this job vacancy', 'DUPLICATE_APPLICATION');
    }

    // 3. Atomic creation
    const application = await prisma.$transaction(async (tx) => {
      const createdApp = await tx.application.create({
        data: {
          jobId: input.jobId,
          seekerId,
          coverNote: input.coverNote || null,
          resumeUrl: input.resumeUrl || null,
          status: ApplicationStatus.APPLIED
        },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              company: {
                select: { companyName: true }
              }
            }
          }
        }
      });

      await tx.applicationHistory.create({
        data: {
          applicationId: createdApp.id,
          previousStatus: null,
          newStatus: ApplicationStatus.APPLIED,
          changedById: seekerId,
          note: 'Application submitted'
        }
      });

      return createdApp;
    });

    return application;
  }

  /**
   * Retrieves all applications submitted by the authenticated seeker.
   */
  async getSeekerApplications(seekerId: string) {
    const applications = await prisma.application.findMany({
      where: { seekerId },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            jobType: true,
            company: {
              select: {
                id: true,
                companyName: true,
                location: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return applications;
  }

  /**
   * Retrieves detailed single application view with full history timeline for a seeker.
   */
  async getSeekerApplicationById(applicationId: string, seekerId: string) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: {
            company: {
              select: {
                id: true,
                companyName: true,
                location: true,
                industry: true
              }
            }
          }
        },
        history: {
          orderBy: { createdAt: 'asc' },
          include: {
            changedBy: {
              select: {
                id: true,
                fullName: true,
                role: true
              }
            }
          }
        }
      }
    });

    if (!application) {
      throw new NotFoundError('Application not found', 'NOT_FOUND');
    }

    if (application.seekerId !== seekerId) {
      throw new ForbiddenError('You do not have permission to view this application', 'FORBIDDEN_RESOURCE');
    }

    return application;
  }

  /**
   * Retrieves all candidate applications for a specific company job vacancy.
   */
  async getJobCandidates(jobId: string, companyProfileId: string) {
    // 1. Verify caller owns the job
    await verifyJobOwnership(jobId, companyProfileId);

    // 2. Fetch candidates
    const candidates = await prisma.application.findMany({
      where: { jobId },
      select: {
        id: true,
        status: true,
        coverNote: true,
        resumeUrl: true,
        createdAt: true,
        updatedAt: true,
        seeker: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return candidates;
  }

  /**
   * Updates an applicant's status with audit log inside a single Prisma transaction.
   */
  async updateApplicationStatus(
    applicationId: string,
    companyProfileId: string,
    recruiterUserId: string,
    input: UpdateApplicationStatusInput
  ) {
    return prisma.$transaction(async (tx) => {
      // 1. Load application with job to verify ownership
      const application = await tx.application.findUnique({
        where: { id: applicationId },
        include: { job: true }
      });

      if (!application) {
        throw new NotFoundError('Application not found', 'NOT_FOUND');
      }

      if (application.job.companyId !== companyProfileId) {
        throw new ForbiddenError('You do not have permission to update this candidate status', 'FORBIDDEN_RESOURCE');
      }

      // 2. Validate status lifecycle transition
      const currentStatus = application.status;
      const newStatus = input.status;
      const validNextStatuses = ALLOWED_TRANSITIONS[currentStatus];

      if (!validNextStatuses.includes(newStatus)) {
        throw new BadRequestError(
          `Invalid status transition from ${currentStatus} to ${newStatus}`,
          'INVALID_STATUS_TRANSITION'
        );
      }

      // 3. Update application status
      const updatedApplication = await tx.application.update({
        where: { id: applicationId },
        data: { status: newStatus }
      });

      // 4. Create chronological history record
      await tx.applicationHistory.create({
        data: {
          applicationId,
          previousStatus: currentStatus,
          newStatus,
          changedById: recruiterUserId,
          note: input.note || null
        }
      });

      return updatedApplication;
    });
  }

  /**
   * Retrieves the immutable history timeline for an application belonging to the caller company.
   */
  async getApplicationHistory(applicationId: string, companyProfileId: string) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true }
    });

    if (!application) {
      throw new NotFoundError('Application not found', 'NOT_FOUND');
    }

    if (application.job.companyId !== companyProfileId) {
      throw new ForbiddenError('You do not have permission to view this application history', 'FORBIDDEN_RESOURCE');
    }

    const history = await prisma.applicationHistory.findMany({
      where: { applicationId },
      orderBy: { createdAt: 'asc' },
      include: {
        changedBy: {
          select: {
            id: true,
            fullName: true,
            role: true
          }
        }
      }
    });

    return history;
  }
}

export const applicationService = new ApplicationService();
