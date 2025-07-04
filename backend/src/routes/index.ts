import express from 'express';
import authRoutes from './auth';
import uploadRoutes from './upload';
import postRoutes from './posts';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/upload', uploadRoutes);
router.use('/posts', postRoutes);

export default router;