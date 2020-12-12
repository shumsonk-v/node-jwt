import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import passport from 'passport';
import { IAppRequest } from './../models/auth';
import { responseUnAuthenticated } from '../helpers/response';
import { UserDocument } from '../models/user';

export enum AuthTokenScheme {
  Bearer = 'Bearer',
  Jwt = 'Jwt'
}

const extractAccessToken = (token: string, authScheme: string): string => {
  if (!token) {
    return '';
  }

  if (!authScheme) {
    return token;
  }

  const authSchemeRegex = new RegExp('^(' + authScheme + ')\\s', 'gi');
  const headerToken = token.replace(authSchemeRegex, '');
  return headerToken;
};

const jwtValidateToken = (req: Request & IAppRequest, res: Response, next: NextFunction): void => {
  const accessToken = req.headers.authorization;

  if (!accessToken) {
    return responseUnAuthenticated(res);
  }

  const authScheme = process.env.AUTH_SCHEME || AuthTokenScheme.Bearer;
  const extractedToken = extractAccessToken(accessToken, authScheme);

  // Check if requested user has requested with the same token but it is already expired or logged out
  if (req.user) {
    const existingToken = (req.user as UserDocument).tokens.find((token) => token.accessToken === extractedToken);
    if (!existingToken) {
      return responseUnAuthenticated(res);
    }
  }

  jwt.verify(extractedToken, process.env.JWT_SECRET, (err: jwt.VerifyErrors, decoded: Record<string, unknown>) => {
    if (err) {
      return responseUnAuthenticated(res, 'Invalid token');
    }

    req.decodedJwt = decoded;
    next();
  });
};

export const jwtMiddleware = [passport.authenticate('jwt', { session: false }), jwtValidateToken];
