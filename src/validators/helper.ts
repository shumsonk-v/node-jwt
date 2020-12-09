/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import { ValidationError, validationResult } from 'express-validator';
import { responseBadRequest } from '../helpers/response';

interface ValidationErrorResult {
  value: string;
  param: string;
  message: string;
}

const errorFormatter = ({ msg, param, value }: ValidationError) => {
  return {
    value,
    param,
    message: msg
  };
};

export const validateReqBody = (req: Request, res: Response, next: NextFunction): unknown => {
  const vErrors = validationResult(req).formatWith<ValidationErrorResult>(errorFormatter);
  if (!vErrors.isEmpty()) {
    const validationErrors = vErrors.array().reduce((cur: ValidationErrorResult[], acc: ValidationErrorResult) => {
      if (!cur.find((ve) => ve.param === acc.param)) {
        cur.push(acc);
      }
      return cur;
    }, []);

    return responseBadRequest(res, 'Invalid request', validationErrors);
  }

  next();
};
