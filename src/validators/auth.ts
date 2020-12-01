import { body } from 'express-validator';

export const loginValidator = [
  body('email')
    .exists()
    .withMessage('E-mail is required')
    .trim()
    .normalizeEmail({ gmail_remove_dots: false })
    .isEmail().withMessage('Invalid e-mail'),
  body('password')
    .exists().withMessage('Password is required')
    .trim()
    .isLength({ min: 1 }).withMessage('Password is required')
];
