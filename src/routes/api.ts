import { Router } from 'express';

import { AuthController, TestController } from '../controllers';
import { jwtMiddleware } from '../middleware';
import {
  loginValidator, passwordRecoveryValidator, registerValidator, resetPasswordValidator,
  validateReqBody
} from '../validators';

const routes = (): Router => {
  const router = Router();

  /**
   * API ENDPOINT URL MUST BE KEBAB-CASE (/any-api-endpoint) ONLY!!!
   */
  router.get('/health', TestController.healthCheck);

  /**
   * AUTH
   */
  router.post('/auth/login', [...loginValidator, validateReqBody], AuthController.postLogin);
  router.post('/auth/logout', [...jwtMiddleware], AuthController.postLogout);
  router.post('/auth/forgot-password', [...passwordRecoveryValidator, validateReqBody], AuthController.postForgotPassword);
  router.post('/auth/reset-password', [...resetPasswordValidator, validateReqBody], AuthController.postResetPassword);
  router.post('/auth/refresh', [...jwtMiddleware], AuthController.postRefreshToken);

  /**
   * USER
   */
  router.post('/user/register', [...registerValidator, validateReqBody], AuthController.postRegister);
  router.get('/user/me', [...jwtMiddleware], AuthController.getMe);

  /**
   * TEST
   */
  router.get('/test', TestController.testResponse);

  return router;
};

export default routes;
