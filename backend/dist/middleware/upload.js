"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireFiles = exports.uploadMultiple = exports.uploadSingle = void 0;
const fileUpload_1 = require("../utils/fileUpload");
// 단일 파일 업로드
const uploadSingle = (fieldName) => {
    return (req, res, next) => {
        fileUpload_1.upload.single(fieldName)(req, res, (err) => {
            if (err) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        success: false,
                        message: '파일 크기가 너무 큽니다. 10MB 이하의 파일을 선택해주세요.',
                    });
                }
                return res.status(400).json({
                    success: false,
                    message: err.message || '파일 업로드 중 오류가 발생했습니다.',
                });
            }
            next();
        });
    };
};
exports.uploadSingle = uploadSingle;
// 다중 파일 업로드
const uploadMultiple = (fieldName, maxCount = 5) => {
    return (req, res, next) => {
        fileUpload_1.upload.array(fieldName, maxCount)(req, res, (err) => {
            if (err) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        success: false,
                        message: '파일 크기가 너무 큽니다. 10MB 이하의 파일을 선택해주세요.',
                    });
                }
                if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                    return res.status(400).json({
                        success: false,
                        message: `최대 ${maxCount}개의 파일만 업로드할 수 있습니다.`,
                    });
                }
                return res.status(400).json({
                    success: false,
                    message: err.message || '파일 업로드 중 오류가 발생했습니다.',
                });
            }
            next();
        });
    };
};
exports.uploadMultiple = uploadMultiple;
// 파일 존재 확인 미들웨어
const requireFiles = (req, res, next) => {
    if (!req.files || req.files.length === 0) {
        res.status(400).json({
            success: false,
            message: '업로드할 파일이 없습니다.',
        });
        return;
    }
    next();
};
exports.requireFiles = requireFiles;
//# sourceMappingURL=upload.js.map