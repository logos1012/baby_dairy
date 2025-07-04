import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
export declare const validateRequest: (schema: {
    body?: Joi.ObjectSchema;
    query?: Joi.ObjectSchema;
    params?: Joi.ObjectSchema;
}) => (req: Request, res: Response, next: NextFunction) => void;
export declare const authValidation: {
    register: {
        body: Joi.ObjectSchema<any>;
    };
    login: {
        body: Joi.ObjectSchema<any>;
    };
};
export declare const postValidation: {
    create: {
        body: Joi.ObjectSchema<any>;
    };
    update: {
        body: Joi.ObjectSchema<any>;
        params: Joi.ObjectSchema<any>;
    };
    getById: {
        params: Joi.ObjectSchema<any>;
    };
    delete: {
        params: Joi.ObjectSchema<any>;
    };
    getList: {
        query: Joi.ObjectSchema<any>;
    };
};
//# sourceMappingURL=validation.d.ts.map