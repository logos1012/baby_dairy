import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const createPost: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getPosts: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getPostById: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updatePost: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deletePost: (req: AuthRequest, res: Response) => Promise<void>;
export declare const likePost: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=postController.d.ts.map