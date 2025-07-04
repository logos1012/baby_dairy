import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { MulterRequest } from '../middleware/upload';
export declare const uploadFiles: (req: AuthRequest & MulterRequest, res: Response) => Promise<void>;
export declare const deleteFile: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getUploadProgress: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=uploadController.d.ts.map