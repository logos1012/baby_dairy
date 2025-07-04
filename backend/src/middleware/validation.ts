import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateRequest = (schema: {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
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
      res.status(400).json({
        success: false,
        message: '입력 데이터가 올바르지 않습니다.',
        errors: validationErrors,
      });
      return;
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

export const postValidation = {
  create: {
    body: Joi.object({
      content: Joi.string().min(1).max(2000).required().messages({
        'string.min': '내용을 입력해주세요.',
        'string.max': '내용은 최대 2000자까지 입력 가능합니다.',
        'any.required': '내용은 필수 입력 항목입니다.',
      }),
      mediaUrls: Joi.array().items(Joi.string().uri()).optional().messages({
        'array.base': '미디어 URL은 배열이어야 합니다.',
        'string.uri': '올바른 URL 형식을 입력해주세요.',
      }),
      tags: Joi.array().items(Joi.string().max(20)).max(10).optional().messages({
        'array.base': '태그는 배열이어야 합니다.',
        'string.max': '태그는 최대 20자까지 입력 가능합니다.',
        'array.max': '태그는 최대 10개까지 추가할 수 있습니다.',
      }),
    }),
  },
  update: {
    body: Joi.object({
      content: Joi.string().min(1).max(2000).optional().messages({
        'string.min': '내용을 입력해주세요.',
        'string.max': '내용은 최대 2000자까지 입력 가능합니다.',
      }),
      mediaUrls: Joi.array().items(Joi.string().uri()).optional().messages({
        'array.base': '미디어 URL은 배열이어야 합니다.',
        'string.uri': '올바른 URL 형식을 입력해주세요.',
      }),
      tags: Joi.array().items(Joi.string().max(20)).max(10).optional().messages({
        'array.base': '태그는 배열이어야 합니다.',
        'string.max': '태그는 최대 20자까지 입력 가능합니다.',
        'array.max': '태그는 최대 10개까지 추가할 수 있습니다.',
      }),
    }),
    params: Joi.object({
      id: Joi.string().required().messages({
        'any.required': '게시물 ID가 필요합니다.',
      }),
    }),
  },
  getById: {
    params: Joi.object({
      id: Joi.string().required().messages({
        'any.required': '게시물 ID가 필요합니다.',
      }),
    }),
  },
  delete: {
    params: Joi.object({
      id: Joi.string().required().messages({
        'any.required': '게시물 ID가 필요합니다.',
      }),
    }),
  },
  getList: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1).messages({
        'number.base': '페이지는 숫자여야 합니다.',
        'number.integer': '페이지는 정수여야 합니다.',
        'number.min': '페이지는 1 이상이어야 합니다.',
      }),
      limit: Joi.number().integer().min(1).max(50).default(10).messages({
        'number.base': '제한은 숫자여야 합니다.',
        'number.integer': '제한은 정수여야 합니다.',
        'number.min': '제한은 1 이상이어야 합니다.',
        'number.max': '제한은 50 이하여야 합니다.',
      }),
      tags: Joi.string().optional().messages({
        'string.base': '태그는 문자열이어야 합니다.',
      }),
      author: Joi.string().optional().messages({
        'string.base': '작성자는 문자열이어야 합니다.',
      }),
      search: Joi.string().optional().messages({
        'string.base': '검색어는 문자열이어야 합니다.',
      }),
    }),
  },
};