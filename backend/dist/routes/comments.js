"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const family_1 = require("../middleware/family");
const validation_1 = require("../middleware/validation");
const commentController_1 = require("../controllers/commentController");
const joi_1 = __importDefault(require("joi"));
const router = express_1.default.Router();
// 댓글 validation schemas
const commentValidation = {
    create: {
        body: joi_1.default.object({
            content: joi_1.default.string().min(1).max(1000).required().messages({
                'string.min': '댓글 내용을 입력해주세요.',
                'string.max': '댓글은 최대 1000자까지 입력 가능합니다.',
                'any.required': '댓글 내용은 필수 입력 항목입니다.',
            }),
        }),
        params: joi_1.default.object({
            postId: joi_1.default.string().required().messages({
                'any.required': '게시물 ID가 필요합니다.',
            }),
        }),
    },
    update: {
        body: joi_1.default.object({
            content: joi_1.default.string().min(1).max(1000).required().messages({
                'string.min': '댓글 내용을 입력해주세요.',
                'string.max': '댓글은 최대 1000자까지 입력 가능합니다.',
                'any.required': '댓글 내용은 필수 입력 항목입니다.',
            }),
        }),
        params: joi_1.default.object({
            id: joi_1.default.string().required().messages({
                'any.required': '댓글 ID가 필요합니다.',
            }),
        }),
    },
    delete: {
        params: joi_1.default.object({
            id: joi_1.default.string().required().messages({
                'any.required': '댓글 ID가 필요합니다.',
            }),
        }),
    },
    getList: {
        params: joi_1.default.object({
            postId: joi_1.default.string().required().messages({
                'any.required': '게시물 ID가 필요합니다.',
            }),
        }),
        query: joi_1.default.object({
            page: joi_1.default.number().integer().min(1).default(1).messages({
                'number.base': '페이지는 숫자여야 합니다.',
                'number.integer': '페이지는 정수여야 합니다.',
                'number.min': '페이지는 1 이상이어야 합니다.',
            }),
            limit: joi_1.default.number().integer().min(1).max(50).default(20).messages({
                'number.base': '제한은 숫자여야 합니다.',
                'number.integer': '제한은 정수여야 합니다.',
                'number.min': '제한은 1 이상이어야 합니다.',
                'number.max': '제한은 50 이하여야 합니다.',
            }),
        }),
    },
};
// 게시물의 댓글 조회
router.get('/posts/:postId/comments', auth_1.authMiddleware, family_1.checkFamilyMembership, (0, validation_1.validateRequest)(commentValidation.getList), commentController_1.getComments);
// 댓글 생성
router.post('/posts/:postId/comments', auth_1.authMiddleware, family_1.checkFamilyMembership, (0, validation_1.validateRequest)(commentValidation.create), commentController_1.createComment);
// 댓글 수정
router.put('/comments/:id', auth_1.authMiddleware, (0, validation_1.validateRequest)(commentValidation.update), commentController_1.updateComment);
// 댓글 삭제
router.delete('/comments/:id', auth_1.authMiddleware, (0, validation_1.validateRequest)(commentValidation.delete), commentController_1.deleteComment);
exports.default = router;
//# sourceMappingURL=comments.js.map