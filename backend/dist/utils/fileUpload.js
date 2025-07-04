"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatFileSize = exports.isVideo = exports.isImage = exports.generateFileName = exports.createThumbnail = exports.optimizeImage = exports.upload = exports.fileSizeLimit = exports.fileFilter = void 0;
const multer_1 = __importDefault(require("multer"));
const sharp_1 = __importDefault(require("sharp"));
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
// 파일 타입 검증
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/mov',
        'video/avi',
        'video/mkv',
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('지원하지 않는 파일 형식입니다.'));
    }
};
exports.fileFilter = fileFilter;
// 파일 크기 제한 (10MB)
exports.fileSizeLimit = 10 * 1024 * 1024;
// Multer 설정 (메모리 저장)
exports.upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    fileFilter: exports.fileFilter,
    limits: {
        fileSize: exports.fileSizeLimit,
    },
});
// 이미지 최적화
const optimizeImage = async (buffer, quality = 80) => {
    try {
        return await (0, sharp_1.default)(buffer)
            .resize(1200, 1200, {
            fit: 'inside',
            withoutEnlargement: true
        })
            .jpeg({ quality })
            .toBuffer();
    }
    catch (error) {
        console.error('Image optimization error:', error);
        throw new Error('이미지 최적화에 실패했습니다.');
    }
};
exports.optimizeImage = optimizeImage;
// 썸네일 생성
const createThumbnail = async (buffer, width = 300, height = 300) => {
    try {
        return await (0, sharp_1.default)(buffer)
            .resize(width, height, {
            fit: 'cover',
            position: 'center'
        })
            .jpeg({ quality: 70 })
            .toBuffer();
    }
    catch (error) {
        console.error('Thumbnail creation error:', error);
        throw new Error('썸네일 생성에 실패했습니다.');
    }
};
exports.createThumbnail = createThumbnail;
// 파일 이름 생성
const generateFileName = (originalName) => {
    const ext = path_1.default.extname(originalName);
    const name = path_1.default.basename(originalName, ext);
    const timestamp = Date.now();
    const uuid = (0, uuid_1.v4)().split('-')[0];
    return `${name}_${timestamp}_${uuid}${ext}`;
};
exports.generateFileName = generateFileName;
// 파일 타입 확인
const isImage = (mimetype) => {
    return mimetype.startsWith('image/');
};
exports.isImage = isImage;
const isVideo = (mimetype) => {
    return mimetype.startsWith('video/');
};
exports.isVideo = isVideo;
// 파일 크기를 읽기 쉬운 형태로 변환
const formatFileSize = (bytes) => {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
exports.formatFileSize = formatFileSize;
//# sourceMappingURL=fileUpload.js.map