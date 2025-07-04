"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const localUploadController_1 = require("../controllers/localUploadController");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = express_1.default.Router();
// 다중 파일 업로드 (최대 5개)
router.post('/files', auth_1.authMiddleware, (0, upload_1.uploadMultiple)('files', 5), localUploadController_1.uploadFiles);
// 파일 삭제
router.delete('/files', auth_1.authMiddleware, localUploadController_1.deleteFile);
exports.default = router;
//# sourceMappingURL=upload.js.map