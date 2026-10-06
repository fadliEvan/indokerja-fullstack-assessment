import { JobStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/db';
import { NotFoundError } from '../errors/AppError';
import { CreateJobInput, JobQueryInput } from '../validators/job.validator';

export class JobService {
  /**
   * Retrieves public open job vacancies with optional query filters.
   */
  async getPublicJobs(filters: JobQueryInput) {
    const where: Prisma.JobVacancyWhereInput = {
      status: JobStatus.OPEN
    };

    if (filters.keyword) {
      where.OR = [
        { title: { contains: filters.keyword, mode: 'insensitive' } },
        { description: { contains: filters.keyword, mode: 'insensitive' } }
      ];
    }

    if (filters.location) {
      where.location = { contains: filters.location, mode: 'insensitive' };
    }

    if (filters.jobType) {
      where.jobType = filters.jobType;
    }

    const jobs = await prisma.jobVacancy.findMany({
      where,
      select: {
        id: true,
        title: true,
        location: true,
        jobType: true,
        salaryMin: true,
        salaryMax: true,
        isNegotiable: true,
        status: true,
        createdAt: true,
        company: {
          select: {
            id: true,
            companyName: true,
            industry: true,
            location: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return jobs;
  }

  /**
   * Retrieves full details for a single job vacancy.
   * If caller is an authenticated Job Seeker, indicates whether they have already applied.
   */
  async getPublicJobById(id: string, authenticatedUserId?: string) {
    const job = await prisma.jobVacancy.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            companyName: true,
            industry: true,
            location: true,
            description: true,
            website: true
          }
        }
      }
    });

    if (!job) {
      throw new NotFoundError('Job vacancy not found', 'NOT_FOUND');
    }

    let hasApplied = false;
    let userApplicationStatus: string | null = null;

    if (authenticatedUserId) {
      const existingApp = await prisma.application.findUnique({
        where: {
          jobId_seekerId: {
            jobId: id,
            seekerId: authenticatedUserId
          }
        },
        select: {
          id: true,
          status: true
        }
      });

      if (existingApp) {
        hasApplied = true;
        userApplicationStatus = existingApp.status;
      }
    }

    return {
      ...job,
      hasApplied,
      userApplicationStatus
    };
  }

  /**
   * Creates a new job vacancy under the authenticated company's profile.
   */
  async createCompanyJob(companyProfileId: string, data: CreateJobInput) {
    const job = await prisma.jobVacancy.create({
      data: {
        companyId: companyProfileId,
        title: data.title,
        description: data.description,
        requirements: data.requirements,
        location: data.location,
        jobType: data.jobType,
        salaryMin: data.salaryMin ?? null,
        salaryMax: data.salaryMax ?? null,
        isNegotiable: data.isNegotiable ?? false,
        status: JobStatus.OPEN
      },
      include: {
        company: {
          select: {
            id: true,
            companyName: true,
            location: true
          }
        }
      }
    });

    return job;
  }

  /**
   * Retrieves all vacancies posted by the authenticated company.
   */
  async getCompanyJobs(companyProfileId: string) {
    const jobs = await prisma.jobVacancy.findMany({
      where: { companyId: companyProfileId },
      include: {
        _count: {
          select: { applications: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return jobs.map((j) => ({
      ...j,
      applicantCount: j._count.applications
    }));
  }
}

export const jobService = new JobService();
