import { AuthToken, UserProfile, UserRole } from './user';

export interface IAppRequest {
  decodedJwt?: Record<string, unknown>;
}

export interface LoginPayload {
  email: string;
  profile: UserProfile;
  role: UserRole;
}

export interface LoginToken {
  token: AuthToken;
  payload: LoginPayload;
}