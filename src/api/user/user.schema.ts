import Joi from 'joi';

export const RegisterUserSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const LoginUserSchema = Joi.object({
  identifier: Joi.string().required(),
  password: Joi.string().required(),
});
