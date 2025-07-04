import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateRequest = (schema: {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validationErrors: string[] = [];

    if (schema.body) {
      const { error } = schema.body.validate(req.body);
      if (error) {
        validationErrors.push(...error.details.map(detail => detail.message));
      }
    }

    if (schema.query) {
      const { error } = schema.query.validate(req.query);
      if (error) {
        validationErrors.push(...error.details.map(detail => detail.message));
      }
    }

    if (schema.params) {
      const { error } = schema.params.validate(req.params);
      if (error) {
        validationErrors.push(...error.details.map(detail => detail.message));
      }
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: '입력 데이터가 올바르지 않습니다.',
        errors: validationErrors,
      });
    }

    next();
  };
};

export const authValidation = {
  register: {
    body: Joi.object({
      email: Joi.string().email().required().messages({
        'string.email': '올바른 이메일 형식을 입력해주세요.',
        'any.required': '이메일은 필수 입력 항목입니다.',
      }),
      password: Joi.string().min(6).required().messages({
        'string.min': '비밀번호는 최소 6자 이상이어야 합니다.',
        'any.required': '비밀번호는 필수 입력 항목입니다.',
      }),
      name: Joi.string().min(2).max(50).required().messages({
        'string.min': '이름은 최소 2자 이상이어야 합니다.',
        'string.max': '이름은 최대 50자까지 입력 가능합니다.',
        'any.required': '이름은 필수 입력 항목입니다.',
      }),
      familyName: Joi.string().min(2).max(50).optional().messages({
        'string.min': '가족 이름은 최소 2자 이상이어야 합니다.',
        'string.max': '가족 이름은 최대 50자까지 입력 가능합니다.',
      }),
      inviteCode: Joi.string().optional().messages({
        'string.base': '초대 코드는 문자열이어야 합니다.',
      }),
    }),
  },
  login: {
    body: Joi.object({
      email: Joi.string().email().required().messages({
        'string.email': '올바른 이메일 형식을 입력해주세요.',
        'any.required': '이메일은 필수 입력 항목입니다.',
      }),
      password: Joi.string().required().messages({
        'any.required': '비밀번호는 필수 입력 항목입니다.',
      }),
    }),
  },
};