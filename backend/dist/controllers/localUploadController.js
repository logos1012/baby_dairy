"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFile = exports.uploadFiles = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const util_1 = require("util");
const sharp_1 = __importDefault(require("sharp"));
const writeFile = (0, util_1.promisify)(fs_1.default.writeFile);
const mkdir = (0, util_1.promisify)(fs_1.default.mkdir);
const uploadFiles = async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            res.status(400).json({
                success: false,
                message: '업로드할 파일이 없습니다.',
            });
            return;
        }
        // uploads 디렉토리 생성
        const uploadsDir = path_1.default.join(process.cwd(), 'uploads');
        const imagesDir = path_1.default.join(uploadsDir, 'images');
        const thumbnailsDir = path_1.default.join(uploadsDir, 'thumbnails');
        try {
            await mkdir(uploadsDir, { recursive: true });
            await mkdir(imagesDir, { recursive: true });
            await mkdir(thumbnailsDir, { recursive: true });
        }
        catch (error) {
            // 디렉토리가 이미 존재하는 경우 무시
        }
        const uploadPromises = files.map(async (file) => {
            try {
                const timestamp = Date.now();
                const random = Math.random().toString(36).substring(2, 8);
                const extension = path_1.default.extname(file.originalname);
                const fileName = `${timestamp}_${random}${extension}`;
                const filePath = path_1.default.join(imagesDir, fileName);
                let processedBuffer = file.buffer;
                let thumbnailBuffer = null;
                // 이미지인 경우 최적화 및 썸네일 생성
                if (file.mimetype.startsWith('image/')) {
                    // 이미지 최적화 (최대 1920x1920, 품질 85%)
                    processedBuffer = await (0, sharp_1.default)(file.buffer)
                        .resize(1920, 1920, {
                        fit: 'inside',
                        withoutEnlargement: true
                    })
                        .jpeg({ quality: 85 })
                        .toBuffer();
                    // 썸네일 생성 (400x400)
                    thumbnailBuffer = await (0, sharp_1.default)(file.buffer)
                        .resize(400, 400, {
                        fit: 'cover',
                        position: 'center'
                    })
                        .jpeg({ quality: 80 })
                        .toBuffer();
                }
                // 메인 파일 저장
                await writeFile(filePath, processedBuffer);
                // 썸네일 저장
                let thumbnailUrl;
                if (thumbnailBuffer) {
                    const thumbnailFileName = `thumb_${fileName}`;
                    const thumbnailPath = path_1.default.join(thumbnailsDir, thumbnailFileName);
                    await writeFile(thumbnailPath, thumbnailBuffer);
                    thumbnailUrl = `/uploads/thumbnails/${thumbnailFileName}`;
                }
                const result = {
                    originalName: file.originalname,
                    fileName: fileName,
                    mimetype: file.mimetype,
                    size: processedBuffer.length,
                    url: `/uploads/images/${fileName}`,
                    thumbnailUrl,
                    resourceType: file.mimetype.startsWith('image/') ? 'image' : 'video',
                };
                return result;
            }
            catch (error) {
                console.error(`파일 처리 실패 (${file.originalname}):`, error);
                throw new Error(`파일 업로드 실패: ${file.originalname}`);
            }
        });
        const uploadedFiles = await Promise.all(uploadPromises);
        res.json({
            success: true,
            data: {
                files: uploadedFiles,
                count: uploadedFiles.length,
            },
            message: `${uploadedFiles.length}개의 파일이 성공적으로 업로드되었습니다.`,
        });
    }
    catch (error) {
        console.error('파일 업로드 오류:', error);
        res.status(500).json({
            success: false,
            message: error.message || '파일 업로드 중 오류가 발생했습니다.',
        });
    }
};
exports.uploadFiles = uploadFiles;
const deleteFile = async (req, res) => {
    try {
        const { fileName } = req.body;
        if (!fileName) {
            res.status(400).json({
                success: false,
                message: '삭제할 파일명이 필요합니다.',
            });
            return;
        }
        const filePath = path_1.default.join(process.cwd(), 'uploads', 'images', fileName);
        const thumbnailPath = path_1.default.join(process.cwd(), 'uploads', 'thumbnails', `thumb_${fileName}`);
        try {
            // 메인 파일 삭제
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
            // 썸네일 삭제
            if (fs_1.default.existsSync(thumbnailPath)) {
                fs_1.default.unlinkSync(thumbnailPath);
            }
            res.json({
                success: true,
                message: '파일이 성공적으로 삭제되었습니다.',
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: '파일 삭제에 실패했습니다.',
            });
        }
    }
    catch (error) {
        console.error('파일 삭제 오류:', error);
        res.status(500).json({
            success: false,
            message: '파일 삭제 중 오류가 발생했습니다.',
        });
    }
};
exports.deleteFile = deleteFile;
//# sourceMappingURL=localUploadController.js.map