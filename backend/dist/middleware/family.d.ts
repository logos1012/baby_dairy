import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
export declare const checkFamilyMembership: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const checkPostOwnership: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=family.d.ts.map