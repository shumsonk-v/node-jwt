import { Request, Response } from 'express';

const getLogin = (req: Request, res: Response): void => {
  res.send(404).json({
    result: false,
    message: 'Under development'
  });
};

const postLogin = (req: Request, res: Response): void => {
  res.send(404).json({
    result: false,
    message: 'Under development'
  });
};

const postLogout = (req: Request, res: Response): void => {
  res.send(404).json({
    result: false,
    message: 'Under development'
  });
};

const getRegister = (req: Request, res: Response): void => {
  res.send(404).json({
    result: false,
    message: 'Under development'
  });
};

const postRegister = (req: Request, res: Response): void => {
  res.send(404).json({
    result: false,
    message: 'Under development'
  });
};

const getForgotPassword = (req: Request, res: Response): void => {
  res.send(404).json({
    result: false,
    message: 'Under development'
  });
};

const postForgotPassword = (req: Request, res: Response): void => {
  res.send(404).json({
    result: false,
    message: 'Under development'
  });
};

const getResetPassword = (req: Request, res: Response): void => {
  res.send(404).json({
    result: false,
    message: 'Under development'
  });
};

const postResetPassword = (req: Request, res: Response): void => {
  res.send(404).json({
    result: false,
    message: 'Under development'
  });
};

const postRefreshToken = (req: Request, res: Response): void => {
  res.send(404).json({
    result: false,
    message: 'Under development'
  });
};

const getMe = (req: Request, res: Response): void => {
  res.send(404).json({
    result: false,
    message: 'Under development'
  });
};

export {
  getLogin, postLogin, postLogout,
  getRegister, postRegister,
  getForgotPassword, postForgotPassword,
  getResetPassword, postResetPassword,
  postRefreshToken,
  getMe,
};
