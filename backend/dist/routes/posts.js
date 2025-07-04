"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const postController_1 = require("../controllers/postController");
const auth_1 = require("../middleware/auth");
const family_1 = require("../middleware/family");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
// 게시물 목록 조회
router.get('/', auth_1.authMiddleware, family_1.checkFamilyMembership, (0, validation_1.validateRequest)(validation_1.postValidation.getList), postController_1.getPosts);
// 게시물 작성
router.post('/', auth_1.authMiddleware, family_1.checkFamilyMembership, (0, validation_1.validateRequest)(validation_1.postValidation.create), postController_1.createPost);
// 게시물 상세 조회
router.get('/:id', auth_1.authMiddleware, family_1.checkFamilyMembership, (0, validation_1.validateRequest)(validation_1.postValidation.getById), family_1.checkPostOwnership, postController_1.getPostById);
// 게시물 수정
router.put('/:id', auth_1.authMiddleware, family_1.checkFamilyMembership, (0, validation_1.validateRequest)(validation_1.postValidation.update), family_1.checkPostOwnership, postController_1.updatePost);
// 게시물 삭제
router.delete('/:id', auth_1.authMiddleware, family_1.checkFamilyMembership, (0, validation_1.validateRequest)(validation_1.postValidation.delete), family_1.checkPostOwnership, postController_1.deletePost);
// 게시물 좋아요/취소
router.post('/:id/like', auth_1.authMiddleware, family_1.checkFamilyMembership, (0, validation_1.validateRequest)(validation_1.postValidation.getById), family_1.checkPostOwnership, postController_1.likePost);
exports.default = router;
//# sourceMappingURL=posts.js.map