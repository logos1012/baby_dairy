"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const database_1 = __importDefault(require("../config/database"));
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            res.status(401).json({
                success: false,
                message: '접근 권한이 없습니다. 토큰이 필요합니다.',
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, env_1.config.jwtSecret);
        const user = await database_1.default.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, name: true },
        });
        if (!user) {
            res.status(401).json({
                success: false,
                message: '유효하지 않은 토큰입니다.',
            });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: '유효하지 않은 토큰입니다.',
        });
        return;
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=auth.js.map