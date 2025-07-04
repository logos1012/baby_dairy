import { Request, Response, NextFunction } from 'express';
import { upload } from '../utils/fileUpload';

export interface UploadedFile extends Express.Multer.File {
  optimizedBuffer?: Buffer;
  thumbnailBuffer?: Buffer;
  cloudinaryUrl?: string;
  thumbnailUrl?: string;
}

export interface MulterRequest extends Request {
  files?: UploadedFile[];
  file?: UploadedFile;
}

// 단일 파일 업로드
export const uploadSingle = (fieldName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    upload.single(fieldName)(req, res, (err: any) => {
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

// 다중 파일 업로드
export const uploadMultiple = (fieldName: string, maxCount: number = 5) => {
  return (req: Request, res: Response, next: NextFunction) => {
    upload.array(fieldName, maxCount)(req, res, (err: any) => {
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

// 파일 존재 확인 미들웨어
export const requireFiles = (req: MulterRequest, res: Response, next: NextFunction) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: '업로드할 파일이 없습니다.',
    });
  }
  
  next();
};