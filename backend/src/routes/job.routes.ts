import { Router } from 'express';
import { jobController } from '../controllers/job.controller';
import { validateQuery } from '../middlewares/validate.middleware';
import { optionalAuthenticate } from '../middlewares/auth.middleware';
import { jobQuerySchema } from '../validators/job.validator';

const router = Router();

router.get('/', validateQuery(jobQuerySchema), (req, res, next) => {
  jobController.getJobs(req, res, next);
});

router.get('/:id', optionalAuthenticate, (req, res, next) => {
  jobController.getJobById(req, res, next);
});

export const jobRoutes = router;
