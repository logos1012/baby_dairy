import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const createComment: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getComments: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateComment: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteComment: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=commentController.d.ts.map