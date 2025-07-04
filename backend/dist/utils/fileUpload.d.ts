import multer from 'multer';
export declare const fileFilter: (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => void;
export declare const fileSizeLimit: number;
export declare const upload: multer.Multer;
export declare const optimizeImage: (buffer: Buffer, quality?: number) => Promise<Buffer>;
export declare const createThumbnail: (buffer: Buffer, width?: number, height?: number) => Promise<Buffer>;
export declare const generateFileName: (originalName: string) => string;
export declare const isImage: (mimetype: string) => boolean;
export declare const isVideo: (mimetype: string) => boolean;
export declare const formatFileSize: (bytes: number) => string;
//# sourceMappingURL=fileUpload.d.ts.map