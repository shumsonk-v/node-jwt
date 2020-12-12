import { Request } from 'express';
import { AuthTokenScheme } from '../middleware/jwt';
import { UserDocument } from '../models/user';
import { LoginPayload } from '../models';

export const getAuthTokenFromHeader = (req: Request): string => {
  const authScheme = process.env.AUTH_SCHEME || AuthTokenScheme.Bearer;
  const token = req.headers['authorization'];
  const schemeRegex = new RegExp(`(${authScheme})\s`, 'i');
  return token ? token.replace(schemeRegex, '') : '';
};

export const getUserPayload = (user: UserDocument): LoginPayload => {
  if (!user) {
    return null;
  }

  const { email, profile, role } = user;
  return {
    email,
    profile,
    role,
  };
};