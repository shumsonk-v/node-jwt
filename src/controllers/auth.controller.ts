import crypto from 'crypto';
import dayjs, { Dayjs } from 'dayjs';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import passport from 'passport';
import { IVerifyOptions } from 'passport-local';

import {
  getAuthTokenFromHeader, getMailTransporter, getParsedEmailMessage,
  getUserPayload,
  responseBadRequest, responseOk
} from '../helpers';
import { isTestEnv } from '../helpers/app';
import { LoginPayload, LoginToken } from '../models';
import {
  AccountStatus, AuthToken, User, UserDocument
} from '../models/user';

// ------- Helpers -------
const generateSignedToken = (user: UserDocument): LoginToken => {
  const userPayload: LoginPayload = getUserPayload(user);
  const tokenGenerateDate = Date.now();
  const tokenExpiresDate: Dayjs = dayjs(tokenGenerateDate + Number(process.env.JWT_EXPIRATION_MS));
  const accessToken = jwt.sign(userPayload, process.env.JWT_SECRET, {
    expiresIn: tokenExpiresDate.valueOf(),
    audience: process.env.JWT_AUDIENCE,
    issuer: process.env.JWT_ISSUER
  });

  return {
    token: {
      accessToken,
      generatedAt: tokenGenerateDate,
      expiresAt: tokenExpiresDate.valueOf(),
    },
    payload: userPayload,
  };
};

const performUserLogin = async (req: Request, res: Response, user: UserDocument): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await req.logIn(user, (err) => {
      if (err) throw err;
    });

    const loginToken: LoginToken = generateSignedToken(user);
    user.tokens.push(loginToken.token);
    await user.save();

    session.commitTransaction();
    responseOk(res, {
      ...loginToken.payload,
      accessToken: loginToken.token.accessToken,
    });
  } catch (e) {
    session.abortTransaction();
    responseBadRequest(res, e);
  } finally {
    session.endSession();
  }
};

const getPasswordRecoveryToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// ------- Web Routing -------
const getLogin = (req: Request, res: Response): void => {
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

const getForgotPassword = (req: Request, res: Response): void => {
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


// ------- API Routing -------
const login = (req: Request, res: Response, next: NextFunction): void => {
  passport.authenticate('local', async (err: Error, user: UserDocument, info: IVerifyOptions) => {
    let errMessage = '';
    if (err) {
      errMessage = err.message;
    } else if (!user) {
      errMessage = info.message;
    } else if (user.status !== AccountStatus.Active) {
      errMessage = 'Account is inactive';
    }

    if (errMessage) {
      return responseBadRequest(res, errMessage);
    }

    await performUserLogin(req, res, user);
  })(req, res, next);
};

const logout = async (req: Request, res: Response): Promise<void> => {
  const user = req.user as UserDocument;
  if (!user) {
    return responseBadRequest(res);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Remove requested token from the list
    const accessToken = getAuthTokenFromHeader(req);
    const existingTokens = user.tokens;
    user.tokens = existingTokens.filter((token: AuthToken) => token.accessToken === accessToken);

    await user.save();

    req.logOut();
    responseOk(res);
  } catch (e) {
    session.abortTransaction();
    responseBadRequest(res, e);
  } finally {
    session.endSession();
  }
};

const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get password recovery token
    const passRecoveryToken = getPasswordRecoveryToken();

    // Find existing user and save the token to that record
    const existingUser: UserDocument = await User.findOne({ email: req.body.email });
    if (!existingUser) {
      throw new Error('Could not find user with given e-mail');
    }
    existingUser.passwordResetToken = passRecoveryToken;
    existingUser.passwordResetExpires = dayjs(Date.now() + 3600000).valueOf();
    await existingUser.save();

    let respData = null;
    if (isTestEnv) {
      respData = {
        token: passRecoveryToken
      };
    } else {
      // Start mail sending process
      const transporter = getMailTransporter();
      if (!transporter) {
        throw new Error('Error getting e-mail service settings.');
      }
      const emailContent = getParsedEmailMessage('password-recovery.html', {
        RESET_PASSWORD_LINK: `${process.env.APP_URL}/reset-password?t=${passRecoveryToken}`,
        RESET_PASSWORD_SENDER_NAME: process.env.MAIL_SYS_SENDER_NAME
      });
      if (!emailContent) {
        throw new Error('Failed to obtain e-mail template');
      }
      const mailOptions = {
        to: req.body.email,
        from: process.env.MAIL_SENDER_EMAIL,
        subject: process.env.MAIL_RESET_PASSWORD_SUBJECT,
        html: emailContent
      };
      await transporter.sendMail(mailOptions);
    }

    session.commitTransaction();
    responseOk(res, respData);
  } catch (e) {
    session.abortTransaction();

    let errorMessage = 'Something went wrong while processing password recovery request';
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    responseBadRequest(res, errorMessage);
  } finally {
    session.endSession();
  }
};

const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingUser: UserDocument = await User.findOne({ passwordResetToken: req.body.token });
    if (!existingUser) {
      throw new Error('Invalid reset password info');
    }

    if (dayjs().isAfter(dayjs(existingUser.passwordResetExpires))) {
      throw new Error('Password recovery session is expired');
    }

    existingUser.password = req.body.password;
    existingUser.passwordResetToken = null;
    existingUser.passwordResetExpires = null;
    await existingUser.save();

    session.commitTransaction();
    responseOk(res);
  } catch (e) {
    session.abortTransaction();

    let errorMessage = 'Something went wrong while processing password recovery request';
    if (e instanceof Error) {
      errorMessage = e.message;
    }

    responseBadRequest(res, errorMessage);
  } finally {
    session.endSession();
  }
};

const postRefreshToken = (req: Request, res: Response): void => {
  res.send(404).json({
    result: false,
    message: 'Under development'
  });
};

export {
  getLogin, getRegister, getForgotPassword, getResetPassword,
  login, logout, forgotPassword, resetPassword, postRefreshToken,
};
