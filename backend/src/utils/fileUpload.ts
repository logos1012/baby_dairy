import multer from 'multer';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// 파일 타입 검증
export const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
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
  } else {
    cb(new Error('지원하지 않는 파일 형식입니다.'));
  }
};

// 파일 크기 제한 (10MB)
export const fileSizeLimit = 10 * 1024 * 1024;

// Multer 설정 (메모리 저장)
export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: fileSizeLimit,
  },
});

// 이미지 최적화
export const optimizeImage = async (buffer: Buffer, quality: number = 80): Promise<Buffer> => {
  try {
    return await sharp(buffer)
      .resize(1200, 1200, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .jpeg({ quality })
      .toBuffer();
  } catch (error) {
    console.error('Image optimization error:', error);
    throw new Error('이미지 최적화에 실패했습니다.');
  }
};

// 썸네일 생성
export const createThumbnail = async (buffer: Buffer, width: number = 300, height: number = 300): Promise<Buffer> => {
  try {
    return await sharp(buffer)
      .resize(width, height, { 
        fit: 'cover',
        position: 'center' 
      })
      .jpeg({ quality: 70 })
      .toBuffer();
  } catch (error) {
    console.error('Thumbnail creation error:', error);
    throw new Error('썸네일 생성에 실패했습니다.');
  }
};

// 파일 이름 생성
export const generateFileName = (originalName: string): string => {
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext);
  const timestamp = Date.now();
  const uuid = uuidv4().split('-')[0];
  
  return `${name}_${timestamp}_${uuid}${ext}`;
};

// 파일 타입 확인
export const isImage = (mimetype: string): boolean => {
  return mimetype.startsWith('image/');
};

export const isVideo = (mimetype: string): boolean => {
  return mimetype.startsWith('video/');
};

// 파일 크기를 읽기 쉬운 형태로 변환
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};