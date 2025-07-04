import { Request, Response, NextFunction } from 'express';
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
export declare const uploadSingle: (fieldName: string) => (req: Request, res: Response, next: NextFunction) => void;
export declare const uploadMultiple: (fieldName: string, maxCount?: number) => (req: Request, res: Response, next: NextFunction) => void;
export declare const requireFiles: (req: MulterRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=upload.d.ts.map