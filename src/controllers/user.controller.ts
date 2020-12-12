import { Request, Response } from 'express';
import mongoose from 'mongoose';

import { getUserPayload, responseBadRequest, responseOk } from '../helpers';
import { AccountStatus, User, UserDocument } from '../models/user';

const createUser = async (req: Request, res: Response): Promise<void> => {
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

    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      throw new Error('This e-mail has already been used');
    }

    await newUser.save();
    session.commitTransaction();
    responseOk(res);
  } catch (e) {
    session.abortTransaction();

    let errorMessage = 'Something went wrong while registering new user';
    if (e instanceof Error) {
      errorMessage = e.message;
    }

    responseBadRequest(res, errorMessage);
  } finally {
    session.endSession();
  }
};

const me = (req: Request, res: Response): void => {
  const user = req.user as UserDocument;
  if (!user) {
    return responseBadRequest(res, 'User not found');
  }

  responseOk(res, getUserPayload(user));
};


export { createUser, me };
