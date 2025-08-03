import pkg from 'joi';
const Joi = pkg;
import mongoose from 'mongoose';

const objectIdValidator = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};

export const cartItemSchema = Joi.object({
  productId: Joi.string().custom(objectIdValidator, 'ObjectId validation').required(),
  quantity: Joi.number().integer().min(0).required()
});
