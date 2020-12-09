import { Request } from 'express';

export const getAuthTokenFromHeader = (req: Request): string => {
  const authScheme = process.env.AUTH_SCHEME || 'bearer';
  const token = req.headers['authorization'];
  const schemeRegex = new RegExp(`${authScheme.toLowerCase()}\s`, 'i');
  return token ? token.replace(schemeRegex, '') : '';
};
