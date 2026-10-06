import { Router } from 'express';
import { Role } from '@prisma/client';
import { applicationController } from '../controllers/application.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { applyJobSchema } from '../validators/application.validator';

const router = Router();

// Protect all job seeker application endpoints with Auth + Role guards
router.use(authenticate, requireRole(Role.JOB_SEEKER));

router.post('/apply', validateBody(applyJobSchema), (req, res, next) => {
  applicationController.apply(req, res, next);
});

router.get('/my-applications', (req, res, next) => {
  applicationController.getMyApplications(req, res, next);
});

router.get('/:id', (req, res, next) => {
  applicationController.getMyApplicationById(req, res, next);
});

export const applicationRoutes = router;
