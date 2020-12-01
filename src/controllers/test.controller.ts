import { Request, Response } from 'express';

const healthCheck = (req: Request, res: Response): void => {
  res.json(200).json({
    result: true,
    message: 'API server is still intact.'
  });
};

export { healthCheck };