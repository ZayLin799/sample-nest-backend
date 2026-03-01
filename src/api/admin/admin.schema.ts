import Joi from 'joi';

export const CreateAdminSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role_id: Joi.string().optional(),
});

export const UpdateAdminSchema = Joi.object({
  username: Joi.string().min(3).max(30).optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional().allow(''),
  role_id: Joi.string().optional(),
});
