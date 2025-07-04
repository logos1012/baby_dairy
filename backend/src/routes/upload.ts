import express from 'express';
import { uploadFiles, deleteFile } from '../controllers/localUploadController';
import { authMiddleware } from '../middleware/auth';
import { uploadMultiple } from '../middleware/upload';

const router = express.Router();

// 다중 파일 업로드 (최대 5개)
router.post(
  '/files',
  authMiddleware,
  uploadMultiple('files', 5),
  uploadFiles as any
);

// 파일 삭제
router.delete('/files', authMiddleware, deleteFile);

export default router;