/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from 'express';

const response = (res: Response, status: number, data: unknown = null, message: string = null, error: any = null): void => {
  res.status(status).json({
    result: status === 200,
    data,
    message,
    error,
  })
}

export const responseOk = (res: Response, data: unknown = null, message: string = null): void => response(res, 200, data, message);

export const responseBadRequest = (res: Response, message = 'Bad Request', error: any = null): void => response(res, 400, null, message, error);

export const responseUnAuthenticated = (res: Response, message = 'Unauthenticated'): void => response(res, 401, null, message);

export const responseUnAuthorized = (res: Response, message = 'Unauthorized'): void => response(res, 403, null, message);

export const responseServerError = (res: Response, message = 'Internal Server Error', error: any = null): void => response(res, 500, null, message, error);
