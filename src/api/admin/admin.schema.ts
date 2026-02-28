import Joi from 'joi';

export const CreateAdminSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role_id: Joi.string().required(),
});
