import { Router } from 'express';
import { Role } from '@prisma/client';
import { jobController } from '../controllers/job.controller';
import { applicationController } from '../controllers/application.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { createJobSchema } from '../validators/job.validator';
import { updateApplicationStatusSchema } from '../validators/application.validator';

const router = Router();

// Protect all company endpoints with Auth + Role guards
router.use(authenticate, requireRole(Role.COMPANY));

// Job vacancy management
router.post('/jobs', validateBody(createJobSchema), (req, res, next) => {
  jobController.createJob(req, res, next);
});

router.get('/my-jobs', (req, res, next) => {
  jobController.getCompanyJobs(req, res, next);
});

// Candidate & application management
router.get('/jobs/:jobId/candidates', (req, res, next) => {
  applicationController.getJobCandidates(req, res, next);
});

router.patch('/applications/:id/status', validateBody(updateApplicationStatusSchema), (req, res, next) => {
  applicationController.updateStatus(req, res, next);
});

router.get('/applications/:id/history', (req, res, next) => {
  applicationController.getHistory(req, res, next);
});

export const companyRoutes = router;
