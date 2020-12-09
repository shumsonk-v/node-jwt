import { NextFunction, Request, Response } from 'express';
import camelcaseKeys = require('camelcase-keys');

export const camelCaseRequestTransformer = () => {
  return (req: Request, res: Response, next: NextFunction): void => {
    req.body = camelcaseKeys(req.body, { deep: true });
    req.params = camelcaseKeys(req.params);
    req.query = camelcaseKeys(req.query);
    next();
  };
};
