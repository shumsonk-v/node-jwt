import { body } from 'express-validator';
import { UserRole } from '../models/user';

export const loginValidator = [
  body('username')
    .exists({ checkFalsy: true })
    .withMessage('Username is required')
    .normalizeEmail({ gmail_remove_dots: false })
    .isEmail().withMessage('Invalid username'),
  body('password')
    .exists({ checkFalsy: true }).withMessage('Password is required')
];

export const registerValidator = [
  body('email')
    .exists({ checkFalsy: true }).withMessage('E-mail is required')
    .normalizeEmail({ gmail_remove_dots: false })
    .isEmail().withMessage('Invalid e-mail'),
  body('password')
    .exists({ checkFalsy: true }).withMessage('Password is required'),
  body('passwordConfirmation')
    .exists({ checkFalsy: true }).withMessage('Password confirmation is required')
    .custom(async (confirmPassword, { req }) => {
      if (req.body.password !== confirmPassword) {
        throw new Error('Invalid password confirmation')
      }
    }),
  body('firstName')
    .exists({ checkFalsy: true }).withMessage('Firstname is required'),
  body('lastName')
    .exists({ checkFalsy: true }).withMessage('Lastname is required'),
  body('role')
    .exists({ checkFalsy: true }).withMessage('Role is required')
    .isIn([UserRole.Admin, UserRole.User]).withMessage('Role is invalid, only admin and user roles are allowed to be registered'),
];

export const passwordRecoveryValidator = [
  body('email')
    .exists({ checkFalsy: true })
    .withMessage('E-mail is required')
    .normalizeEmail({ gmail_remove_dots: false })
    .isEmail().withMessage('Invalid e-mail'),
];

export const resetPasswordValidator = [
  body('token')
    .exists({ checkFalsy: true }).withMessage('Token is required'),
  body('password')
    .exists({ checkFalsy: true }).withMessage('Password is required'),
  body('passwordConfirmation')
    .exists({ checkFalsy: true }).withMessage('Password confirmation is required')
    .custom(async (confirmPassword, { req }) => {
      if (req.body.password !== confirmPassword) {
        throw new Error('Invalid password confirmation')
      }
    }),
];