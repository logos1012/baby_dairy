import express from 'express';
import { authMiddleware } from '../middleware/auth';
import { checkFamilyMembership } from '../middleware/family';
import { validateRequest } from '../middleware/validation';
import { 
  createComment, 
  getComments, 
  updateComment, 
  deleteComment 
} from '../controllers/commentController';
import Joi from 'joi';

const router = express.Router();

// 댓글 validation schemas
const commentValidation = {
  create: {
    body: Joi.object({
      content: Joi.string().min(1).max(1000).required().messages({
        'string.min': '댓글 내용을 입력해주세요.',
        'string.max': '댓글은 최대 1000자까지 입력 가능합니다.',
        'any.required': '댓글 내용은 필수 입력 항목입니다.',
      }),
    }),
    params: Joi.object({
      postId: Joi.string().required().messages({
        'any.required': '게시물 ID가 필요합니다.',
      }),
    }),
  },
  update: {
    body: Joi.object({
      content: Joi.string().min(1).max(1000).required().messages({
        'string.min': '댓글 내용을 입력해주세요.',
        'string.max': '댓글은 최대 1000자까지 입력 가능합니다.',
        'any.required': '댓글 내용은 필수 입력 항목입니다.',
      }),
    }),
    params: Joi.object({
      id: Joi.string().required().messages({
        'any.required': '댓글 ID가 필요합니다.',
      }),
    }),
  },
  delete: {
    params: Joi.object({
      id: Joi.string().required().messages({
        'any.required': '댓글 ID가 필요합니다.',
      }),
    }),
  },
  getList: {
    params: Joi.object({
      postId: Joi.string().required().messages({
        'any.required': '게시물 ID가 필요합니다.',
      }),
    }),
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1).messages({
        'number.base': '페이지는 숫자여야 합니다.',
        'number.integer': '페이지는 정수여야 합니다.',
        'number.min': '페이지는 1 이상이어야 합니다.',
      }),
      limit: Joi.number().integer().min(1).max(50).default(20).messages({
        'number.base': '제한은 숫자여야 합니다.',
        'number.integer': '제한은 정수여야 합니다.',
        'number.min': '제한은 1 이상이어야 합니다.',
        'number.max': '제한은 50 이하여야 합니다.',
      }),
    }),
  },
};

// 게시물의 댓글 조회
router.get(
  '/posts/:postId/comments',
  authMiddleware,
  checkFamilyMembership,
  validateRequest(commentValidation.getList),
  getComments
);

// 댓글 생성
router.post(
  '/posts/:postId/comments',
  authMiddleware,
  checkFamilyMembership,
  validateRequest(commentValidation.create),
  createComment
);

// 댓글 수정
router.put(
  '/comments/:id',
  authMiddleware,
  validateRequest(commentValidation.update),
  updateComment
);

// 댓글 삭제
router.delete(
  '/comments/:id',
  authMiddleware,
  validateRequest(commentValidation.delete),
  deleteComment
);

export default router;