import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const validateReqBody = (req: Request, res: Response, next: NextFunction): unknown => {
  const vErrors = validationResult(req);
  if (!vErrors.isEmpty()) {
    return res.status(400).json({
      result: false,
      data: null,
      message: 'Invalid request'
    });
  }

  next();
};
