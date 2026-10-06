import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { jobRoutes } from './job.routes';
import { companyRoutes } from './company.routes';
import { applicationRoutes } from './application.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/jobs', jobRoutes);
router.use('/company', companyRoutes);
router.use('/applications', applicationRoutes);

export const apiRoutes = router;
