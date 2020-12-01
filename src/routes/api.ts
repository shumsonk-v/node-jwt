import { Router } from 'express';
import { jwtMiddleware } from './../middleware';

import { TestController, AuthController } from './../controllers';
import { loginValidator, validateReqBody } from './../validators'

const routes = (): Router => {
  const router = Router();

  /**
   * API ENDPOINT URL MUST BE KEBAB-CASE (/any-api-endpoint) ONLY!!!
   */
  router.get('/health', TestController.healthCheck);

  /**
   * AUTH
   */
  router.post('/login', [...loginValidator, validateReqBody], AuthController.postLogin);
  router.post('/logout', [jwtMiddleware], AuthController.postLogout);
  router.post('/register', [validateReqBody], AuthController.postRegister);
  router.post('/forgot-password', [validateReqBody], AuthController.postForgotPassword);
  router.post('/reset-password', [validateReqBody], AuthController.postResetPassword);
  router.post('/auth/refresh', [validateReqBody], AuthController.postRefreshToken);
  router.get('/me', [jwtMiddleware], AuthController.getMe);

  return router;
};

export default routes;
