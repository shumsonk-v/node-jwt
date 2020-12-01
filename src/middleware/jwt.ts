import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import passport from 'passport';
import { IAppRequest } from './../models/auth';

enum TOKEN_TYPE {
  BEARER = 'BEARER',
  JWT = 'JWT'
}

const extractAccessToken = (token: string, type: string): string => {
  if (!token) {
    return '';
  }

  switch (type) {
    case TOKEN_TYPE.BEARER: return token.replace(/^(bearer\s)/gi, '');
    case TOKEN_TYPE.JWT: return token.replace(/^(jwt\s)/gi, '');
    default: return token;
  }
};

export const jwtMiddleware = (req: Request & IAppRequest, res: Response, next: NextFunction): void => {
  passport.authenticate('jwt', { session: false }, (err, payload) => {
    const accessToken = req.headers['authorization'];

    if (err || !payload || !accessToken || !req.user) {
      return res.status(401).json({
        result: false,
        data: null,
        message: ''
      });
    }

    jwt.verify(extractAccessToken(accessToken, TOKEN_TYPE.BEARER), process.env.JWT_SECRET, (err: jwt.VerifyErrors, decoded: Record<string, unknown>) => {
      if (err) {
        return res.status(401).json({
          result: false,
          data: null,
          message: 'Invalid token'
        });
      }

      req.decodedJwt = decoded;
      next();
    });
  })(req, res, next);
};
