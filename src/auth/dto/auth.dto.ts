import * as Joi from 'joi';

export const LoginAdminSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const ChangePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(6).required(),
  newPassword: Joi.string().min(6).required(),
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Confirm password must match new password',
    }),
});

export class AuthDto {
  email: string;
  role: string;
  id: string;
  roleId: string;
}

// Unified login schema that accepts either email or username
export const UnifiedLoginSchema = Joi.object({
  identifier: Joi.string().required().messages({
    'string.empty': 'Email or username is required',
    'any.required': 'Email or username is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required',
  }),
});
