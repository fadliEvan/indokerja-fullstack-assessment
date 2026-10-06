import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { registerSchema, loginSchema } from '../validators/auth.validator';

const router = Router();

router.post('/register', validateBody(registerSchema), (req, res, next) => {
  authController.register(req, res, next);
});

router.post('/login', validateBody(loginSchema), (req, res, next) => {
  authController.login(req, res, next);
});

router.get('/me', authenticate, (req, res, next) => {
  authController.me(req, res, next);
});

router.post('/logout', (req, res, next) => {
  authController.logout(req, res, next);
});

export const authRoutes = router;
