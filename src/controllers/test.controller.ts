import { waterfall } from 'async';
import { Request, Response } from 'express';
import { responseOk, responseBadRequest } from '../helpers/response';

const healthCheck = (req: Request, res: Response): void => {
  res.json(200).json({
    result: true,
    message: 'API server is still intact.'
  });
};

const testWaterfall = (req: Request, res: Response): void => {
  try {
    waterfall([
      (done: (err: Error, param: number) => void): void => {
        done(null, 10);
      },
      (numA: number, done: (err: Error, param: number) => void) => {
        done(null, numA + 20);
      },
      (numB: number, done: (err: Error, param: number) => void): void => {
        done(null, numB + 30);
      }
    ], (err: Error, finalResult: number) => {
      res.status(err ? 400 : 200).json({
        result: finalResult,
        error: err,
      });
    })
  } catch (e) {
    let errMessage = 'Something went wrong';
    if (e instanceof Error) {
      errMessage = e.message;
    }
    res.status(500).json({
      result: false,
      message: errMessage
    });
  }
};

const testResponse = (req: Request, res: Response): void => {
  try {
    if (req.query.id !== '1') {
      throw new Error('You are not allowed');
    }
    responseOk(res);
  } catch (e) {
    return responseBadRequest(res, e.message);
  }

  console.log('Something done after try catch');
};

export { healthCheck, testWaterfall, testResponse };
