import express from 'express';
import { uploadFiles, deleteFile, getUploadProgress } from '../controllers/uploadController';
import { authMiddleware } from '../middleware/auth';
import { uploadMultiple, requireFiles } from '../middleware/upload';

const router = express.Router();

// 다중 파일 업로드 (최대 5개)
router.post(
  '/files',
  authMiddleware,
  uploadMultiple('files', 5),
  requireFiles,
  uploadFiles
);

// 파일 삭제
router.delete('/files', authMiddleware, deleteFile);

// 업로드 진행률 조회
router.get('/progress/:uploadId', authMiddleware, getUploadProgress);

export default router;