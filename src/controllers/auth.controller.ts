import { waterfall } from 'async';
import crypto from 'crypto';
import dayjs, { Dayjs } from 'dayjs';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import passport from 'passport';
import { IVerifyOptions } from 'passport-local';

import { commitWithRetry, getAuthTokenFromHeader, getMailTransporter, getParsedEmailMessage, responseBadRequest, responseOk } from '../helpers';
import { AccountStatus, AuthToken, User, UserDocument, UserProfile, UserRole } from '../models/user';
import { LoginToken, LoginPayload } from '../models';


// ------- Helpers
const getUserPayload = (user: UserDocument): LoginPayload => {
  if (!user) {
    return null;
  }

  const { email, profile, role } = user;
  return {
    email,
    profile,
    role,
  };
};

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

const performUserLogin = (req: Request, res: Response, user: UserDocument): void => {
  req.logIn(user, (e) => {
    if (e) {
      return responseBadRequest(res, e);
    }

    // Generate signed token to be returned in response
    const loginToken: LoginToken = generateSignedToken(user);

    // Add current token to the list
    user.tokens.push(loginToken.token);

    user.save((userSaveErr?) => {
      if (userSaveErr) {
        return responseBadRequest(res, userSaveErr);
      }

      responseOk(res, Object.assign({}, loginToken.payload, {
        accessToken: loginToken.token.accessToken,
      }));
    });
  });
};

const getPasswordRecoveryToken = (done: (token: string) => void): void => {
  crypto.randomBytes(32, (err, buf) => {
    const token = buf.toString('hex');
    if (err) {
      throw err;
    }
    done(token);
  });
};

const sendPasswordRecoveryEmail = (token: AuthToken, user: UserDocument, done: () => void): void => {
  const transporter = getMailTransporter();
  if (!transporter) {
    throw new Error('Error getting e-mail service settings.');
  }

  const mailOptions = {
    to: user.email,
    from: process.env.MAIL_SENDER_EMAIL,
    subject: 'Test Subject',
    html: 'test'
  };
  transporter.sendMail(mailOptions, (err: Error) => {
    if (err) {
      throw err;
    }
    done();
  });
}

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
const postLogin = (req: Request, res: Response, next: NextFunction): void => {
  passport.authenticate('local', { session: false }, (err: Error, user: UserDocument, info: IVerifyOptions) => {
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

    performUserLogin(req, res, user);
  })(req, res, next);
};

const postLogout = (req: Request, res: Response): void => {
  const user = req.user as UserDocument;
  if (!user) {
    return responseBadRequest(res);
  }

  // Remove requested token from the list
  const accessToken = getAuthTokenFromHeader(req);
  const existingTokens = user.tokens;
  user.tokens = existingTokens.filter((token: AuthToken) => token.accessToken === accessToken);

  user.save((userSaveErr?) => {
    if (userSaveErr) {
      return responseBadRequest(res, userSaveErr);
    }

    req.logOut();
    responseOk(res);
  });
};

const postRegister = async (req: Request, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const newUser = new User({
      email: req.body.email,
      password: req.body.password,
      role: req.body.role,
      status: AccountStatus.Active,
      profile: {
        displayName: req.body.displayName,
        firstName: req.body.firstName,
        middleName: req.body.middleName,
        lastname: req.body.lastName,
        language: req.body.language
      }
    });

    User.findOne({ email: req.body.email }, (err, existingUser) => {
      if (err) {
        throw new Error(err);
      }
      if (existingUser) {
        throw new Error('This e-mail has already been used');
      }

      const loginToken: LoginToken = generateSignedToken(newUser);
      const loginAfterRegister = !!req.body.loginAfterRegister;
      if (loginAfterRegister) {
        newUser.tokens.push(loginToken.token);
      }

      newUser.save((saveUserErr) => {
        if (err) {
          throw new Error(saveUserErr);
        }

        if (!loginAfterRegister) {
          responseOk(res);
        } else {
          req.logIn(newUser, (e) => {
            const respMessage = !!e ? 'User account has been created but there was an error logging in the user.' : '';
            const respData = Object.assign({}, loginToken.payload, {
              accessToken: loginToken.token.accessToken,
            });
            responseOk(res, respData, respMessage);
          });
        }
      });
    });
  } catch (e) {
    session.abortTransaction();
    session.endSession();

    let errorMessage = 'Something went wrong while registering new user';
    if (e instanceof Error) {
      errorMessage = e.message;
    }

    return responseBadRequest(res, errorMessage);
  }

  commitWithRetry(session);
};

const postForgotPassword = async (req: Request, res: Response): Promise<void> => {
  const session = await mongoose.startSession();

  try {
    waterfall([
      getPasswordRecoveryToken,
      (token: string, done: (token?: string, user?: UserDocument) => void): void => {
        User.findOne({ email: req.body.email }, (err, user: UserDocument) => {
          if (err || !user) {
            throw new Error('An error occurred while processing user.')
          }

          user.passwordResetToken = token;
          user.passwordResetExpires = dayjs(Date.now() + 3600000).valueOf();
          user.save((err: Error) => {
            if (err) {
              throw err;
            }

            done(token);
          });
        });
      },
      (token: AuthToken, done: () => void): void => {
        const transporter = getMailTransporter();
        if (!transporter) {
          throw new Error('Error getting e-mail service settings.');
        }

        const emailContent = getParsedEmailMessage('password-recovery.html', {
          RESET_PASSWORD_LINK: `${process.env.APP_URL}/reset-password?t=${token}`,
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
        transporter.sendMail(mailOptions, (err: Error) => {
          if (err) {
            throw err;
          }
          done();
        });
      },
    ], async () => {
      await session.commitTransaction();
      session.endSession();
      responseOk(res, {
        result: true,
      });
    })
  } catch (e) {
    await session.abortTransaction();
    session.endSession();

    let errorMessage = 'Something went wrong while processing password recovery request';
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    responseBadRequest(res, errorMessage);
  }
};

const postResetPassword = async (req: Request, res: Response): Promise<void> => {
  const session = await mongoose.startSession();

  try {
    User.findOne({ passwordResetToken: req.body.token }, (err, user: UserDocument) => {
      if (err || !user) {
        throw new Error('An error occurred while processing password recovery.');
      }

      if (dayjs().isAfter(dayjs(user.passwordResetExpires))) {
        throw new Error('Password recovery session is expired');
      }

      user.password = req.body.password;
      user.passwordResetToken = null;
      user.passwordResetExpires = null;

      user.save(async (err: Error) => {
        if (err) {
          throw err;
        }

        await session.commitTransaction();
        session.endSession();
        responseOk(res);
      });
    });
  } catch (e) {
    await session.abortTransaction();
    session.endSession();

    let errorMessage = 'Something went wrong while processing password recovery request';
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    responseBadRequest(res, errorMessage);
  }
};

const postRefreshToken = (req: Request, res: Response): void => {
  res.send(404).json({
    result: false,
    message: 'Under development'
  });
};

const getMe = (req: Request, res: Response): void => {
  const user = req.user as UserDocument;
  if (!user) {
    return responseBadRequest(res, 'User not found');
  }

  responseOk(res, getUserPayload(user));
};

export {
  getLogin, postLogin, postLogout,
  getRegister, postRegister,
  getForgotPassword, postForgotPassword,
  getResetPassword, postResetPassword,
  postRefreshToken,
  getMe,
};
