import { Request } from 'express';
import { AuthTokenScheme } from '../middleware/jwt';

export const getAuthTokenFromHeader = (req: Request): string => {
  const authScheme = process.env.AUTH_SCHEME || AuthTokenScheme.Bearer;
  const token = req.headers['authorization'];
  const schemeRegex = new RegExp(`(${authScheme})\s`, 'i');
  return token ? token.replace(schemeRegex, '') : '';
};
