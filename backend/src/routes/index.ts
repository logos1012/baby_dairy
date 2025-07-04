import express from 'express';
import authRoutes from './auth';
import uploadRoutes from './upload';
import postRoutes from './posts';
import commentRoutes from './comments';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/upload', uploadRoutes);
router.use('/posts', postRoutes);
router.use('/', commentRoutes);

export default router;