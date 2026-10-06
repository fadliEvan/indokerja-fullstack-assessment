import { Request, Response, NextFunction } from 'express';
import { jobService } from '../services/job.service';
import { UnauthorizedError } from '../errors/AppError';

export class JobController {
  async getJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const jobs = await jobService.getPublicJobs(req.query);
      res.status(200).json({
        success: true,
        message: 'Job vacancies retrieved successfully',
        data: { jobs }
      });
    } catch (error) {
      next(error);
    }
  }

  async getJobById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const job = await jobService.getPublicJobById(id, req.user?.userId);
      res.status(200).json({
        success: true,
        message: 'Job vacancy retrieved successfully',
        data: { job }
      });
    } catch (error) {
      next(error);
    }
  }

  async createJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.companyProfileId) {
        throw new UnauthorizedError('Company profile session required', 'UNAUTHORIZED');
      }

      const job = await jobService.createCompanyJob(req.user.companyProfileId, req.body);
      res.status(201).json({
        success: true,
        message: 'Job vacancy created successfully',
        data: { job }
      });
    } catch (error) {
      next(error);
    }
  }

  async getCompanyJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.companyProfileId) {
        throw new UnauthorizedError('Company profile session required', 'UNAUTHORIZED');
      }

      const jobs = await jobService.getCompanyJobs(req.user.companyProfileId);
      res.status(200).json({
        success: true,
        message: 'Company jobs retrieved successfully',
        data: { jobs }
      });
    } catch (error) {
      next(error);
    }
  }
}

export const jobController = new JobController();
