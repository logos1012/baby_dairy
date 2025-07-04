import express from 'express';
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
} from '../controllers/postController';
import { authMiddleware } from '../middleware/auth';
import { checkFamilyMembership, checkPostOwnership } from '../middleware/family';
import { validateRequest, postValidation } from '../middleware/validation';

const router = express.Router();

// 게시물 목록 조회
router.get(
  '/',
  authMiddleware,
  checkFamilyMembership,
  validateRequest(postValidation.getList),
  getPosts
);

// 게시물 작성
router.post(
  '/',
  authMiddleware,
  checkFamilyMembership,
  validateRequest(postValidation.create),
  createPost
);

// 게시물 상세 조회
router.get(
  '/:id',
  authMiddleware,
  checkFamilyMembership,
  validateRequest(postValidation.getById),
  checkPostOwnership,
  getPostById
);

// 게시물 수정
router.put(
  '/:id',
  authMiddleware,
  checkFamilyMembership,
  validateRequest(postValidation.update),
  checkPostOwnership,
  updatePost
);

// 게시물 삭제
router.delete(
  '/:id',
  authMiddleware,
  checkFamilyMembership,
  validateRequest(postValidation.delete),
  checkPostOwnership,
  deletePost
);

// 게시물 좋아요/취소
router.post(
  '/:id/like',
  authMiddleware,
  checkFamilyMembership,
  validateRequest(postValidation.getById),
  checkPostOwnership,
  likePost
);

export default router;