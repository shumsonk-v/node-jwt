import bcrypt from 'bcrypt-nodejs';
import mongoose, { Schema } from 'mongoose';

export interface AuthToken {
  accessToken: string;
  expiresAt: number;
  generatedAt: number;
}

export interface UserProfile {
  displayName?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  picture?: string;
  language: string;
}

export enum UserRole {
  SuperAdmin = 1,
  Admin = 2,
  User = 3
}

export enum AccountStatus {
  Active = 1,
  Inactive = 2
}

export type UserAccount = {
  email: string;
  password: string;
  passwordResetToken: string;
  passwordResetExpires: number;
  tokens: AuthToken[];
  role: UserRole;
  status: number;
  profile: UserProfile;
}

export type UserDocument = mongoose.Document & UserAccount & {
  comparePassword: comparePasswordFunction;
  gravatar: (size: number) => string;
};

type comparePasswordFunction = (candidatePassword: string, cb: (err: Error, isMatch: boolean) => unknown) => void;

/**
 * Create User schema
 */
const userSchema = new Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  passwordResetToken: String,
  passwordResetExpires: Number,

  tokens: Array,
  role: Number,
  status: Number,

  profile: {
    displayName: String,
    firstName: String,
    middleName: String,
    lastName: String,
    picture: String,
    language: String,
  }
}, { timestamps: true });

/**
 * Password hash middleware.
 */
userSchema.pre('save', function save(next) {
  const user = this as UserDocument;
  if (!user.isModified('password')) { return next(); }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(user.password, salt, undefined, (err: mongoose.Error, hash) => {
      if (err) { return next(err); }
      user.password = hash;
      next();
    });
  });
});

const comparePassword: comparePasswordFunction = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err: mongoose.Error, isMatch: boolean) => {
    cb(err, isMatch);
  });
};

userSchema.methods.comparePassword = comparePassword;

export const User = mongoose.model<UserDocument>('User', userSchema);
