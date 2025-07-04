"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
router.post('/register', (0, validation_1.validateRequest)(validation_1.authValidation.register), authController_1.register);
router.post('/login', (0, validation_1.validateRequest)(validation_1.authValidation.login), authController_1.login);
router.get('/me', auth_1.authMiddleware, authController_1.getMe);
router.post('/logout', auth_1.authMiddleware, authController_1.logout);
exports.default = router;
//# sourceMappingURL=auth.js.map