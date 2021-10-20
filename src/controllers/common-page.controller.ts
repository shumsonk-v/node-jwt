import { Request, Response } from 'express';

/**
 * GET /
 */
const notFound = (req: Request, res: Response): void => {
  res.render('not-found', {
    title: 'Page Not Found',
  });
};

export { notFound };
