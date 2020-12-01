import { Router } from 'express';

import { HomeController, AuthController } from './../controllers';

const routes = (): Router => {
  const router = Router();

  /**
   * URL ALWAYS HAS TO BE KEBAB CASE (kebab-case)!!!
   */
  router.get('/', HomeController.index);
  router.get('/login', AuthController.getLogin);
  router.get('/register', AuthController.getLogin);
  router.get('/forgot-password', AuthController.getLogin);
  router.get('/reset-password', AuthController.getLogin);

  return router;
};

export default routes;
