import express from 'express';
import { register, login, getMe, logout } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';
import { validateRequest, authValidation } from '../middleware/validation';

const router = express.Router();

router.post('/register', validateRequest(authValidation.register), register);
router.post('/login', validateRequest(authValidation.login), login);
router.get('/me', authMiddleware, getMe);
router.post('/logout', authMiddleware, logout);

export default router;