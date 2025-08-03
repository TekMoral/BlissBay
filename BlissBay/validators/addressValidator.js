import pkg from 'joi';
const Joi = pkg;

export const addressSchema = Joi.object({
  userId: Joi.string().hex().length(24).required(), // ObjectId validation
  street: Joi.string().min(3).max(100).required(),
  city: Joi.string().min(3).max(50).required(),
  state: Joi.string().min(3).max(50).required(),
  country: Joi.string().min(3).max(50).required(),
  isDefault: Joi.boolean().optional(),
});
