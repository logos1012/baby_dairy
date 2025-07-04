"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const generateToken = (userId) => {
    return jsonwebtoken_1.default.sign({ userId }, env_1.config.jwtSecret, { expiresIn: env_1.config.jwtExpiresIn });
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    return jsonwebtoken_1.default.verify(token, env_1.config.jwtSecret);
};
exports.verifyToken = verifyToken;
//# sourceMappingURL=jwt.js.map