import { Request, Response, NextFunction } from 'express';
import { applicationService } from '../services/application.service';
import { UnauthorizedError } from '../errors/AppError';

function getParamString(param: string | string[]): string {
  return Array.isArray(param) ? param[0] : param;
}

export class ApplicationController {
  async apply(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new UnauthorizedError('Job seeker authentication required', 'UNAUTHORIZED');
      }

      const application = await applicationService.applyForJob(req.user.userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: { application }
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyApplications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new UnauthorizedError('Job seeker authentication required', 'UNAUTHORIZED');
      }

      const applications = await applicationService.getSeekerApplications(req.user.userId);
      res.status(200).json({
        success: true,
        message: 'Applications retrieved successfully',
        data: { applications }
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyApplicationById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new UnauthorizedError('Job seeker authentication required', 'UNAUTHORIZED');
      }

      const id = getParamString(req.params.id);
      const application = await applicationService.getSeekerApplicationById(id, req.user.userId);
      res.status(200).json({
        success: true,
        message: 'Application details retrieved successfully',
        data: { application }
      });
    } catch (error) {
      next(error);
    }
  }

  async getJobCandidates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.companyProfileId) {
        throw new UnauthorizedError('Company profile session required', 'UNAUTHORIZED');
      }

      const jobId = getParamString(req.params.jobId);
      const candidates = await applicationService.getJobCandidates(jobId, req.user.companyProfileId);
      res.status(200).json({
        success: true,
        message: 'Candidates retrieved successfully',
        data: { candidates }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.companyProfileId) {
        throw new UnauthorizedError('Company profile session required', 'UNAUTHORIZED');
      }

      const id = getParamString(req.params.id);
      const application = await applicationService.updateApplicationStatus(
        id,
        req.user.companyProfileId,
        req.user.userId,
        req.body
      );

      res.status(200).json({
        success: true,
        message: 'Candidate status updated successfully',
        data: { application }
      });
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.companyProfileId) {
        throw new UnauthorizedError('Company profile session required', 'UNAUTHORIZED');
      }

      const id = getParamString(req.params.id);
      const history = await applicationService.getApplicationHistory(id, req.user.companyProfileId);
      res.status(200).json({
        success: true,
        message: 'Application history retrieved successfully',
        data: { history }
      });
    } catch (error) {
      next(error);
    }
  }
}

export const applicationController = new ApplicationController();
