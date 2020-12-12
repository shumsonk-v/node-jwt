import { AuthTokenScheme } from '../middleware/jwt';
/* eslint-disable @typescript-eslint/no-explicit-any */
export const commonReqHeader = {
  Accept: 'application/json'
};

const authScheme = process.env.AUTH_SCHEME || AuthTokenScheme.Bearer;
export const authReqHeader = (authToken: string): any => Object.assign({}, commonReqHeader, {
  Authorization: `${authScheme} ${authToken}`
});