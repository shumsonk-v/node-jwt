import { Router } from 'express';

import { AuthController, TestController, UserController } from '../controllers';
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
  router.post('/auth/login', [...loginValidator, validateReqBody], AuthController.login);
  router.post('/auth/logout', [...jwtMiddleware], AuthController.logout);
  router.post('/auth/forgot-password', [...passwordRecoveryValidator, validateReqBody], AuthController.forgotPassword);
  router.post('/auth/reset-password', [...resetPasswordValidator, validateReqBody], AuthController.resetPassword);
  router.post('/auth/refresh', [...jwtMiddleware], AuthController.postRefreshToken);

  /**
   * USER
   */
  router.post('/user/register', [...registerValidator, validateReqBody], UserController.createUser);
  router.get('/user/me', [...jwtMiddleware], UserController.me);

  /**
   * TEST
   */
  router.get('/test', TestController.testResponse);

  return router;
};

export default routes;
