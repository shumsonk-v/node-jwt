import { Request, Response } from 'express';

/**
 * GET /
 * Home page.
 */
const index = (req: Request, res: Response): void => {
  res.render('home', {
    title: 'Home'
  });
};

export { index };
